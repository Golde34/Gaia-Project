import { HttpMethods, serverRequest } from "../../../baseAPI";
import {
    QUERY_TASK_CONFIG_FAIL, QUERY_TASK_CONFIG_REQUEST, QUERY_TASK_CONFIG_SUCCESS,
    REGISTER_TASK_CONFIG_FAIL, REGISTER_TASK_CONFIG_REQUEST, REGISTER_TASK_CONFIG_SUCCESS
}
    from "../../constants/onboarding/task-registration.constants";

const portName = {
    middlewarePort: 'middlewarePort'
}

export const queryTaskConfig = () => async (dispatch) => {
    dispatch({ type: QUERY_TASK_CONFIG_REQUEST });
    try {
        const { data } = await serverRequest(`/work-optimization/query-task-config`,
            HttpMethods.GET,
            portName.middlewarePort);
        dispatch({ type: QUERY_TASK_CONFIG_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: QUERY_TASK_CONFIG_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const registerTaskConfig = (taskConfig) => async (dispatch) => {
    dispatch({ type: REGISTER_TASK_CONFIG_REQUEST, payload: taskConfig });
    try {
        const { data } = await serverRequest('/work-optimization/register-task-config', HttpMethods.POST, portName.middlewarePort, taskConfig);
        dispatch({ type: REGISTER_TASK_CONFIG_SUCCESS, payload: data });
        return data.data.registerTaskConfig;
    } catch (error) {
        dispatch({
            type: REGISTER_TASK_CONFIG_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const queryDailyRoutineCalendar = () => async (dispatch) => {
    dispatch({ type: QUERY_DAILY_ROUTINE_CALENDAR_REQUEST });
}