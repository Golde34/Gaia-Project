from neo4j import GraphDatabase


class GraphDBConnection:
    def __init__(self, uri, user, password):
        self.uri = uri
        self.user = user
        self.password = password
        self._driver = None
        self._session = None

    def connect(self):
        self._driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
        self._session = self._driver.session()

    def close(self):
        if self._session:
            self._session.close()
        if self._driver:
            self._driver.close()
    
    def query(self, query, parameters=None):
        if not self._session:
            raise Exception("Database connection is not established.")
        result = self._session.run(query, parameters or {})
        return [record for record in result]
