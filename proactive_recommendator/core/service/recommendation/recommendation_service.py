from typing import List


async def validate_labels_information(results: List[str], first: str):
    ## for example: labels is create task, list task, user health -> pending when create task successfully, then call api check list task, user health
    # label is list task, user health, call api check list task, user health immediately
    pass

