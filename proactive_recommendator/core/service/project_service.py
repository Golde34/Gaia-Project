import asyncio
from typing import List

from core.domain.response.base_response import BaseResponse
from core.mapper.project_node_mapper import map_project_payload
from core.domain.entities.graphdb.project_node_entity import ProjectNode, GroupTaskNode
from core.domain.entities.vectordb.project_entity import Project
from core.domain.entities.vectordb.group_task_entity import GroupTask
from infrastructure.client.task_manager import task_manager_client
from infrastructure.repository.graphdb import project_repository
from infrastructure.repository.vectordb import project_repo, group_task_repo
from kernel.utils import preprocessing


async def get_all_projects_and_group_tasks(user_id: int):
    return await task_manager_client.get_project_group_task_list(user_id)


async def delete_user_memory(user_id: int):
    try:
        await asyncio.gather(
            # GraphDB deletion
            project_repository.delete_user_projects_and_tasks(user_id),

            # VectorDB deletions
            project_repo.delete_user_projects(user_id),
            group_task_repo.delete_user_group_tasks(user_id),

            return_exceptions=True
        )
    except Exception as e:
        print(f"Error deleting user memory for user_id={user_id}: {e}")


async def store_projects_to_graph(user_id: int, project_response: BaseResponse):
    if project_response is None or project_response.data is None:
        return {
            "projects": 0,
            "group_tasks": 0
        }

    projects_payload = project_response.data if isinstance(project_response.data, list) else project_response.data.get("projects", [])
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


async def store_projects_to_vector(user_id: int, project_response: BaseResponse):
    if project_response is None or project_response.data is None:
        return {
            "projects": 0,
            "group_tasks": 0
        }

    projects_payload = project_response.data if isinstance(project_response.data, list) else project_response.data.get("projects", [])
    projects_synced = 0
    group_tasks_synced = 0

    for project_item in projects_payload:
        try:
            project_node, group_task_nodes = map_project_payload(
                project_item, user_id)

            project_text = prepare_project_text(project_node, group_task_nodes)
            project_keywords = preprocessing.extract_keywords(
                project_node.name)

            project_entity = Project(
                keywords=project_keywords,
                example=[project_node.description or project_node.name],
                metadata=project_node.metadata
            )
            await project_repo.insert_project_vector(
                project_entity=project_entity,
                user_id=user_id,
                project_id=project_node.id,
                summary=project_text,
                status=project_node.active_status,
            )
            projects_synced += 1

            for gt_node in group_task_nodes:
                try:
                    gt_text = prepare_group_task_text(
                        gt_node, project_node.name)
                    gt_keywords = preprocessing.extract_keywords(gt_node.title)

                    gt_entity = GroupTask(
                        keywords=gt_keywords,
                        example=[gt_node.description or gt_node.title],
                        metadata=gt_node.metadata
                    )

                    await group_task_repo.insert_group_task_vector(
                        group_task_entity=gt_entity,
                        user_id=user_id,
                        group_task_id=gt_node.id,
                        project_id=project_node.id,
                        summary=gt_text,
                        status=gt_node.active_status
                    )
                    group_tasks_synced += 1

                except Exception as e:
                    print(
                        f"Error storing group task {gt_node.id} to vector: {e}")
                    continue

        except Exception as e:
            print(
                f"Error storing project {project_item.get('project', {}).get('id')} to vector: {e}")
            continue

    return {
        "projects": projects_synced,
        "group_tasks": group_tasks_synced
    }


def prepare_project_text(project_node: ProjectNode, group_tasks: List[GroupTaskNode]) -> str:
    text = f"Project Name: {project_node.name}. "

    if project_node.description:
        text += f"Description: {project_node.description}. "

    if project_node.category:
        text += f"Category: {project_node.category}. "

    group_names = [gt.title for gt in group_tasks if gt.title]
    if group_names:
        text += f"Contains groups: {', '.join(group_names)}."

    return text


def prepare_group_task_text(group_task_node: GroupTaskNode, project_name: str) -> str:
    text = f"Group Task: {group_task_node.title} "
    text += f"(Part of Project: {project_name}). "

    if group_task_node.description:
        text += f"Description: {group_task_node.description}."

    return text

async def get_recent_projects(user_id: int, top_k: int) -> List[dict]:
    return await project_repository.get_user_projects(user_id, top_k) 

async def semantic_search_projects(user_id: int, query: str, top_k: int) -> List[dict]:
    return await project_repo.search_projects_by_vector(
        user_id=user_id,
        query=query,
        top_k=top_k
    )