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
    switch (method) {
        case "GET":
            try {
                const getResponse = await Axios.get(url, {
                    headers: headers,
                    body: body,
                    withCredentials: true,
                })
                return getResponse;
            } catch (error) {
                return error;
            }
        case "POST":
            try {
                const postResponse = await Axios.post(url, {
                    headers: headers,
                    body: body,
                    withCredentials: true,
                })
                return postResponse;
            } catch (error) {
                return error;
            }
        case "PUT":
            try {
                const putResponse = await Axios.put(url, {
                    headers: headers,
                    body: body,
                    withCredentials: true,
                })
                return putResponse;
            } catch (error) {
                return error;
            }
        case "DELETE":
            try {
                const deleteResponse = await Axios.delete(url, {
                    headers: headers,
                    body: body,
                    withCredentials: true,
                })
                return deleteResponse;
            } catch (error) {
                return error;
            }
        // case "CREDENTIAL_POST":
        //     try {
        //         const credentialResponse = Axios.create({
        //             withCredentials: true,
        //             headers: {
        //                 "Content-Type": "application/json",
        //             },
        //         });
        //         return credentialResponse.post(
        //             url, {
        //                 headers: headers,
        //                 body: body
        //             }
        //         )
        //     } catch (error) {
        //         return error;
        //     }
        default:
            return null;
    }
}

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

export {
    HttpMethods,
    getDefaultHeaders,
    baseRequest,
    serverRequest,
    postFile
}