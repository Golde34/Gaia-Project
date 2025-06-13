from typing import List

class Route():
    def __init__(self, name: str = None, samples: List[str] = None):
        self.name = name
        self.samples = samples if samples is not None else []