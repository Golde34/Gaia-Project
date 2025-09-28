import math
from typing import Any, Dict, List, Optional


def raw_score(hit):
    v = getattr(hit, "score", None)
    if v is None:
        v = getattr(hit, "distance", None)
    return float(v) if v is not None else 0.0


def aggregate(scores: List[float], mode: str) -> float:
    if not scores:
        return 0.0
    if mode == "max":
        return max(scores)
    if mode == "mean":
        return sum(scores) / len(scores)
    if mode == "softmax_mean":
        m = max(scores)
        exps = [math.exp(s - m) for s in scores]
        Z = sum(exps) or 1.0
        soft = [e / Z for e in exps]
        return sum(s * w for s, w in zip(scores, soft))
    return max(scores)


def stringify(x) -> str:
    if x is None:
        return ""
    if isinstance(x, (list, tuple, set)):
        return " ".join(str(t) for t in x)
    if isinstance(x, dict):
        return " ".join(f"{k} {v}" for k, v in x.items())
    return str(x)


def build_doc_text(row: dict, fields: Optional[List[str]] = None) -> str:
    # if fields not provided, use all except internal scoring keys
    use_fields = fields if fields is not None else [
        k for k in row.keys()
        if k not in {"dense_raw", "dense_score_norm", "text_score_norm", "fused_score"}
    ]
    parts = [stringify(row.get(f)) for f in use_fields]
    return " ".join([p for p in parts if p]).strip()


def extract_from_hit(h, fields: List[str], id_field: str = "id") -> Dict[str, Any]:
    ent = getattr(h, "entity", None)
    row: Dict[str, Any] = {}
    if ent is not None:
        for f in fields:
            row[f] = getattr(ent, f, None)
        # ensure id_field present if available
        if id_field not in row:
            row[id_field] = getattr(ent, id_field, getattr(h, id_field, None))
    else:
        # dict-like fallback
        for f in fields:
            row[f] = h.get(f)
        if id_field not in row:
            row[id_field] = h.get(id_field)
    return row


def distance_to_similarity(v: float, metric_: str) -> float:
    m = metric_.upper()
    if m in ("IP", "INNER_PRODUCT"):
        # Inner product: larger is better
        return v
    if m in ("L2", "EUCLIDEAN"):
        # L2: smaller is better -> invert
        return -v
    if m in ("COSINE",):
        # Milvus often returns distance ~ (1 - cosine_sim); smaller is better
        # Robust conversion:
        if 0.0 <= v <= 2.0:
            return 1.0 - v
        return -v
    # Default: treat as distance -> invert
    return -v
