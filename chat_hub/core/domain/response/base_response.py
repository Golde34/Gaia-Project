class BaseResponse:
    status: str
    status_message: str
    error_code: int 
    error_message: str
    data: dict

    def __init__(self, status: str, status_message: str, error_code: int, error_message: str, data: dict):
        self.status = status
        self.status_message= status_message
        self.error_code= error_code
        self.error_message= error_message
        self.data = data 

    def __str__(self):
        return f"BaseResponse({self.status}, {self.status_message}, {self.error_code}, {self.error_message}, {self.data})"
    
    def to_dict(self):
        return {
            "status": self.status,
            "statusMessage": self.status_message,
            "errorCode": self.error_code,
            "errorMessage": self.error_message,
            "data": self.data
        }

def return_success_response(status_message: str, data: dict):
    """
    Return a success response object.
    Args:
        data (dict): The data of the response.
    Returns:
        BaseResponse: The response object.
    """
    return BaseResponse("success", status_message, 200, "Success", data).to_dict()

def return_clarification_response(status_message: str, data: dict):
    """
    Return a clarification response object.
    Args:
        status_message (str): The status message of the response.
        data (dict): The data of the response.
    Returns:
        BaseResponse: The response object.
    """
    return BaseResponse("clarification", status_message, 200, "Clarification needed", data).to_dict()

def return_response(status: str, status_message: str, error_code: int, error_message: str, data: dict):
    """
    Return a response object.
    Args:
        status (str): The status of the response.
        status_message (str): The status message of the response.
        error_code (int): The error code of the response.
        error_message (str): The error message of the response.
        data (dict): The data of the response.
    Returns:
        BaseResponse: The response object.
    """
    return BaseResponse(status, status_message, error_code, error_message, data).to_dict()