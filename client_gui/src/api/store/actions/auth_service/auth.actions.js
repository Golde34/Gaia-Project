import { HttpMethods, serverRequest } from '../../../baseAPI';
import {
    GAIA_SIGNIN_FAIL, GAIA_SIGNIN_REQUEST, GAIA_SIGNIN_SUCCESS,
    GET_CHAT_HUB_JWT_FAIL, GET_CHAT_HUB_JWT_REQUEST, GET_CHAT_HUB_JWT_SUCCESS,
    GET_NOTIFICATION_JWT_FAIL,
    GET_NOTIFICATION_JWT_REQUEST,
    GET_NOTIFICATION_JWT_SUCCESS,
    USER_SIGNIN_FAIL, USER_SIGNIN_REQUEST, USER_SIGNIN_SUCCESS,
    USER_SIGNOUT
} from '../../constants/auth_service/auth.constants';

const portName = {
    auth: 'authenticationServicePort',
    gaia: 'gaiaConnectorPort',
    middleware: 'middlewarePort',
}

// GAIA signin autimatically
// Call to middleware to Gaia
export const gaiaSignin = () => async (dispatch) => {
    dispatch({ type: GAIA_SIGNIN_REQUEST });
    try {
        const response = await serverRequest('/gaia/gaia-connect', HttpMethods.GET, portName.middleware, null);
        const data = JSON.stringify(response.data);
        dispatch({ type: GAIA_SIGNIN_SUCCESS, payload: response.data.accessToken });

        localStorage.setItem('gaiaInfo', JSON.stringify(data))
        localStorage.setItem('gaiaRefreshToken', JSON.parse(data)['refreshToken']);
        localStorage.setItem('gaiaAccessToken', JSON.parse(data)['accessToken']);

    } catch (error) {
        dispatch({
            type: GAIA_SIGNIN_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
    }
}

export const signin = (username, password) => async (dispatch) => {
    dispatch({ type: USER_SIGNIN_REQUEST, payload: { username, password } });
    try {
        const response = await serverRequest('/auth/sign-in', HttpMethods.POST, portName.middleware, { username, password });
        const data = JSON.stringify(response.data.userInfo)
        dispatch({ type: USER_SIGNIN_SUCCESS, payload: data });
        localStorage.setItem('userInfo', data);
    } catch (error) {
        dispatch({
            type: USER_SIGNIN_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const signout = () => (dispatch) => {
    localStorage.removeItem('gaiaInfo');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('gaiaAccessToken');
    localStorage.removeItem('bossInfo');
    // remove coookies
    dispatch({ type: USER_SIGNOUT });
};

export const getUserChatHubJwt = () => async (dispatch) => {
    dispatch({ type: GET_CHAT_HUB_JWT_REQUEST });
    try {
        const body = {
            service: "ChatHub",
        }
        const response = await serverRequest('/auth/get-service-jwt', HttpMethods.POST, portName.middleware, body);
        const data = JSON.stringify(response.data);
        dispatch({ type: GET_CHAT_HUB_JWT_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: GET_CHAT_HUB_JWT_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getNotificationJwt = () => async (dispatch) => {
    dispatch({ type: GET_NOTIFICATION_JWT_REQUEST });
    try {
        const body = {
            service: "NotifyAgent",
        }
        const response = await serverRequest('/auth/get-service-jwt', HttpMethods.POST, portName.middleware, body);
        const data = JSON.stringify(response.data);
        dispatch({ type: GET_NOTIFICATION_JWT_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: GET_NOTIFICATION_JWT_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}