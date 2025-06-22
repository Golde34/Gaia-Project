import numpy as np

from infrastructure.embedding.base_embedding import embedding_model


class SemanticRouter:
    def __init__(self, routes, model_name):
        self.routes = routes
        self.model_name = model_name
        self.embedding_model = embedding_model 
        self.routes_embedding = {}
        self.routes_embedding_cal = {}
        
    async def initialize(self):
        for route in self.routes:
            self.routes_embedding[route.name] = self.embedding_model.get_embeddings(route.samples)
            
        for route in self.routes:
            self.routes_embedding_cal[route.name] = self.routes_embedding[route.name] / np.linalg.norm(self.routes_embedding[route.name], axis=1, keepdims=True)
            
    def get_routes(self):
        return self.routes
    
    async def guide(self, query):
        query_embedding = await self.embedding_model.get_embeddings([query])
        query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)
        scores = []
        
        for route in self.routes:
            route_embedding_cal = self.routes_embedding_cal[route.name]
            score = np.mean(np.dot(route_embedding_cal, query_embedding.T).flatten())
            scores.append((route, score))
            
        scores.sort(reverse=True)
        return scores[0] 

class SemanticRouter:
    def __init__(self, routes, model_name):
        self.routes = routes
        self.model_name = model_name
        self.embedding_model = embedding_model 
        self.routes_embedding = {}
        self.routes_embedding_cal = {}

    async def initialize(self):
        for route in self.routes:
            self.routes_embedding[route.name] = await self.embedding_model.get_embeddings(route.samples)
        for route in self.routes:
            self.routes_embedding_cal[route.name] = self.routes_embedding[route.name] / np.linalg.norm(self.routes_embedding[route.name], axis=1, keepdims=True)

    def get_routes(self):
        return self.routes

    async def guide(self, query):
        query_embedding = await self.embedding_model.get_embeddings([query])
        query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)
        scores = []
        for route in self.routes:
            route_embedding_cal = self.routes_embedding_cal[route.name]
            score = np.mean(np.dot(route_embedding_cal, query_embedding.T).flatten())
            scores.append((route, score))
        scores.sort(reverse=True, key=lambda x: x[1])
        return scores[0]