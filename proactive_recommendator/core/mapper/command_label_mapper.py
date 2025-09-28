from core.domain.entities.vectordb.command_label_entity import CommandLabel
from core.domain.request.command_label_request import CommandLabelRequest


def map(request: CommandLabelRequest) -> CommandLabel:
    return CommandLabel(
        label=request.label,
        name=request.name,
        keywords=request.keywords,
        example=request.example,
        description=request.description
    ) 
