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


# ========================================
# HELPER FUNCTIONS - TEXT PREPARATION
# ========================================

def prepare_project_text(project_node: ProjectNode, group_tasks: List[GroupTaskNode]) -> str:
    """
    Generate searchable text for project without AI.
    Format: "Project Name: X. Description: Y. Category: Z. Contains groups: A, B, C."
    """
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
    """
    Generate searchable text for group task without AI.
    Format: "Group Task: X (Part of Project: Y). Description: Z."
    """
    text = f"Group Task: {group_task_node.title} "
    text += f"(Part of Project: {project_name}). "
    
    if group_task_node.description:
        text += f"Description: {group_task_node.description}."
    
    return text


def extract_keywords(text: str) -> List[str]:
    """
    Simple keyword extraction - split by space, lowercase, remove stop words.
    """
    if not text:
        return []
    
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 
        'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were'
    }
    
    words = text.lower().replace(',', ' ').replace('.', ' ').split()
    keywords = [w.strip() for w in words if w.strip() and w not in stop_words and len(w) > 2]
    
    # Remove duplicates while preserving order
    seen = set()
    unique_keywords = []
    for kw in keywords:
        if kw not in seen:
            seen.add(kw)
            unique_keywords.append(kw)
    
    return unique_keywords


# ========================================
# DATA FETCHING
# ========================================

async def get_all_projects_and_group_tasks(user_id: int):
    return await task_manager_client.get_project_group_task_list(user_id)


# ========================================
# DELETE FUNCTIONS
# ========================================

async def delete_user_memory(user_id: int):
    """
    Delete all user's projects and group tasks from both GraphDB and VectorDB.
    Runs all deletions in parallel for efficiency.
    """
    try:
        await asyncio.gather(
            # GraphDB deletion
            project_repository.delete_user_projects_and_tasks(user_id),
            
            # VectorDB deletions
            project_repo.delete_user_projects(user_id),
            group_task_repo.delete_user_group_tasks(user_id),
            
            return_exceptions=True  # Continue even if one fails
        )
    except Exception as e:
        print(f"Error deleting user memory for user_id={user_id}: {e}")
        # Don't raise - allow sync to continue


# ========================================
# GRAPH DB STORAGE
# ========================================

async def store_projects_to_graph(user_id: int, project_response: BaseResponse):
    """
    Store projects and group tasks to GraphDB only.
    This is the existing create_projects_and_group_tasks logic, just renamed.
    """
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


# ========================================
# VECTOR DB STORAGE
# ========================================

async def store_projects_to_vector(user_id: int, project_response: BaseResponse):
    """
    Store projects and group tasks to VectorDB with simple text generation (no AI).
    Uses embedding for semantic search.
    """
    if project_response is None or project_response.data is None:
        return {
            "projects": 0,
            "group_tasks": 0
        }
    
    projects_payload = project_response.data.get("projects", [])
    projects_synced = 0
    group_tasks_synced = 0
    
    for project_item in projects_payload:
        try:
            # 1. Map raw data to entities
            project_node, group_task_nodes = map_project_payload(project_item, user_id)
            
            # 2. Generate searchable text (NO AI)
            project_text = prepare_project_text(project_node, group_task_nodes)
            project_keywords = extract_keywords(project_node.name)
            
            # 3. Create vector entity
            project_entity = Project(
                keywords=project_keywords,
                example=[project_node.description or project_node.name]
            )
            
            # 4. Insert to VectorDB
            await project_repo.insert_project_vector(
                project_entity=project_entity,
                user_id=user_id,
                project_id=project_node.id,
                summary=project_text,
                status=project_node.active_status
            )
            projects_synced += 1
            
            # 5. Store group tasks
            for gt_node in group_task_nodes:
                try:
                    gt_text = prepare_group_task_text(gt_node, project_node.name)
                    gt_keywords = extract_keywords(gt_node.title)
                    
                    gt_entity = GroupTask(
                        keywords=gt_keywords,
                        example=[gt_node.description or gt_node.title]
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
                    print(f"Error storing group task {gt_node.id} to vector: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error storing project {project_item.get('project', {}).get('id')} to vector: {e}")
            continue
    
    return {
        "projects": projects_synced,
        "group_tasks": group_tasks_synced
    }


# ========================================
# BACKWARD COMPATIBILITY
# ========================================

async def create_projects_and_group_tasks(user_id: int, project_response: BaseResponse):
    """
    Deprecated: Use store_projects_to_graph instead.
    Kept for backward compatibility.
    """
    return await store_projects_to_graph(user_id, project_response)

