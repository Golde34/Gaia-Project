from core.service.chat_service import update_recursive_summary


async def update_recursive_summary_handler(msg):
    return await update_recursive_summary(
        query=msg['query'], 
        response=msg['response']
    ) 