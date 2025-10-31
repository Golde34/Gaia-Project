import json

def parse_json_string(s: str):
    """
    Parse a JSON string, removing ```json and ``` markers if present.

    Args:
        s (str): Input string possibly wrapped with ```json and ```.

    Returns:
        dict or list: Parsed JSON data.

    Raises:
        ValueError: If the string cannot be parsed as JSON.
    """
    s = s.strip()
    if s.startswith("```json"):
        s = s[len("```json"):].strip()
    if s.endswith("```"):
        s = s[:-len("```")].strip()
    
    return json.loads(s)

def bytes_to_str(obj):
    if isinstance(obj, bytes):
        return obj.decode("utf-8")
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])
