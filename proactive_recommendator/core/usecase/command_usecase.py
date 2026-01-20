import asyncio

from core.domain.request.recommendation_request import RecommendationInfoRequest
from core.service import project_service


async def synchronize_all_projects(user_id: int):

    await project_service.delete_user_memory(user_id)

    task_service_data = await project_service.get_all_projects_and_group_tasks(user_id)
    print("Fetched data from Task Service: ", task_service_data)

    graph_result, vector_result = await asyncio.gather(
        project_service.store_projects_to_graph(user_id, task_service_data),
        project_service.store_projects_to_vector(user_id, task_service_data),
        return_exceptions=True
    )

    total_projects = 0
    total_group_tasks = 0
    if isinstance(graph_result, dict):
        total_projects = max(total_projects, graph_result.get("projects", 0))
        total_group_tasks = max(
            total_group_tasks, graph_result.get("group_tasks", 0))
    if isinstance(vector_result, dict):
        total_projects = max(total_projects, vector_result.get("projects", 0))
        total_group_tasks = max(
            total_group_tasks, vector_result.get("group_tasks", 0))
    sync_result = {
        "projects_synced": total_projects,
        "group_tasks_synced": total_group_tasks,
        "graph_result": graph_result if not isinstance(graph_result, Exception) else str(graph_result),
        "vector_result": vector_result if not isinstance(vector_result, Exception) else str(vector_result)
    }
    print("synchronization result: ", sync_result)


async def create_project(request: dict):
    # action when TM create project successfully
    # Prompt categorize project into specific domain such as work, personal, health, finance, coding.
    pass


async def update_project(request: RecommendationInfoRequest):
    # action when recursive summary of user about project is created/updated
    # update project node in graphdb with new description or metadata
    pass


async def get_project_list(request: RecommendationInfoRequest):
    top_k = 5

    semantic_projects = await project_service.semantic_search_projects(
        user_id=request.user_id,
        query=request.query,
        top_k=top_k)

    graph_projects = await project_service.get_recent_projects(request.user_id, top_k)

    # Redis push projects

    return {
        "semantic_projects": semantic_projects,
        "graph_projects": graph_projects
    }  


async def get_group_task_list(request: RecommendationInfoRequest):
    pass

# TODO:
# Create graphdb with index is user, inside there are project and group task component
# CRUD graph node of project and group task
# Create graph node must store vector embedding or project name and description
# Create function to query graphdb by user id and query string to return ranked project list and group task list
# Integrate with recommendation service client to call these functions
