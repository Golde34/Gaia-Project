import {
    USER_SIGNIN_REQUEST, USER_SIGNIN_SUCCESS, USER_SIGNIN_FAIL,
    BOSS_SIGNIN_REQUEST, BOSS_SIGNIN_SUCCESS, BOSS_SIGNIN_FAIL,
    GAIA_SIGNIN_REQUEST, GAIA_SIGNIN_SUCCESS, GAIA_SIGNIN_FAIL,
    USER_SIGNOUT,
    GET_CHAT_HUB_JWT_REQUEST, GET_CHAT_HUB_JWT_SUCCESS,
    GET_CHAT_HUB_JWT_FAIL,
    GET_NOTIFICATION_JWT_REQUEST,
    GET_NOTIFICATION_JWT_SUCCESS,
    GET_NOTIFICATION_JWT_FAIL,
} from '../../constants/auth_service/auth.constants';

export const gaiaSigninReducer = (state = {}, action) => {
    switch (action.type) {
        case GAIA_SIGNIN_REQUEST:
            return { loading: true };
        case GAIA_SIGNIN_SUCCESS:
            return { loading: false, gaiaInfo: action.payload };
        case GAIA_SIGNIN_FAIL:
            return { loading: false, error: action.payload };
        case USER_SIGNOUT:
            return { loading: false, gaiaInfo: null };
        default:
            return state;
    }
}

export const bossSigninReducer = (state = {}, action) => {
    switch (action.type) {
        case BOSS_SIGNIN_REQUEST:
            return { loading: true };
        case BOSS_SIGNIN_SUCCESS:
            return { loading: false, userInfo: action.payload };
        case BOSS_SIGNIN_FAIL:
            return { loading: false, error: action.payload };
        case USER_SIGNOUT:
            return { loading: false, userInfo: null };
        default:
            return state;
    }
}

export const userSigninReducer = (state = {}, action) => {
    switch (action.type) {
        case USER_SIGNIN_REQUEST:
            return { loading: true };
        case USER_SIGNIN_SUCCESS:
            return { loading: false, userInfo: action.payload };
        case USER_SIGNIN_FAIL:
            return { loading: false, error: action.payload };
        case USER_SIGNOUT:
            return { loading: false, userInfo: null };
        default:
            return state;
    }
}

export const getChatHubJwtReducer = (state = {}, action) => {
    switch (action.type) {
        case GET_CHAT_HUB_JWT_REQUEST:
            return { loading: true };
        case GET_CHAT_HUB_JWT_SUCCESS:
            return { loading: false, chatHubJwt: action.payload };
        case GET_CHAT_HUB_JWT_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state; I
    }
}

export const getNotificationJwtReducer = (state = {}, action) => {
    switch (action.type) {
        case GET_NOTIFICATION_JWT_REQUEST:
            return { loading: true };
        case GET_NOTIFICATION_JWT_SUCCESS:
            return { loading: false, notificationJwt: action.payload };
        case GET_NOTIFICATION_JWT_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}