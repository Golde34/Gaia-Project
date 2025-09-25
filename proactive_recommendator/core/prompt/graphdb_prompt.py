### Generate a prompt for querying a graph database
GRAPHDB_QUERY_GENERATION_PROMPT = """
You are an expert in translating natural language questions into graph database queries. Given the following context and question, generate an appropriate query to retrieve the desired information.
Context: {context}
Question: {question}
Query:
"""
