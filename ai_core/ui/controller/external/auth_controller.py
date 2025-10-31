import traceback
from fastapi import APIRouter, HTTPException, Request, Response

from core.service.integration import auth_service


AuthRouter = APIRouter(
    prefix="/auth",
    tags=["chat-hub-authentication"],
)

@AuthRouter.post("/refresh-token")
async def refresh_token(request: Request, response: Response):
    try:
        refresh_token = request.cookies.get("refreshToken")
        if not refresh_token or refresh_token == "":
            raise HTTPException(status_code=403, detail="Unauthorized")
        new_access_token = await auth_service.refresh_token(refresh_token)
        response.set_cookie(
            key="accessToken",
            value=new_access_token,
            httponly=True,
            # secure=True, ## Using HTTPS
            samesite="Lax",
            max_age=15*60,  # 15 minutes
        )
        return {"message": "Token refreshed successfully"}
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
