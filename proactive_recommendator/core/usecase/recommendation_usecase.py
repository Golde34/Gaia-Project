from core.domain.request.recommendation_request import RecommendationRequest
from core.domain.response.base_response import return_success_response
from core.usecase import command_label_usecase, user_information_usecase


async def recommend(body: RecommendationRequest) -> str:
    try:
        ## Validate user information
        user_information = user_information_usecase.get_user_information(body.user_id) 
        ## Get the main label
        results, first, rest = await command_label_usecase.rank_labels_by_relevance(body.query)
        recommendation_information = await user_information_usecase.validate_labels_information(results)
        ## Get the data from graphDB 
        # Generate GraphDB query from LLM Model
        # After get the labels's relationships, usering PPR to compare
        ## Generate response using LLM model + do something before user needs, like, generate calendar, ... 
        data = {"first": first, "rest": rest} 
        return return_success_response("get the label when analyze query", data) 
        ## ...
    except Exception as e:
        return "Error: " + e 