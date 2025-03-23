import { HttpMethods, serverRequest } from "../../../baseAPI";
import {
    CHOOSE_TASK_BATCH_FAILURE, CHOOSE_TASK_BATCH_REQUEST, CHOOSE_TASK_BATCH_SUCCESS,
    CREATE_SCHEDULE_TASK_FAILURE, CREATE_SCHEDULE_TASK_REQUEST, CREATE_SCHEDULE_TASK_SUCCESS,
    REPEAT_SCHEDULE_TASK_LIST_FAILURE, REPEAT_SCHEDULE_TASK_LIST_REQUEST, REPEAT_SCHEDULE_TASK_LIST_SUCCESS,
    SCHEDULE_TASK_LIST_FAILURE, SCHEDULE_TASK_LIST_REQUEST, SCHEDULE_TASK_LIST_SUCCESS,
    TASK_BATCH_LIST_FAILURE, TASK_BATCH_LIST_REQUEST, TASK_BATCH_LIST_SUCCESS
} from "../../constants/schedule_plan/schedule-task.constants"

const portName = {
    middleware: 'middlewarePort'
}

export const getScheduleTaskList = (userId) => async (dispatch) => {
    dispatch({ type: SCHEDULE_TASK_LIST_REQUEST, payload: userId });
    try {
        const { data } = await serverRequest(`/schedule-task/${userId}`, HttpMethods.GET, portName.middleware);
        if (data == null) {
            dispatch({
                type: SCHEDULE_TASK_LIST_FAILURE,
                payload: 'No schedule task found',
            });
            return
        }
        dispatch({ type: SCHEDULE_TASK_LIST_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: SCHEDULE_TASK_LIST_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getScheduleTaskBatchList = (userId) => {
    return async (dispatch) => {
        dispatch({ type: TASK_BATCH_LIST_REQUEST, payload: userId });
        try {
            const { data } = await serverRequest(`/schedule-task/task-batch-list/${userId}`, HttpMethods.GET, portName.middleware);
            dispatch({ type: TASK_BATCH_LIST_SUCCESS, payload: data });
            return data.scheduleBatchTask;
        } catch (error) {
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            dispatch({
                type: TASK_BATCH_LIST_FAILURE,
                payload: errorMessage,
            });
            throw error;
        }
    }
}


export const chooseTaskBatch = (userId, batchNumber) => async (dispatch) => {
    dispatch({ type: CHOOSE_TASK_BATCH_REQUEST, payload: batchNumber });
    try {
        const body = {
            userId: userId,
            batchNumber: batchNumber
        }
        const { data } = await serverRequest(`/schedule-task/choose-task-batch`, HttpMethods.POST, portName.middleware, body);
        dispatch({ type: CHOOSE_TASK_BATCH_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: CHOOSE_TASK_BATCH_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }

}

export const createScheduleTaskAction = (scheduleTask) => async (dispatch) => {
    dispatch({ type: CREATE_SCHEDULE_TASK_REQUEST, payload: scheduleTask });
    try {
        const { data } = await serverRequest('/schedule-task/create', HttpMethods.POST, portName.middleware, scheduleTask);
        dispatch({ type: CREATE_SCHEDULE_TASK_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: CREATE_SCHEDULE_TASK_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const repeatScheduleTaskList = (userId) => async (dispatch) => {
    dispatch({ type: REPEAT_SCHEDULE_TASK_LIST_REQUEST, payload: userId });
    try {
        const { data } = await serverRequest(`/schedule-task/get-schedule-list/${userId}`, HttpMethods.GET, portName.middleware);
        console.log(data);
        dispatch({ type: REPEAT_SCHEDULE_TASK_LIST_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: REPEAT_SCHEDULE_TASK_LIST_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}
