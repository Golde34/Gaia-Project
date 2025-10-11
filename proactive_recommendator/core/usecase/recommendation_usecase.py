from typing import Any, Dict, List

from core.abilities.ability_functions import ABILITIES
from core.domain.request.recommendation_request import RecommendationRequest
from core.domain.response.base_response import return_success_response
from core.service import user_information_service
from infrastructure.repository.graphdb import graph_expander
from infrastructure.repository.vectordb import command_label_repo


async def recommend(body: RecommendationRequest) -> str:
    """
    [Query -> seed labels] 
    -> [Graph Expander]: Expanded Labels (+weight, relations)
    -> [Fetch Planner]: Label-driven providers with needs/ provides
    -> [Build Bundle]: JSON feature store, running providers in layers
    -> [Scoring/Policy]: Compat + Signals from bundle
    """
    try:
        ## Validate user information
        user_information = await user_information_service.get_user_information(body.user_id)
        if not user_information:
            return "Error: user not found"

        ## Get embedding vector of query
        query_vecs = await command_label_repo.embedding_of_texts(body.query)
         
        ## Get the main label
        results = await command_label_repo.rank_labels_by_relevance(body.query, query_vecs=query_vecs)
        seed_labels = [r['label'] for r in results]
        print("Seed labels: ", seed_labels)

        expanded = await graph_expander.expand_labels(seed_labels=seed_labels)
        print("Expanded: ",  expanded)
        expanded_labels = [l for (l, _, _) in expanded]
        print("expaned labels:", expanded_labels)

        bundle = await _build_bundle(body.user_id, expanded_labels)

        ## Parallel Fan-in
        # load_user_context(tasks, calendar, prefs) in cache
        # get_label_embeddings(from catalog)
        # -> combine: signals -> compat -> actions -> card

        # ctx = await get_user_context

        # recommendation_information = await _validate_labels_information(results)
        ## Get the data from graphDB 
        # Generate GraphDB query from LLM Model
        # After get the labels's relationships, usering PPR to compare
        ## Generate response using LLM model + do something before user needs, like, generate calendar, ... 
        return return_success_response("get the label when analyze query", results) 
        ## ...
    except Exception as e:
        return "Error: " + e 


async def _build_bundle(user_id: str, labels: List[str]) -> Dict[str, Any]:
    provider_rows = await graph_expander.providers_for_labels(labels)
    bundle: Dict[str, Any] = {}

    for p in provider_rows:
        pname = p["name"]
        if pname not in ABILITIES:
            continue
        fn = ABILITIES[pname]
        try:
            result = await fn(user_id=user_id, label=p["label"])
            bundle[pname] = result
        except Exception as e:
            bundle[pname] = {"error": str(e)}

    return bundle

# async def _validate_labels_information(user_id: int, results: List[str], first: str):
#     if ABILITIES[first]['is_sync'] == True:
#         # check in DB command is existed? 
#         # if not init command with status pending / init -> when consume data -> make it ok
#         pass
#     ABILITIES[first]['function'](user_id)
