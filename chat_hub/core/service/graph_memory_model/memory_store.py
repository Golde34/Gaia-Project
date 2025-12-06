class MemoryStore:
    def __init__(self):
        self.store = {}

    def add_memory(self, key, value):
        self.store[key] = value

    def get_memory(self, key):
        return self.store.get(key, None)

    def delete_memory(self, key):
        if key in self.store:
            del self.store[key]