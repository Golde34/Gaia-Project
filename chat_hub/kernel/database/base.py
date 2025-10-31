from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Generic, Iterable, List, Optional, Tuple, Type, TypeVar, Union

import asyncpg
from pydantic import BaseModel

from kernel.database.postgres import postgres_db

TModel = TypeVar("TModel", bound=BaseModel)


def _model_fields(model_cls: Type[TModel]) -> List[str]:
    """
    Get field names from a Pydantic model class (works for v1 and v2).
    """
    # Pydantic v2
    if hasattr(model_cls, "model_fields"):
        return list(model_cls.model_fields.keys())
    # Pydantic v1
    if hasattr(model_cls, "__fields__"):
        return list(model_cls.__fields__.keys())
    raise RuntimeError("Unsupported Pydantic version")


def _model_dump(instance: TModel) -> Dict[str, Any]:
    """
    Dump a Pydantic model instance to primitive dict (v1/v2).
    """
    if hasattr(instance, "model_dump"):
        return instance.model_dump()  # v2
    return instance.dict()  # v1


class Page:
    def __init__(self, limit: int = 20, offset: int = 0):
        self.limit = limit
        self.offset = offset


class BaseRepository(Generic[TModel]):
    """
    Generic CRUD for asyncpg + Pydantic models.
    - Safe numbered placeholders ($1, $2, ...)
    - Dynamic WHERE building
    - Pagination with LIMIT/OFFSET
    """

    def __init__(
        self,
        table_name: str,
        model_cls: Type[TModel],
        pk: str = "id",
        default_order_by: Optional[str] = None,
    ):
        self.table = table_name
        self.model_cls = model_cls
        self.pk = pk
        self.default_order_by = default_order_by
        self._columns_cache = _model_fields(model_cls)

    # ---------- SQL builders ----------

    def _columns(
        self,
        include: Optional[Iterable[str]] = None,
        exclude: Optional[Iterable[str]] = None,
    ) -> List[str]:
        cols = list(self._columns_cache)
        if include is not None:
            inc = set(include)
            cols = [c for c in cols if c in inc]
        if exclude is not None:
            exc = set(exclude)
            cols = [c for c in cols if c not in exc]
        return cols

    @staticmethod
    def _join_columns(columns: Iterable[str]) -> str:
        return ", ".join(columns)

    @staticmethod
    def _placeholders(start_index: int, n: int) -> Tuple[str, int]:
        """
        Returns a string like '$1, $2, ...' and the next index after the last placeholder.
        """
        end = start_index + n
        ph = ", ".join(f"${i}" for i in range(start_index, end))
        return ph, end

    @staticmethod
    def _assignments(values: Dict[str, Any], start_index: int = 1) -> Tuple[str, List[Any], int]:
        """
        Build 'col1=$1, col2=$2 ...' (skipping None if desired upstream).
        """
        parts: List[str] = []
        args: List[Any] = []
        i = start_index
        for k, v in values.items():
            parts.append(f"{k} = ${i}")
            args.append(v)
            i += 1
        return ", ".join(parts), args, i

    # ---------- helpers ----------

    @staticmethod
    def _row_to_model(model_cls: Type[TModel], row: asyncpg.Record) -> TModel:
        return model_cls(**dict(row))

    # ---------- CRUD ----------

    async def get_by_id(self, id_value: Any, columns: Optional[Iterable[str]] = None) -> Optional[TModel]:
        cols = self._columns(include=columns)
        query = f"SELECT {self._join_columns(cols)} FROM {self.table} WHERE {self.pk} = $1"
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(query, id_value)
        return self._row_to_model(self.model_cls, row) if row else None

    async def insert(
        self,
        entity: TModel,
        *,
        include: Optional[Iterable[str]] = None,
        exclude: Optional[Iterable[str]] = None,
        returning: Optional[Iterable[str]] = None,
        auto_timestamps: bool = True,
    ) -> Union[Any, Dict[str, Any]]:
        """
        Insert entity. If `returning` is None -> return PK value.
        If `returning` is iterable -> return dict of requested columns.
        """
        data = _model_dump(entity)
        print(data)

        # optional managed timestamps
        if auto_timestamps:
            now = datetime.utcnow()
            if "created_at" in data and data["created_at"] is None:
                data["created_at"] = now
            if "updated_at" in data and data["updated_at"] is None:
                data["updated_at"] = now

        cols = self._columns(include=include, exclude=exclude)
        values = [data.get(c) for c in cols]

        ph, _ = self._placeholders(1, len(cols))
        if returning:
            ret_cols = list(returning)
            query = f"INSERT INTO {self.table} ({self._join_columns(cols)}) VALUES ({ph}) RETURNING {self._join_columns(ret_cols)}"
        else:
            query = f"INSERT INTO {self.table} ({self._join_columns(cols)}) VALUES ({ph}) RETURNING {self.pk}"

        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(query, *values)

        if returning:
            return dict(row)
        return row[self.pk]

    async def update_by_id(
        self,
        id_value: Any,
        values: Dict[str, Any],
        *,
        exclude_none: bool = True,
        auto_timestamp_updated_at: bool = True,
        returning: Optional[Iterable[str]] = None,
    ) -> Optional[Union[TModel, Dict[str, Any]]]:
        """
        Update by primary key. Returns the updated row (model/dict) if RETURNING is specified,
        otherwise None.
        """
        vals = dict(values)

        if exclude_none:
            vals = {k: v for k, v in vals.items() if v is not None}

        if auto_timestamp_updated_at and "updated_at" in self._columns_cache:
            vals["updated_at"] = datetime.utcnow()

        # never try to set PK via SET clause
        vals.pop(self.pk, None)

        set_sql, args, i = self._assignments(vals, start_index=1)
        where_sql, where_args, _ = self._build_where({self.pk: id_value}, start_index=i)
        query = f"UPDATE {self.table} SET {set_sql}{where_sql}"

        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            if returning:
                ret_cols = list(returning)
                query_ret = query + f" RETURNING {self._join_columns(ret_cols)}"
                row = await conn.fetchrow(query_ret, *(args + where_args))
                return dict(row) if row and not isinstance(self.model_cls, type(BaseModel)) else (
                    self._row_to_model(self.model_cls, row) if row else None
                )
            else:
                await conn.execute(query, *(args + where_args))
                return None

    async def update_where(
        self,
        where: Dict[str, Any],
        values: Dict[str, Any],
        *,
        exclude_none: bool = True,
    ) -> str:
        """
        Bulk/conditional update. Returns the command status string.
        """
        vals = dict(values)
        if exclude_none:
            vals = {k: v for k, v in vals.items() if v is not None}
        if "updated_at" in self._columns_cache:
            vals["updated_at"] = datetime.utcnow()

        set_sql, args, i = self._assignments(vals, start_index=1)
        where_sql, where_args, _ = self._build_where(where, start_index=i)
        query = f"UPDATE {self.table} SET {set_sql}{where_sql}"
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            return await conn.execute(query, *(args + where_args))

    async def delete_by_id(self, id_value: Any) -> str:
        query = f"DELETE FROM {self.table} WHERE {self.pk} = $1"
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            return await conn.execute(query, id_value)

    async def count(self, where: Optional[Dict[str, Any]] = None) -> int:
        where_sql, args, _ = self._build_where(where, start_index=1)
        query = f"SELECT COUNT(*) AS cnt FROM {self.table}{where_sql}"
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(query, *args)
        return int(row["cnt"])

    async def select_paginated(
        self,
        where: Optional[Dict[str, Any]] = None,
        *,
        columns: Optional[Iterable[str]] = None,
        page: Optional[Page] = None,
        order_by: Optional[str] = None,
        to_models: bool = True,
    ) -> List[Union[TModel, Dict[str, Any]]]:
        cols = self._columns(include=columns)
        where_sql, args, i = self._build_where(where, start_index=1)
        order_clause = f" ORDER BY {order_by or self.default_order_by}" if (order_by or self.default_order_by) else ""
        limit_clause = ""
        if page and page.limit > 0:
            limit_clause = f" LIMIT ${i}"
            args.append(page.limit)
            i += 1
            if page.offset and page.offset > 0:
                limit_clause += f" OFFSET ${i}"
                args.append(page.offset)
                i += 1

        query = f"SELECT {self._join_columns(cols)} FROM {self.table}{where_sql}{order_clause}{limit_clause}"
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, *args)

        if to_models:
            return [self._row_to_model(self.model_cls, r) for r in rows]
        return [dict(r) for r in rows]

    async def list(
        self,
        where: Optional[Dict[str, Any]] = None,
        *,
        columns: Optional[Iterable[str]] = None,
        order_by: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        to_models: bool = True,
    ) -> List[Union[TModel, Dict[str, Any]]]:
        page = Page(limit=limit or 0, offset=offset or 0) if limit is not None else None
        return await self.select_paginated(
            where=where,
            columns=columns,
            page=page,
            order_by=order_by,
            to_models=to_models,
        )

    async def upsert(
        self,
        entity: TModel,
        conflict_cols: Iterable[str],
        update_cols: Optional[Iterable[str]] = None,
        *,
        returning: Optional[Iterable[str]] = None,
        auto_timestamps: bool = True,
    ) -> Union[Any, Dict[str, Any]]:
        """
        INSERT ... ON CONFLICT (...) DO UPDATE SET ...
        - conflict_cols: columns participating in the constraint/index
        - update_cols: columns to update (default: all non-conflict columns)
        """
        data = _model_dump(entity)

        if auto_timestamps:
            now = datetime.utcnow()
            if "created_at" in data and data["created_at"] is None:
                data["created_at"] = now
            if "updated_at" in data:
                data["updated_at"] = now

        cols = self._columns()
        insert_vals = [data.get(c) for c in cols]
        ph, next_i = self._placeholders(1, len(cols))

        conflict = ", ".join(conflict_cols)
        upd_cols = list(update_cols) if update_cols else [c for c in cols if c not in conflict_cols]
        set_parts = []
        for c in upd_cols:
            set_parts.append(f'{c} = EXCLUDED.{c}')
        set_sql = ", ".join(set_parts)

        if returning:
            ret_cols = list(returning)
            query = (
                f"INSERT INTO {self.table} ({self._join_columns(cols)}) VALUES ({ph}) "
                f"ON CONFLICT ({conflict}) DO UPDATE SET {set_sql} "
                f"RETURNING {self._join_columns(ret_cols)}"
            )
        else:
            query = (
                f"INSERT INTO {self.table} ({self._join_columns(cols)}) VALUES ({ph}) "
                f"ON CONFLICT ({conflict}) DO UPDATE SET {set_sql} "
                f"RETURNING {self.pk}"
            )

        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(query, *insert_vals)

        if returning:
            return dict(row)
        return row[self.pk]

    @staticmethod
    def _build_where(where: Optional[Dict[str, Any]], start_index: int = 1) -> Tuple[str, List[Any], int]:
        """
        Supports keys like:
          "col"                -> col = $i
          "col <"              -> col < $i
          "col >="             -> col >= $i
          "col !="             -> col != $i
          "col ILIKE"          -> col ILIKE $i
          "col__lt"/__lte/__gt/__gte/__ne/__ilike  (Django-ish)
          "col IN" with list/tuple value           -> col = ANY($i) or 'IN (...)'
        If value is None -> "col IS NULL"
        """
        if not where:
            return "", [], start_index

        op_map = {
            "__lt": "<", "__lte": "<=", "__gt": ">", "__gte": ">=", "__ne": "!=", "__ilike": "ILIKE"
        }

        parts: List[str] = []
        args: List[Any] = []
        i = start_index

        for k, v in where.items():
            # 1) accept "col <" style
            if " " in k:
                col, op = k.rsplit(" ", 1)
                op = op.upper()
            else:
                # 2) accept Django-ish "col__lt"
                base = k
                suffix = ""
                if "__" in k:
                    base, suffix = k.split("__", 1)
                op = op_map.get(f"__{suffix}", "=")
                col = base

            if v is None:
                parts.append(f"{col} IS NULL")
                continue

            # IN / ANY handling (if list/tuple)
            if isinstance(v, (list, tuple)) and op in ("IN",):
                # Safer & simple way: use = ANY($i) for arrays
                parts.append(f"{col} = ANY(${i})")
                args.append(list(v))
                i += 1
                continue

            # default: binary operator with placeholder
            parts.append(f"{col} {op} ${i}")
            args.append(v)
            i += 1

        return (" WHERE " + " AND ".join(parts)), args, i
