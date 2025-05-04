import { config } from '../kernels/configs/configuration';
import Axios from 'axios';

const HttpMethods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    CREDENTIAL_POST: 'CREDENTIAL_POST'
};

const serverRequest = async (api, method, portName, body, headers) => {
    const apiHost = config[portName];

    if (apiHost == null) {
        console.log(`No port config for ${portName}`);
        return null;
    }

    let timeOut = config.serverTimeout;
    if (isNaN(timeOut)) {
        console.log(`Invalid timeout config for ${portName}`);
        timeOut = 10000;
    }

    return await baseRequest(api, method, { portName, timeOut }, body, headers);
}

const baseRequest = async (api, method, portConfig, body, headers) => {
    const { portName, timeout } = portConfig;

    const url = `http://${config.serverHost}:${config[portName]}${api}`;

    headers = headers || getDefaultHeaders();
    const requestHeaders = {};
    for (let [key, value] of headers.entries()) {
        requestHeaders[key] = value;
    }

    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeout);
    const requestConfig = {
        method,
        headers: requestHeaders,
        body: body == null ? null : JSON.stringify(body)
    };

    console.log(
        `Requesting to ${method} ${url} with config: ${JSON.stringify(requestConfig)}`
    );
    try {
        const response = await _fetchData(url, method, body, headers);
        clearTimeout(timerId);
        if (response.status !== 200) {
            // handleUnauthorizedResponse(response, portName);
            if (response.status === 401) {
                const refreshUrl = `http://${config.serverHost}:${config[portName]}/auth/refresh-token`;
                console.info('Access token expired, trying to refresh...');
                try {
                    await _fetchData(refreshUrl, HttpMethods.POST, null, headers);
                    // Retry the original request with the new access token
                    const retry = await _fetchData(url, method, body, headers);
                    return retry;
                } catch (refreshErr) {
                    console.error('Refresh token failed, redirecting to login', refreshErr);
                    throw refreshErr;
                }
            }

            if (response.status === 403) {
                // refresh token expired
                console.error('Refresh token expired, redirecting to login');
                // window.location.href = '/client-gui/signin';
            }
        }
        return response;
    } catch (error) {
        clearTimeout(timerId);
        return error;
    }


}

const getDefaultHeaders = () => {
    const headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    return headers;
};

const _fetchData = async (url, method, body, headers) => {
    const config = {
        headers: headers || {},
        withCredentials: true
    };

    switch (method) {
        case "GET":
            try {
                const getResponse = await Axios.get(url, config);
                return getResponse;
            } catch (error) {
                return error;
            }
        case "POST":
            try {
                const postResponse = await Axios.post(url, body, config);
                return postResponse;
            } catch (error) {
                return error;
            }
        case "PUT":
            try {
                const putResponse = await Axios.put(url, body, config);
                return putResponse;
            } catch (error) {
                return error;
            }
        case "DELETE":
            try {
                if (body) {
                    config.data = body;
                }
                const deleteResponse = await Axios.delete(url, config);
                return deleteResponse;
            } catch (error) {
                return error;
            }
        default:
            return null;
    }
};

const postFile = async (api, portName, formData) => {
    const apiHost = config[portName];

    if (apiHost == null) {
        console.log(`No port config for ${portName}`);
        return null;
    }

    let timeOut = config.serverTimeout;
    if (isNaN(timeOut)) {
        console.log(`Invalid timeout config for ${portName}`);
        timeOut = 10000;
    }

    const url = `http://${config.serverHost}:${config[portName]}${api}`;
    console.log(`Posting file to ${url}`);

    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    return response;
}

const handleUnauthorizedResponse = async (response, portName, headers) => {
    // refresh access token if needed

}

export {
    HttpMethods,
    getDefaultHeaders,
    baseRequest,
    serverRequest,
    postFile
}