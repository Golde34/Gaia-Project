import { HttpMethods, serverRequest } from "../../../baseAPI";
import { CREATE_SCHEDULE_GROUP_FAILURE, CREATE_SCHEDULE_GROUP_REQUEST, CREATE_SCHEDULE_GROUP_SUCCESS } from "../../constants/schedule_plan/schedule-group.constants";

const portName = {
    middleware: 'middlewarePort'
}

export const createScheduleGroupAction = (scheduleGroup) => async (dispatch) => {
    dispatch({ type: CREATE_SCHEDULE_GROUP_REQUEST, payload: scheduleGroup });
    try {
        const { data } = await serverRequest('/schedule-group', HttpMethods.POST, portName.middleware, scheduleGroup);
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