import { HttpMethods, serverRequest } from "../../../baseAPI";
import { USER_DETAIL_FAIL, USER_DETAIL_REQUEST, USER_DETAIL_SUCCESS, 
    USER_LIST_FAIL, USER_LIST_REQUEST, USER_LIST_SUCCESS, 
    USER_SETTING_UPDATE_FAILURE, 
    USER_SETTING_UPDATE_REQUEST, 
    USER_SETTING_UPDATE_SUCCESS, 
    USER_UPDATE_FAIL, USER_UPDATE_REQUEST, USER_UPDATE_SUCCESS 
} from "../../constants/auth_service/user.constants";

const portName = {
    authPort: 'authenticationServicePort',
    middlewarePort: 'middlewarePort'
}

export const getUsers = () => async (dispatch) => {
    dispatch({ type: USER_LIST_REQUEST });
    try {
        const { data } = await serverRequest('/user/get-all-users', HttpMethods.GET, portName.middlewarePort, null);
        dispatch({ type: USER_LIST_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: USER_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const updateUser = (user) => async (dispatch) => {
    dispatch({ type: USER_UPDATE_REQUEST });
    try {
        const { data } = await serverRequest('/user/update-user', HttpMethods.PUT, portName.middlewarePort, user);
        dispatch({ type: USER_UPDATE_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: USER_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const userProfile = (userId) => async (dispatch) => {
    dispatch({ type: USER_DETAIL_REQUEST , payload: userId });
    try {
        const { data } = await serverRequest(`/user/detail/${userId}`, HttpMethods.GET, portName.middlewarePort);
        dispatch({ type: USER_DETAIL_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: USER_DETAIL_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const updateUserSetting = (updateUserSettingRequest) => async (dispatch) => {
    dispatch({ type: USER_SETTING_UPDATE_REQUEST,  payload: updateUserSettingRequest });
    try {
        const { data } = await serverRequest('/user-setting/update', HttpMethods.PUT, portName.middlewarePort, updateUserSettingRequest);
        dispatch({ type: USER_SETTING_UPDATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: USER_SETTING_UPDATE_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}
