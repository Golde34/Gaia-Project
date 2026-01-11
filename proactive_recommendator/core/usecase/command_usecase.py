from core.domain.request.recommendation_request import RecommendationInfoRequest


async def synchronize_all_projects(user_id: int):
    # call task manager to get projects and group tasks
    # store in graphdb
    pass

async def get_project_list(request: RecommendationInfoRequest):
    # get vector embedding in graphdb
    # get top project in graphdb
    # rerank with recommendation service
    # return title description, 
    pass
    
async def get_group_task_list(request: RecommendationInfoRequest):
    pass

## TODO: 
# Create graphdb with index is user, inside there are project and group task component
# CRUD graph node of project and group task
# Create graph node must store vector embedding or project name and description
# Create function to query graphdb by user id and query string to return ranked project list and group task list
# Integrate with recommendation service client to call these functions