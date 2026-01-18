from typing import List


def extract_keywords(text: str) -> List[str]:
    """
    Simple keyword extraction - split by space, lowercase, remove stop words.
    """
    if not text:
        return []
    
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 
        'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were'
    }
    
    words = text.lower().replace(',', ' ').replace('.', ' ').split()
    keywords = [w.strip() for w in words if w.strip() and w not in stop_words and len(w) > 2]
    
    # Remove duplicates while preserving order
    seen = set()
    unique_keywords = []
    for kw in keywords:
        if kw not in seen:
            seen.add(kw)
            unique_keywords.append(kw)
    
    return unique_keywords