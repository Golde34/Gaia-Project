import { HttpMethods, serverRequest } from "../../../baseAPI";
import {
    CHOOSE_TASK_BATCH_FAILURE, CHOOSE_TASK_BATCH_REQUEST, CHOOSE_TASK_BATCH_SUCCESS,
    SCHEDULE_TASK_BATCH_FAILURE, SCHEDULE_TASK_BATCH_REQUEST, SCHEDULE_TASK_BATCH_SUCCESS,
    SCHEDULE_TASK_LIST_FAILURE, SCHEDULE_TASK_LIST_REQUEST, SCHEDULE_TASK_LIST_SUCCESS,
    TASK_BATCH_LIST_FAILURE, TASK_BATCH_LIST_REQUEST, TASK_BATCH_LIST_SUCCESS
} from "../../constants/schedule_plan/schedule-task.constants"

const portName = {
    middleware: 'middlewarePort'
}

export const getScheduleTaskList = () => async (dispatch) => {
    dispatch({ type: SCHEDULE_TASK_LIST_REQUEST });
    try {
        const { data } = await serverRequest(`/schedule-task/list`, HttpMethods.GET, portName.middleware);
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

export const getScheduleTaskBatchList = () => {
    return async (dispatch) => {
        dispatch({ type: TASK_BATCH_LIST_REQUEST });
        try {
            const { data } = await serverRequest(`/schedule-task/task-batch-list`, HttpMethods.GET, portName.middleware);
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


export const chooseTaskBatch = (batchNumber) => async (dispatch) => {
    dispatch({ type: CHOOSE_TASK_BATCH_REQUEST, payload: batchNumber });
    try {
        const body = {
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

export const getActiveTaskBatch = () => async (dispatch) => {
    dispatch({ type: SCHEDULE_TASK_BATCH_REQUEST });
    try {
        const { data } = await serverRequest(`/schedule-task/active-task-batch`, HttpMethods.GET, portName.middleware);
        dispatch({ type: SCHEDULE_TASK_BATCH_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: SCHEDULE_TASK_BATCH_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}
