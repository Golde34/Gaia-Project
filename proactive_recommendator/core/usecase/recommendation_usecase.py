from typing import Any, Dict, List, Tuple

from core.abilities.ability_functions import PROVIDER_REGISTRY, PROMPT_CATEGORY
from core.domain.request.recommendation_request import RecommendationRequest
from core.domain.response.base_response import return_success_response
from core.service import user_information_service
from infrastructure.llm.interface import get_model_generate_content
from infrastructure.repository.graphdb import graph_expander
from infrastructure.repository.vectordb import command_label_repo


async def recommend(body: RecommendationRequest) -> str:
    """
    [Query -> seed labels] 
    -> [Vector DB]: Rank labels by relevance (Signals)
    -> [Graph Expander]: Expanded Labels (+weight, relations) (Compat)
    -> [Build Bundle]: JSON feature store, running providers in layers
    -> [Scoring/Policy]: Compat + Signals from bundle
    """
    try:
        ## Validate user information
        user_information = await user_information_service.get_user_information(body.user_id)
        if not user_information:
            return "Error: user not found"

        query_vecs = await command_label_repo.embedding_of_texts(body.query)
        results = await command_label_repo.rank_labels_by_relevance(body.query, query_vecs=query_vecs)
        seed_labels = [r['label'] for r in results]
        print("Seed labels: ", seed_labels)

        # After get the labels's relationships, usering PPR to compare
        expanded = await graph_expander.expand_labels(seed_labels=seed_labels, limit=5)
        expanded_labels = [l for (l, _, _) in expanded]
        print("expanded labels:", expanded_labels)

        bundle, llm_type = await _build_bundle(body.user_id, expanded_labels)
        print(f"Bundle: {bundle}")
        if llm_type not in PROMPT_CATEGORY:
            raise ValueError(f"LLM type {llm_type} not supported")

        prompt_template = PROMPT_CATEGORY[llm_type](bundle=str(bundle))
        function = await get_model_generate_content()
        response = function(prompt=prompt_template) 

        return return_success_response("Generate recommendation successfully", {"message": response}) 
    except Exception as e:
        return "Error: " + str(e) 


async def _build_bundle(user_id: str, labels: List[str]) -> tuple[Dict[str, Any], str]:
    provider_rows = await graph_expander.providers_for_labels(labels)
    bundle: Dict[str, Any] = {}
    llm_type = None

    for p in provider_rows:
        pname = p["name"]
        if pname not in PROVIDER_REGISTRY:
            continue
        
        llm_type = PROVIDER_REGISTRY[pname]['llm_type']
        fn = PROVIDER_REGISTRY[pname]['function']
        try:
            result = await fn(user_id=user_id)
            bundle[pname] = result
        except Exception as e:
            bundle[pname] = {"error": str(e)}

    return bundle, llm_type

# async def _validate_labels_information(user_id: int, results: List[str], first: str):
#     if ABILITIES[first]['is_sync'] == True:
#         # check in DB command is existed? 
#         # if not init command with status pending / init -> when consume data -> make it ok
#         pass
#     ABILITIES[first]['function'](user_id)
