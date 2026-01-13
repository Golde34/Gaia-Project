from core.domain.request.recommendation_request import RecommendationInfoRequest
from core.mapper.project_node_mapper import map_project_payload
from infrastructure.client.task_manager import task_manager_client


async def synchronize_all_projects(user_id: int):
    # call task manager to get projects and group tasks
    # store in graphdb
    project_response = await task_manager_client.get_project_group_task_list(user_id)
    if project_response is None or project_response.data is None:
        return {
            "projects": [],
            "group_tasks": []
        }

    projects_payload = project_response.data.get("projects", [])
    project_nodes = []
    group_task_nodes = []

    for project_item in projects_payload:
        project_node, mapped_group_tasks = map_project_payload(project_item, user_id)
        project_nodes.append(project_node)
        group_task_nodes.extend(mapped_group_tasks)

    return {
        "projects": project_nodes,
        "group_tasks": group_task_nodes
    }

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
