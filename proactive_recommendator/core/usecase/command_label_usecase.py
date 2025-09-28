from core.service import command_label_service
from core.domain.entities.vectordb.command_label_entity import CommandLabel
from core.domain.enums.enum import SearchMode


def search_command_label(query: str, type: str):
    if type == SearchMode.VECTOR.value:
        return command_label_service.search_top_n(query)
    elif type == SearchMode.HYBRID.value:
        return command_label_service.hybrid_search(query)
    else:
        raise ValueError(f"Unsupported search type: {type}")
