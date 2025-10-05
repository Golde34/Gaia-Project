from typing import List

from core.abilities.ability_functions import ABILITIES
from core.domain.dto.recommendation_dto import RecommendationEvent, SimilarityLabel
from core.domain.request.recommendation_request import RecommendationRequest
from core.domain.response.base_response import return_success_response
from core.service import user_information_service
from infrastructure.repository.vectordb import command_label_repo


async def recommend(body: RecommendationRequest) -> str:
    try:
        ## Validate user information
        user_information = user_information_service.get_user_information(body.user_id) 
        if not user_information:
            return "Error: user not found"

        ## Get embedding vector of query
        query_vecs = await command_label_repo.embedding_of_texts(body.query)
         
        ## Get the main label
        results = await command_label_repo.rank_labels_by_relevance(body.query, query_vecs=query_vecs)

        candidates: List[SimilarityLabel] = []
        for r in results:
            name = getattr(r, "label", None) or r.get("label")
            score = getattr(r, "similarity", None) or r.get("similarity")
            candidates.append(SimilarityLabel(name=name, score=float(score)))

        event = RecommendationEvent(
            context_id=getattr(body, "context_id", "ctx-"+body.user_id),
            user_id=body.user_id,
            query=body.query,
            candidates=candidates,
            query_vecs=query_vecs
        )

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

# async def _validate_labels_information(user_id: int, results: List[str], first: str):
#     if ABILITIES[first]['is_sync'] == True:
#         # check in DB command is existed? 
#         # if not init command with status pending / init -> when consume data -> make it ok
#         pass
#     ABILITIES[first]['function'](user_id)