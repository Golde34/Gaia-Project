from core.domain.request.query_request import SystemRequest
from infrastructure.embedding.base_embedding import BaseEmbedding
from infrastructure.semantic_router import route, samples, router
from kernel.config.config import EMBEDDING_MODEL


GAIA_INTRODUCTION_ROUTE_NAME='introduction'
CHITCHAT_ROUTE_NAME='chitchat'
introduction_route = route.Route(name=GAIA_INTRODUCTION_ROUTE_NAME, samples=samples.gaia_introduction_sample) 
chitchat_route = route.ROute(name=CHITCHAT_ROUTE_NAME,samples=samples.chitchat_sample)
semantic_router=router.SemanticRouter(routes=[introduction_route, chitchat_route], model_name=EMBEDDING_MODEL)
embedding_model = BaseEmbedding() 

def gaia_introduction(query: SystemRequest):
    guided_route = semantic_router.guide(query.query)
    print(f"Semantic router: {guided_route}")

    if guided_route == GAIA_INTRODUCTION_ROUTE_NAME:
        query_embedding = embedding_model.get_embeddings(query.query)

        # source_information = 