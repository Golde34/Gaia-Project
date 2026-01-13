from core.domain.response.base_response import BaseResponse
from core.mapper.project_node_mapper import map_project_payload
from infrastructure.client.task_manager import task_manager_client
from infrastructure.repository.graphdb import project_repository


async def get_all_projects_and_group_tasks(user_id: int):
    return await task_manager_client.get_project_group_task_list(user_id)


async def create_projects_and_group_tasks(user_id: int, project_response: BaseResponse):
    project_response = await task_manager_client.get_project_group_task_list(user_id)
    if project_response is None or project_response.data is None:
        return {
            "projects": 0,
            "group_tasks": 0
        }

    projects_payload = project_response.data.get("projects", [])
    projects_synced = 0
    group_tasks_synced = 0

    for project_item in projects_payload:
        project_node, mapped_group_tasks = map_project_payload(
            project_item, user_id)

        await project_repository.upsert_project(project_node)
        projects_synced += 1

        for group_task_node in mapped_group_tasks:
            await project_repository.upsert_group_task(group_task_node, project_node.id)
            group_tasks_synced += 1

    return {
        "projects": projects_synced,
        "group_tasks": group_tasks_synced
    }
