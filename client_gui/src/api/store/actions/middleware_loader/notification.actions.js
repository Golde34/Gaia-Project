import { HttpMethods, serverRequest } from '../../../baseAPI';
import {
    NOTIFICATION_LIST_REQUEST,
    NOTIFICATION_LIST_SUCCESS,
    NOTIFICATION_LIST_FAIL,
} from '../../constants/middleware_loader/notification.constants';

const portName = {
    middlewarePort: 'middlewarePort',
};

export const getNotificationList = () => async (dispatch) => {
    dispatch({ type: NOTIFICATION_LIST_REQUEST });
    try {
        const { data } = await serverRequest('/notification/all', HttpMethods.GET, portName.middlewarePort, null);
        dispatch({ type: NOTIFICATION_LIST_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: NOTIFICATION_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};
