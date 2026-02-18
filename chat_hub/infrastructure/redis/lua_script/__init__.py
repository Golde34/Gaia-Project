from pathlib import Path
from infrastructure.redis.redis import rd


class LuaScripts:
    """Centralized Lua script manager for Redis"""
    
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self._scripts = {}
    
    @property
    def build_wmg_memory(self):
        return self._load_script('wmg_memory')

    @property
    def update_stag_metadata(self):
        return self._load_script('stag_metadata')
    
    def _load_script(self, script_name: str):
        """Load and register a lua script"""
        if script_name not in self._scripts:
            script_path = self.script_dir / f"{script_name}.lua"
            with open(script_path, 'r') as f:
                lua_code = f.read()
            self._scripts[script_name] = rd.register_script(lua_code)
        return self._scripts[script_name]


# Singleton instance
lua_scripts = LuaScripts()
