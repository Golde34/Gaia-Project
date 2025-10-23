from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from core.service.integration import auth_service


class ValidateAccessTokenMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        no_auth_required = ["/chat-system", "refresh-token"]
        
        if any(path in request.url.path for path in no_auth_required):
            response = await call_next(request)
            return response

        # Validate refresh token
        if not validate_refresh_token(request):
            raise HTTPException(status_code=403, detail="Unauthorized")

        # Validate access token
        access_token, ctx_with_user = await validate_access_token(request)
        if not access_token or not ctx_with_user:
            raise HTTPException(status_code=401, detail="Unauthorized")

        request.state.user = ctx_with_user

        response = await call_next(request)
        return response

# Dependency function for validating refresh token
def validate_refresh_token(request: Request) -> bool:
    refresh_cookie = request.cookies.get("refreshToken")
    if refresh_cookie:
        return bool(refresh_cookie)
    
    refresh_header = request.headers.get("Refresh-Token")
    if refresh_header:
        return bool(refresh_header.strip())
    
    return False

# Dependency function for validating access token
async def validate_access_token(request: Request):
    access_token = request.cookies.get("accessToken")
    if not access_token:
        access_header = request.headers.get("Access-Token")
        if not access_header:
            raise HTTPException(status_code=401, detail="Unauthorized: Missing Access Token")
        access_token = access_header.strip()
        if not access_token:
            raise HTTPException(status_code=401, detail="Unauthorized: Empty Access Token")

    # Simulate token check with a service
    try:
        # Replace with actual service call
        token_response = await auth_service.check_token(access_token)
        if not token_response:
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid Token")
        
        # Simulate context update with user ID
        ctx_with_user = {"user_id": token_response["id"]}
        return access_token, ctx_with_user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Token")
