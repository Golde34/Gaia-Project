from typing import List, Optional

from core.domain.entities.user_dialogue import UserDialogue
from kernel.database.postgres import postgres_db


class MessageRepository:
    async def create_dialogue(dialogue: UserDialogue):
        query = (
            "INSERT INTO user_dialogues (id, user_id, dialogue_name, dialogue_type, dialogue_status, metadata, created_at, updated_at) "
            "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id"
        )
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            return await conn.fetchval(
                query,
                dialogue.id,
                dialogue.user_id,
                dialogue.dialogue_name,
                dialogue.dialogue_type,
                dialogue.dialogue_status,
                dialogue.metadata,
                dialogue.created_at,
                dialogue.updated_at,
            )
            
    async def get_by_user_id_and_type(user_id: str, dialogue_type: str) -> List[UserDialogue]:
        query = (
            "SELECT id, user_id, dialogue_name, dialogue_type, dialogue_status, metadata, created_at, updated_at "
            "FROM user_dialogues WHERE user_id=$1 AND dialogue_type=$2 ORDER BY created_at DESC"
        )
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, user_id, dialogue_type)
            return UserDialogue(**dict(rows[0])) if rows else None

    async def get_by_id(dialogue_id: str) -> Optional[UserDialogue]:
        query = (
            "SELECT id, user_id, dialogue_name, dialogue_type, dialogue_status, metadata, created_at, updated_at "
            "FROM user_dialogues WHERE id=$1"
        )
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, dialogue_id)
            return UserDialogue(**dict(rows[0])) if rows else None
    
recommendation_history_repo = RecommendationHistoryRepository()
