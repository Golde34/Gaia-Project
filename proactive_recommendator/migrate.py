from pathlib import Path
import os, glob, time
from neo4j import GraphDatabase

from kernel.config.config import Config as config


URI=config.NEO4J_URI
USER=config.NEO4J_USER
PASS=config.NEO4J_PASSWORD

MIGRATIONS_DIR="./migrations/graphdb"

BASE_DIR = Path(__file__).resolve().parent
MIGRATIONS_DIR = BASE_DIR / "migrations" / "graphdb"

MIGR_LABEL = "Migration"

DDL_CREATE_MIGR = f"""
CREATE CONSTRAINT migr_id_unique IF NOT EXISTS
FOR (m:{MIGR_LABEL}) REQUIRE m.id IS UNIQUE
"""

GET_APPLIED = f"MATCH (m:{MIGR_LABEL}) RETURN m.id AS id"
MARK_APPLIED = f"MERGE (m:{MIGR_LABEL} {{id:$id}}) SET m.appliedAt=datetime(), m.name=$name"

def split_statements(cypher: str):
    # tách đơn giản theo ';' (đảm bảo file migration không chứa ; trong string literal)
    stmts = [s.strip() for s in cypher.split(';') if s.strip()]
    return stmts

SCHEMA_PREFIXES = (
    "CREATE CONSTRAINT", "DROP CONSTRAINT",
    "CREATE INDEX", "DROP INDEX"
)

def is_schema_stmt(stmt: str) -> bool:
    u = stmt.strip().upper()
    return any(u.startswith(p) for p in SCHEMA_PREFIXES)

def main():
    driver = GraphDatabase.driver(URI, auth=(USER, PASS))
    with driver.session() as s:
        # chuẩn bị constraint cho bảng Migration
        s.run(DDL_CREATE_MIGR)
        applied = {r["id"] for r in s.run(GET_APPLIED)}

        pattern = str(MIGRATIONS_DIR / "v*__*.cypher")
        files = sorted(glob.glob(pattern))
        print("Files:", files)

        for path in files:
            vid = os.path.basename(path)
            if vid in applied:
                print(f"SKIP {vid}")
                continue

            print(f"APPLY {vid} ...")
            with open(path, "r", encoding="utf-8") as f:
                cypher = f.read()
            stmts = split_statements(cypher)

            # 1) Chạy CÁC LỆNH SCHEMA ở chế độ autocommit (mỗi stmt = 1 tx riêng)
            for stmt in stmts:
                if is_schema_stmt(stmt):
                    s.run(stmt)   # autocommit tx cho schema
                    # không được gom schema với data trong cùng tx

            # 2) Gom các lệnh KHÔNG phải schema vào MỘT transaction riêng
            data_stmts = [st for st in stmts if not is_schema_stmt(st)]
            if data_stmts:
                tx = s.begin_transaction()
                try:
                    for stmt in data_stmts:
                        tx.run(stmt)
                    tx.commit()
                except Exception:
                    tx.rollback()
                    raise

            # 3) Đánh dấu migration đã áp dụng — chạy ở tx riêng (autocommit)
            s.run(MARK_APPLIED, id=vid, name=vid)
            print(f"OK  {vid}")

    driver.close()

if __name__ == "__main__":
    main()
