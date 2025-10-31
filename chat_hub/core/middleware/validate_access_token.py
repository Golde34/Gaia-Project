from typing import Optional, Tuple, Dict, Any
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from core.service.integration import auth_service


NO_AUTH_REQUIRED_PATHS = [
    "/chat-system",
    "/auth/refresh-token",
]

ACCESS_COOKIE_NAME = "accessToken"
REFRESH_COOKIE_NAME = "refreshToken"


class ValidateAccessTokenMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        if any(request.url.path.startswith(p) for p in NO_AUTH_REQUIRED_PATHS):
            return await call_next(request)

        refresh_ok = validate_refresh_token(request)
        if not refresh_ok:
            return JSONResponse({"detail": "Unauthorized"}, status_code=403)

        access_token, ctx_with_user = await validate_access_token(request)
        if not access_token or not ctx_with_user:
            return JSONResponse({"detail": "Unauthorized"}, status_code=401)

        request.state.user = ctx_with_user

        try:
            response = await call_next(request)
        except Exception:
            return JSONResponse({"detail": "Internal Server Error"}, status_code=500)

        return response


def validate_refresh_token(request: Request) -> bool:
    refresh_cookie = request.cookies.get(REFRESH_COOKIE_NAME)
    if refresh_cookie and refresh_cookie.strip():
        return True

    refresh_header = request.headers.get("Refresh-Token")
    if refresh_header and refresh_header.strip():
        return True

    return False


async def validate_access_token(request: Request) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
    token: Optional[str] = None

    token = request.cookies.get(ACCESS_COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            token = auth_header[7:].strip()

    if not token:
        header_token = request.headers.get("Access-Token", "")
        if header_token.strip():
            token = header_token.strip()

    if not token:
        return None, None

    try:
        token_response = await auth_service.check_token(token)
        if not token_response:
            return None, None

        ctx_with_user = {
            "user_id": token_response.get("id"),
            "roles": token_response.get("roles", []),
            "scopes": token_response.get("scopes", []),
        }
        return token, ctx_with_user
    except Exception:
        return None, None
