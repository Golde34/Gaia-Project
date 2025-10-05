from core.domain.enums.enum import SearchMode
from core.domain.request.command_label_request import CommandLabelRequest
from infrastructure.repository.vectordb import command_label_repo


def insert_command_label(request:CommandLabelRequest):
    return command_label_repo.insert_command_label(request=request)

def search_command_label(query: str, type: str):
    if type == SearchMode.VECTOR.value:
        return command_label_repo.search_top_n(query)
    elif type == SearchMode.HYBRID.value:
        return command_label_repo.hybrid_search(query)
    else:
        raise ValueError(f"Unsupported search type: {type}")

async def rank_labels_by_relevance(query: str):
    return await command_label_repo.rank_labels_by_relevance(query, None)
