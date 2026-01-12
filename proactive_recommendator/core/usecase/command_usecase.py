from core.domain.entities.graphdb.project_node_entity import GroupTaskNode, ProjectNode
from core.domain.request.recommendation_request import RecommendationInfoRequest
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
        project_data = project_item.get("project", {})
        group_tasks = project_item.get("groupTasks", []) or []

        project_node = ProjectNode(
            id=str(project_data.get("_id") or project_data.get("id")),
            name=project_data.get("name") or "",
            description=project_data.get("description") or "",
            user_id=project_data.get("ownerId") or user_id,
            created_at=project_data.get("createdAt"),
            updated_at=project_data.get("updatedAt"),
            active_status=project_data.get("activeStatus", "active"),
            metadata=project_data
        )
        project_nodes.append(project_node)

        for group_task in group_tasks:
            group_task_nodes.append(GroupTaskNode(
                id=str(group_task.get("_id") or group_task.get("id")),
                title=group_task.get("title") or "",
                description=group_task.get("description") or "",
                created_at=group_task.get("createdAt"),
                updated_at=group_task.get("updatedAt"),
                active_status=group_task.get("activeStatus", "active"),
                metadata={
                    "project_id": project_node.id,
                    "project_name": project_node.name,
                    "raw": group_task
                }
            ))

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
