from re import I
import numpy as np

from infrastructure.embedding.base_embedding import embedding_model
from kernel.config.config import CHAT_HIS_SEMANTIC_THRESHOLD


class SemanticRouter:
    def __init__(self, routes, model_name):
        self.routes = routes
        self.model_name = model_name
        self.embedding_model = embedding_model
        self.routes_embedding = {}
        self.routes_embedding_cal = {}

    async def initialize(self):
        if not self.routes_embedding:
            for route in self.routes:
                route_embedding = await self.embedding_model.get_embeddings(route.samples)
                route_embedding = route_embedding / np.linalg.norm(route_embedding, axis=1, keepdims=True)
                self.routes_embedding[route.name] = route_embedding
                self.routes_embedding_cal[route.name] = route_embedding / np.linalg.norm(route_embedding, axis=1, keepdims=True)
        else:
            print("Routes embeddings already initialized.")
            
    def get_routes(self):
        return self.routes
        
    async def guide(self, query):
        """
        Guide the query to the appropriate route based on the embeddings.

        Args:
            query (str): The input query to be guided.

        Returns:
            route.Route: The route that best matches the query.
        """
        query_embedding = await self.embedding_model.get_embeddings([query])
        query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)

        best_route = None
        best_similarity = -1

        for route_name, route_embedding in self.routes_embedding_cal.items():
            similarity = np.dot(query_embedding, route_embedding.T).max()
            print(f"Route introduction: {route_name}, Similarity: {similarity:.4f}")
            if similarity > best_similarity:
                best_similarity = similarity
                best_route = route_name

        return next((route for route in self.routes if route.name == best_route), None), best_similarity

    async def guide_with_many_routes(self, query, threshold=None):
        """
        Guide the query to the appropriate route based on the embeddings.

        Args:
            query (str): The input query to be guided.

        Returns:
            route.Route: The route that best matches the query.
        """
        query_embedding = await self.embedding_model.get_embeddings([query])
        query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)

        matching_routes = []

        if threshold is None:
            threshold = CHAT_HIS_SEMANTIC_THRESHOLD

        for route_name, route_embedding in self.routes_embedding_cal.items():
            similarity = np.dot(query_embedding, route_embedding.T).max()
            print(f"Route: {route_name}, Similarity: {similarity:.4f}")
            if similarity >= threshold:
                matching_routes.append((route_name, similarity))

        return matching_routes if matching_routes else None
