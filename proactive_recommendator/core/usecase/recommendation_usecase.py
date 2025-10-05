from typing import List

from core.abilities.ability_functions import ABILITIES
from core.domain.request.recommendation_request import RecommendationRequest
from core.domain.response.base_response import return_success_response
from core.service import user_information_service
from infrastructure.repository.vectordb import command_label_repo


async def recommend(body: RecommendationRequest) -> str:
    try:
        ## Validate user information
        user_information = user_information_service.get_user_information(body.user_id) 
        ## Get the main label
        results = await command_label_repo.rank_labels_by_relevance(body.query)

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