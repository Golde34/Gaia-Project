from neo4j import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from infrastructure.graphdb.graphdb_connection import get_db_session


GraphDBRouter = APIRouter(
    prefix="/graphdb",
    tags=["GraphDB"],
)

class LabelRequestBody(BaseModel):
    label: str
    obj: str

@GraphDBRouter.post("/add-label", status_code=status.HTTP_201_CREATED)
async def add_label(body: LabelRequestBody, session: AsyncSession = Depends(get_db_session)):
    query = """
        CREATE (u:User {name: $name, email: $email})
        RETURN u
    """
    try:
        result = await session.run(query, name=body.label, email=body.obj)
        record = await result.single()
        if not record:
            raise RuntimeError("No result returned from Neo4j")
        return {"message": "User created successfully", "user": record["u"]}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {e}"
        )
