import {
    SCHEDULE_TASK_LIST_FAILURE, SCHEDULE_TASK_LIST_REQUEST, SCHEDULE_TASK_LIST_SUCCESS,
    TASK_BATCH_LIST_FAILURE, TASK_BATCH_LIST_REQUEST, TASK_BATCH_LIST_SUCCESS
} from "../../constants/schedule_plan/schedule-task.constants";

export const scheduleTaskListReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case SCHEDULE_TASK_LIST_REQUEST:
            return { loading: true };
        case SCHEDULE_TASK_LIST_SUCCESS:
            return { loading: false, scheduleTasks: action.payload.scheduleTaskList };
        case SCHEDULE_TASK_LIST_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const taskBatchListReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case TASK_BATCH_LIST_REQUEST:
            return { loading: true };
        case TASK_BATCH_LIST_SUCCESS:
            return { loading: false, scheduleBatchTask: action.payload.scheduleBatchTask };
        case TASK_BATCH_LIST_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}