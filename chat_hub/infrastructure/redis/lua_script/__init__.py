from pathlib import Path

from redis import Redis
from infrastructure.redis.redis import rd


class LuaScripts:
    """Centralized Lua script manager for Redis"""
    
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self._scripts = {}
        self._cache = {}
    
    @property
    def build_wmg_memory(self):
        return self._load_script('wmg_memory')

    @property
    def update_stag_metadata(self):
        return self._load_script('stag_metadata')

    @property
    def decay_stag_nodes(self):
        return self._get_code('decay_stag_nodes')
    
    def _load_script(self, script_name: str):
        """Load and register a lua script"""
        if script_name not in self._scripts:
            script_path = self.script_dir / f"{script_name}.lua"
            with open(script_path, 'r') as f:
                lua_code = f.read()
            self._scripts[script_name] = rd.register_script(lua_code)
        return self._scripts[script_name]
    
    def _get_code(self, script_name: str) -> str:
        """Get the raw Lua code for a script (for debugging)"""
        if script_name not in self._cache:
            script_path = self.script_dir / f"{script_name}.lua"
            with open(script_path, 'r') as f:
                self._cache[script_name] = f.read()
        return self._cache[script_name]


# Singleton instance
lua_scripts = LuaScripts()
