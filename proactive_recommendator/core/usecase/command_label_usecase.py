from core.domain.enums.enum import SearchMode
from infrastructure.repository.vectordb import command_label_repo


def search_command_label(query: str, type: str):
    if type == SearchMode.VECTOR.value:
        return command_label_repo.search_top_n(query)
    elif type == SearchMode.HYBRID.value:
        return command_label_repo.hybrid_search(query)
    else:
        raise ValueError(f"Unsupported search type: {type}")

def rank_labels_by_relevance(query: str):
    return command_label_repo.rank_labels_by_relevance(query)