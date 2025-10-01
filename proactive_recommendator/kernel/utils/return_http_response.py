import json

from core.domain.response.base_response import BaseResponse, return_response


def client_return(result: any):
    if not result:
        print("??? user does not exist or what? --> logging tracker")
        return None
    if isinstance(result, str):
        try:
            response = json.loads(result)
        except json.JSONDecodeError:
            return return_response(
                status="error",
                status_message="Invalid JSON response",
                error_code=500,
                error_message="Could not decode response from service",
                data={}
            )
    else:
        response = result

    return BaseResponse(
        status=response.get("status", "error"),
        status_message=response.get("statusMessage", ""),
        error_code=response.get("errorCode", 500),
        error_message=response.get("errorMessage", "Unknown error"),
        data=response.get("data", {})
    )