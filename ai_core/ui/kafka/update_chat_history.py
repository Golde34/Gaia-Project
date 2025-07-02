from core.service.chitchat_service import update_recursive_summary


async def _update_recursive_summary(msg):
    return await update_recursive_summary(
        query=msg['query'], 
        response=msg['response']
    ) 