import asyncio
from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class RecommendationRecord:
    fingerprint: str
    recommendation: str


class RecommendationHistoryStore:
    """Simple in-memory store to deduplicate recommendations per user."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._records: Dict[str, RecommendationRecord] = {}

    async def should_recommend(self, user_id: Optional[str], fingerprint: str) -> bool:
        """Return True if the recommendation should be executed."""

        key = self._build_key(user_id)
        async with self._lock:
            record = self._records.get(key)
            if record is None:
                return True
            return record.fingerprint != fingerprint

    async def register(
        self, user_id: Optional[str], fingerprint: str, recommendation: str
    ) -> None:
        """Persist the fingerprint for future duplicate checks."""

        if not recommendation:
            return
        key = self._build_key(user_id)
        async with self._lock:
            self._records[key] = RecommendationRecord(
                fingerprint=fingerprint, recommendation=recommendation
            )

    async def clear(self, user_id: Optional[str]) -> None:
        """Remove stored recommendation state for a user."""

        key = self._build_key(user_id)
        async with self._lock:
            self._records.pop(key, None)

    def _build_key(self, user_id: Optional[str]) -> str:
        return str(user_id or "0")


recommendation_history_store = RecommendationHistoryStore()
