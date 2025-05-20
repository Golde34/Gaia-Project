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