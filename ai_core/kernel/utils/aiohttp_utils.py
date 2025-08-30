import aiohttp


async def request(endpoint: str, method: str, payload: dict = None, params: dict = None, header: dict = None) -> dict:
    """
    Sends an HTTP request (GET, POST, PUT, DELETE, etc.) to the specified endpoint with optional parameters, payload, and headers.

    Args:
        endpoint (str): The URL to which the request is sent.
        method (str): The HTTP method (GET, POST, PUT, DELETE, etc.).
        payload (dict, optional): The data to be sent in the request body.
        params (dict, optional): Query parameters to include in the request.
        header (dict, optional): Additional headers to include in the request.

    Returns:
        dict: The JSON response from the server.

    Raises:
        Exception: If the request fails or if the response status is not a success (2xx).
    """
    async with aiohttp.ClientSession() as session:
        async with session.request(method, endpoint, json=payload, params=params, headers=header) as response:
            if response.status < 200 or response.status >= 300:
                error_message = await response.text()
                raise Exception(f"Request failed with status {response.status}: {error_message}")
            return await response.json()

async def post(endpoint: str, payload: dict, header: dict = None) -> dict:
    return await request(endpoint, 'POST', payload=payload, header=header)

async def get(endpoint: str, params: dict = None, header: dict = None) -> dict:
    return await request(endpoint, 'GET', params=params, header=header)

async def delete(endpoint: str, params: dict = None, header: dict = None) -> dict:
    return await request(endpoint, 'DELETE', params=params, header=header)

async def put(endpoint: str, payload: dict, header: dict = None) -> dict:
    return await request(endpoint, 'PUT', payload=payload, header=header)

async def patch(endpoint: str, payload: dict, header: dict = None) -> dict:
    return await request(endpoint, 'PATCH', payload=payload, header=header)

async def head(endpoint: str, params: dict = None, header: dict = None) -> dict:
    return await request(endpoint, 'HEAD', params=params, header=header)

async def options(endpoint: str, params: dict = None, header: dict = None) -> dict:
    return await request(endpoint, 'OPTIONS', params=params, header=header)
