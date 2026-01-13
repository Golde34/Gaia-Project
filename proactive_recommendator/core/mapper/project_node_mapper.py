from typing import Any, Dict, List, Tuple

from core.domain.entities.graphdb.project_node_entity import GroupTaskNode, ProjectNode


def map_project_node(project_data: Dict[str, Any], fallback_user_id: int) -> ProjectNode:
    return ProjectNode(
        id=str(project_data.get("_id") or project_data.get("id")),
        name=project_data.get("name") or "",
        description=project_data.get("description") or "",
        user_id=project_data.get("ownerId") or fallback_user_id,
        created_at=project_data.get("createdAt"),
        updated_at=project_data.get("updatedAt"),
        active_status=project_data.get("activeStatus", "active"),
        metadata=project_data
    )


def map_group_task_node(group_task: Dict[str, Any], project_node: ProjectNode) -> GroupTaskNode:
    return GroupTaskNode(
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
    )


def map_project_payload(project_item: Dict[str, Any], fallback_user_id: int) -> Tuple[ProjectNode, List[GroupTaskNode]]:
    project_data = project_item.get("project", {})
    group_tasks = project_item.get("groupTasks", []) or []

    project_node = map_project_node(project_data, fallback_user_id)
    group_task_nodes = [
        map_group_task_node(group_task, project_node)
        for group_task in group_tasks
    ]

    return project_node, group_task_nodes
