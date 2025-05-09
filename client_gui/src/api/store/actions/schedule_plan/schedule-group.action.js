import { HttpMethods, serverRequest } from "../../../baseAPI";
import {
    CREATE_SCHEDULE_GROUP_FAILURE, CREATE_SCHEDULE_GROUP_REQUEST, CREATE_SCHEDULE_GROUP_SUCCESS,
    DELETE_SCHEDULE_GROUP_FAILURE, DELETE_SCHEDULE_GROUP_REQUEST, DELETE_SCHEDULE_GROUP_SUCCESS,
    SCHEDULE_GROUP_LIST_FAILURE, SCHEDULE_GROUP_LIST_REQUEST, SCHEDULE_GROUP_LIST_SUCCESS
} from "../../constants/schedule_plan/schedule-group.constants";

const portName = {
    middleware: 'middlewarePort'
}

export const createScheduleGroupAction = (scheduleGroup) => async (dispatch) => {
    dispatch({ type: CREATE_SCHEDULE_GROUP_REQUEST, payload: scheduleGroup });
    try {
        const { data } = await serverRequest('/schedule-group/create', HttpMethods.POST, portName.middleware, scheduleGroup);
        dispatch({ type: CREATE_SCHEDULE_GROUP_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: CREATE_SCHEDULE_GROUP_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const scheduleGroupList = () => async (dispatch) => {
    dispatch({ type: SCHEDULE_GROUP_LIST_REQUEST });
    try {
        const { data } = await serverRequest(`/schedule-group/list`, HttpMethods.GET, portName.middleware);
        dispatch({ type: SCHEDULE_GROUP_LIST_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: SCHEDULE_GROUP_LIST_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const deleteScheduleGroup = (scheduleGroupId) => async (dispatch) => {
    dispatch({ type: DELETE_SCHEDULE_GROUP_REQUEST, payload: scheduleGroupId });
    try {
        const { data } = await serverRequest(`/schedule-group/delete/${scheduleGroupId}`, HttpMethods.DELETE, portName.middleware);
        dispatch({ type: DELETE_SCHEDULE_GROUP_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: DELETE_SCHEDULE_GROUP_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}