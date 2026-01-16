"""
Mapper for GraphDB entities → VectorDB entities
Handles conversion and summary generation for semantic search
"""
from typing import List, Tuple
from core.domain.entities.graphdb.project_node_entity import ProjectNode, GroupTaskNode
from core.domain.entities.vectordb.project_entity import Project
from core.domain.entities.vectordb.group_task_entity import GroupTask


def extract_keywords(text: str, max_keywords: int = 5) -> List[str]:
    """
    Extract keywords from text
    Simple implementation: split by space and take unique words
    TODO: Improve with NLP/TF-IDF for better keyword extraction
    """
    if not text:
        return []
    
    # Clean and split
    words = text.lower().replace(',', ' ').replace('.', ' ').split()
    # Remove duplicates while preserving order
    seen = set()
    keywords = []
    for word in words:
        if word not in seen and len(word) > 2:  # Skip very short words
            seen.add(word)
            keywords.append(word)
            if len(keywords) >= max_keywords:
                break
    
    return keywords


def generate_project_summary(project_node: ProjectNode, group_tasks: List[GroupTaskNode]) -> str:
    """
    Generate project summary from project + group tasks
    
    Strategy:
    1. Combine project name + description
    2. Add group task titles to understand project scope
    3. Create concise summary
    
    TODO: Replace with LLM call for better summary generation
    Future: Call sub-agent LLM to analyze project context
    """
    # Base summary from project
    summary_parts = [f"Project: {project_node.name}"]
    
    if project_node.description:
        summary_parts.append(project_node.description)
    
    if project_node.category:
        summary_parts.append(f"Category: {project_node.category}")
    
    # Add group tasks context
    if group_tasks:
        task_titles = [gt.title for gt in group_tasks[:5]]  # Limit to 5
        summary_parts.append(f"Tasks: {', '.join(task_titles)}")
    
    summary = ". ".join(summary_parts)
    
    # Truncate if too long (max 5000 chars in schema)
    return summary[:4900] if len(summary) > 4900 else summary


def generate_group_task_summary(group_task_node: GroupTaskNode, project_node: ProjectNode) -> str:
    """
    Generate group task summary
    Include project context for better understanding
    """
    summary_parts = [
        f"Task: {group_task_node.title}",
        f"Project: {project_node.name}"
    ]
    
    if group_task_node.description:
        summary_parts.append(group_task_node.description)
    
    summary = ". ".join(summary_parts)
    return summary[:4900] if len(summary) > 4900 else summary


def map_project_to_vector(
    project_node: ProjectNode, 
    group_tasks: List[GroupTaskNode]
) -> Tuple[Project, str]:
    """
    Map ProjectNode (GraphDB) → Project (VectorDB)
    
    Returns:
        Tuple of (Project entity, summary string)
    """
    # Extract keywords from name and description
    text_for_keywords = f"{project_node.name} {project_node.description or ''}"
    keywords = extract_keywords(text_for_keywords)
    
    # Generate summary including group tasks context
    summary = generate_project_summary(project_node, group_tasks)
    
    # Examples for embedding: project name variations
    examples = [
        project_node.name,
        f"{project_node.name} {project_node.category or ''}".strip()
    ]
    
    project_entity = Project(
        label=project_node.category or "general",
        name=project_node.name,
        keywords=keywords,
        example=examples,
        description=project_node.description or ""
    )
    
    return project_entity, summary


def map_group_task_to_vector(
    group_task_node: GroupTaskNode,
    project_node: ProjectNode
) -> Tuple[GroupTask, str]:
    """
    Map GroupTaskNode (GraphDB) → GroupTask (VectorDB)
    
    Returns:
        Tuple of (GroupTask entity, summary string)
    """
    # Extract keywords from title and description
    text_for_keywords = f"{group_task_node.title} {group_task_node.description or ''}"
    keywords = extract_keywords(text_for_keywords)
    
    # Generate summary with project context
    summary = generate_group_task_summary(group_task_node, project_node)
    
    # Examples: task title variations
    examples = [
        group_task_node.title,
        f"{group_task_node.title} in {project_node.name}"
    ]
    
    group_task_entity = GroupTask(
        label=project_node.category or "general",
        name=group_task_node.title,
        keywords=keywords,
        example=examples,
        description=group_task_node.description or ""
    )
    
    return group_task_entity, summary
