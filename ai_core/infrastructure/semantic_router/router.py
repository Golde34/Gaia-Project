import numpy as np
from sentence_transformers import SentenceTransformer


class SemanticRouter:
    def __init__(self, routes, model_name):
        self.routes = routes
        self.model_name = model_name
        self.embedding_model = SentenceTransformer(model_name)
        self.routes_embedding = {}
        self.routes_embedding_cal = {}
        
        for route in self.routes:
            self.routes_embedding[route.name] = self.embedding_model.encode(route.samples)
            
        for route in self.routes:
            self.routes_embedding_cal[route.name] = self.routes_embedding[route.name] / np.linalg.norm(self.routes_embedding[route.name], axis=1, keepdims=True)
            
    def get_routes(self):
        return self.routes
    
    def guide(self, query):
        query_embedding = self.embedding_model.encode([query])
        query_embedding = query_embedding / np.linalg.norm(query_embedding, axis=1, keepdims=True)
        scores = []
        
        for route in self.routes:
            route_embedding_cal = self.routes_embedding_cal[route.name]
            score = np.mean(np.dot(route_embedding_cal, query_embedding.T).flatten())
            scores.append((route, score))
            
        scores.sort(reverse=True)
        return scores[0] 