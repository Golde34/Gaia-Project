import {
    NOTIFICATION_LIST_REQUEST,
    NOTIFICATION_LIST_SUCCESS,
    NOTIFICATION_LIST_FAIL,
} from '../../constants/middleware_loader/notification.constants';

export const notificationListReducer = (
    state = { loading: true, notifications: [] },
    action
) => {
    switch (action.type) {
        case NOTIFICATION_LIST_REQUEST:
            return { loading: true, notifications: [] };
        case NOTIFICATION_LIST_SUCCESS:
            return { loading: false, notifications: action.payload };
        case NOTIFICATION_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};
