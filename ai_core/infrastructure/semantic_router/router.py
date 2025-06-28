import numpy as np

from infrastructure.embedding.base_embedding import embedding_model


class EmbeddingManager:
    def __init__(self):
        self.embeddings_cache = {}
        self.initialized = False
        
    async def initialize(self, routes):
        """
        Initialize embeddings for all routes and normalize them.
        """ 
        if not self.initialized:
            for route in routes:
                route_embedding = await embedding_model.get_embeddings(route.samples)
                route_embedding = route_embedding / np.linalg.norm(route_embedding, axis=1, keepdims=True)
                self.embeddings_cache[route.name] = route_embedding
            self.initialized = True
            print("All routes embeddings initialized.")
        else:
            print("Embeddings are already initialized.")

    def get_embeddings(self, route_name): 
        return self.embeddings_cache.get(route_name, None)


class SemanticRouter:
    def __init__(self, routes, model_name, embedding_manager):
        self.routes = routes
        self.model_name = model_name
        self.embedding_manager = embedding_manager
        self.routes_embedding_cal = {}

    async def initialize(self):
        if not self.embedding_manager.initialized:
            await self.embedding_manager.initialize(self.routes)
        
        for route in self.routes:
            route_embedding = self.embedding_manager.get_embeddings(route.name)
            if route_embedding is not None:
                self.routes_embedding_cal[route.name] = route_embedding / np.linalg.norm(route_embedding, axis=1, keepdims=True)
        
    async def guide(self, query):
        """
        Guide the query to the appropriate route based on the embeddings.

        Args:
            query (str): The input query to be guided.

        Returns:
            route.Route: The route that best matches the query.
        """
        query_embedding = await embedding_model.get_embeddings([query])
        query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)

        best_route = None
        best_similarity = -1

        for route_name, route_embedding in self.routes_embedding_cal.items():
            similarity = np.dot(query_embedding, route_embedding.T).max()
            if similarity > best_similarity:
                best_similarity = similarity
                best_route = route_name

        return next((route for route in self.routes if route.name == best_route), None)

    async def guide_with_many_routes(self, query, threshold=0.5):
        """
        Guide the query to the appropriate route based on the embeddings.

        Args:
            query (str): The input query to be guided.

        Returns:
            route.Route: The route that best matches the query.
        """
        query_embedding = await embedding_model.get_embeddings([query])
        query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)

        matching_routes = []

        for route_name, route_embedding in self.routes_embedding_cal.items():
            similarity = np.dot(query_embedding, route_embedding.T).max()
            print(f"Route: {route_name}, Similarity: {similarity:.4f}")
            if similarity >= threshold:
                matching_routes.append((route_name, similarity))

        return matching_routes if matching_routes else None
