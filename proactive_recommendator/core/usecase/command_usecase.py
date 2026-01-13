from core.domain.request.recommendation_request import RecommendationInfoRequest
from proactive_recommendator.core.service import project_service


async def synchronize_all_projects(user_id: int):
    project_response = await project_service.get_all_projects_and_group_tasks(user_id)
    return await project_service.create_projects_and_group_tasks(user_id, project_response) 

async def create_project(request: dict):
    # action when TM create project successfully
    # Prompt categorize project into specific domain such as work, personal, health, finance, coding.
    pass

async def update_project(request: RecommendationInfoRequest):
    # action when recursive summary of user about project is created/updated
    # update project node in graphdb with new description or metadata
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
