import {
    DONE_TASKS_FAIL,
    DONE_TASKS_REQUEST,
    DONE_TASKS_SUCCESS,
    MOVE_TASK_FAIL, MOVE_TASK_REQUEST, MOVE_TASK_SUCCESS,
    TASK_COMPLETED_FAIL, TASK_COMPLETED_REQUEST, TASK_COMPLETED_SUCCESS,
    TASK_CREATE_FAIL, TASK_CREATE_REQUEST, TASK_CREATE_SUCCESS,
    TASK_DELETE_FAIL, TASK_DELETE_REQUEST, TASK_DELETE_SUCCESS,
    TASK_DETAIL_FAIL, TASK_DETAIL_REQUEST, TASK_DETAIL_SUCCESS,
    TASK_GENERATE_FAIL, TASK_GENERATE_REQUEST, TASK_GENERATE_SUCCESS,
    TASK_LIST_FAIL, TASK_LIST_REQUEST, TASK_LIST_SUCCESS,
    TASK_TABLE_FAIL, TASK_TABLE_REQUEST, TASK_TABLE_SUCCESS,
    TASK_UPDATE_FAIL, TASK_UPDATE_REQUEST, TASK_UPDATE_SUCCESS, 
    TOP_TASK_FAIL, TOP_TASK_REQUEST, TOP_TASK_SUCCESS
} from '../../constants/task_manager/task.constants';

export const taskListReducer = (
    state = { loading: true, tasks: [] },
    action
) => {
    switch (action.type) {
        case TASK_LIST_REQUEST:
            return { loading: true };
        case TASK_LIST_SUCCESS:
            return { loading: false, tasks: action.payload.getTasksByGroupTaskId };
        case TASK_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const taskDetailReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case TASK_DETAIL_REQUEST:
            return { loading: true };
        case TASK_DETAIL_SUCCESS:
            return { loading: false, detail: action.payload.data };
        case TASK_DETAIL_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const taskCreateReducer = (
    state = {}, action) => {
    switch (action.type) {
        case TASK_CREATE_REQUEST:
            return { loading: true };
        case TASK_CREATE_SUCCESS:
            return { loading: false, task: action.payload.task };
        case TASK_CREATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const taskUpdateReducer = (
    state = {}, action) => {
    switch (action.type) {
        case TASK_UPDATE_REQUEST:
            return { loading: true };
        case TASK_UPDATE_SUCCESS:
            return { loading: false, task: action.payload.task };
        case TASK_UPDATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const taskDeleteReducer = (
    state = {}, action) => {
    switch (action.type) {
        case TASK_DELETE_REQUEST:
            return { loading: true };
        case TASK_DELETE_SUCCESS:
            return { loading: false, task: action.payload.task };
        case TASK_DELETE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const generateTaskFromScratchReducer = (
    state = {}, action) => {
    switch (action.type) {
        case TASK_GENERATE_REQUEST:
            return { loading: true };
        case TASK_GENERATE_SUCCESS:
            return { loading: false, task: action.payload.task };
        case TASK_GENERATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const taskCompletedReducer = (
    state = {}, action) => {
    switch (action.type) {
        case TASK_COMPLETED_REQUEST:
            return { loading: true };
        case TASK_COMPLETED_SUCCESS:
            return { loading: false, task: action.payload.calculateCompletedTasks };
        case TASK_COMPLETED_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const topTaskReducer = (
    state = { loading: true, topTasks: [] },
    action
) => {
    switch (action.type) {
        case TOP_TASK_REQUEST:
            return { loading: true };
        case TOP_TASK_SUCCESS:
            return { loading: false, topTasks: action.payload };
        case TOP_TASK_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const moveTaskReducer = (
    state = { loading: true }, action
) => {
    switch (action.type) {
        case MOVE_TASK_REQUEST:
            return { loading: true };
        case MOVE_TASK_SUCCESS:
            return { loading: false, message: action.payload.message };
        case MOVE_TASK_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const taskTableReducer = (
    state = { loading: true, tasks: [] },
    action
) => {
    switch (action.type) {
        case TASK_TABLE_REQUEST:
            return { loading: true };
        case TASK_TABLE_SUCCESS:
            return { loading: false, tasks: action.payload.getTaskTableByGroupTaskId };
        case TASK_TABLE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const doneTasksReducer = (
    state = { loading: true, doneTasks: [] },
    action
) => {
    switch (action.type) {
        case DONE_TASKS_REQUEST:
            return { loading: true };
        case DONE_TASKS_SUCCESS:
            return { loading: false, doneTasks: action.payload };
        case DONE_TASKS_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}
