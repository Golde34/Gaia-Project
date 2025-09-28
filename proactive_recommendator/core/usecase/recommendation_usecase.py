from core.domain.request.recommendation_request import RecommendationRequest
from core.domain.response.base_response import return_success_response
from core.usecase import command_label_usecase, user_information_usecase


async def recommend(body: RecommendationRequest) -> str:
    ## Validate user information
    graph_user_id = user_information_usecase.get_user_information(body.user_id) 
    ## Get the main label
    _, first, rest = await command_label_usecase.rank_labels_by_relevance(body.query)
    ## Get the data from graphDB 
    # Generate GraphDB query from LLM Model 
    
    data = {"first": first, "rest": rest} 
    return return_success_response("get the label when analyze query", data) 
    ## ...