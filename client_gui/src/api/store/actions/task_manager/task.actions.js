import { HttpMethods, serverRequest } from '../../../baseAPI';
import { TASK_LIST_REQUEST, TASK_LIST_SUCCESS, TASK_LIST_FAIL, 
    TASK_DETAIL_REQUEST, TASK_DETAIL_SUCCESS, TASK_DETAIL_FAIL, 
    TASK_CREATE_REQUEST, TASK_CREATE_SUCCESS, TASK_CREATE_FAIL,
    TASK_UPDATE_REQUEST, TASK_UPDATE_SUCCESS, TASK_UPDATE_FAIL, 
    TASK_DELETE_REQUEST, TASK_DELETE_SUCCESS, TASK_DELETE_FAIL, 
    TASK_GENERATE_REQUEST, TASK_GENERATE_FAIL, TASK_GENERATE_SUCCESS, 
    TASK_COMPLETED_REQUEST, TASK_COMPLETED_SUCCESS, TASK_COMPLETED_FAIL, 
    TOP_TASK_REQUEST, TOP_TASK_SUCCESS, TOP_TASK_FAIL, 
    MOVE_TASK_REQUEST, MOVE_TASK_SUCCESS, MOVE_TASK_FAIL,
    TASK_TABLE_REQUEST, TASK_TABLE_SUCCESS, TASK_TABLE_FAIL,
    DONE_TASKS_REQUEST, DONE_TASKS_SUCCESS, DONE_TASKS_FAIL
} from '../../constants/task_manager/task.constants';

const portName = {
    taskManager: 'taskManagerPort',
    middleware: 'middlewarePort'
}

export const getTaskList = (groupTaskId) => async (dispatch) => {
    dispatch({ type: TASK_LIST_REQUEST, payload: groupTaskId });
    try {
        const { data } = await serverRequest(`/group-task/${groupTaskId}/tasks`, HttpMethods.GET, portName.middleware);
        dispatch({ type: TASK_LIST_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: TASK_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getDetailTask = (body) => async (dispatch) => {
    dispatch({ type: TASK_DETAIL_REQUEST, payload: body });
    try {
        const { data } = await serverRequest(`/task/${body.taskId}/detail`, HttpMethods.POST, portName.middleware, body);
        dispatch({ type: TASK_DETAIL_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: TASK_DETAIL_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const createTask = (task) => async (dispatch) => {
    dispatch({ type: TASK_CREATE_REQUEST, payload: task });
    try {
        const { data } = await serverRequest('/task/create', HttpMethods.POST, portName.middleware, task);
        dispatch({ type: TASK_CREATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: TASK_CREATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const updateTask = (task) => async (dispatch) => {
    dispatch({ type: TASK_UPDATE_REQUEST, payload: task });
    try {
        const { data } = await serverRequest(`/task/${task.taskId}`, HttpMethods.PUT, portName.middleware, task);
        dispatch({ type: TASK_UPDATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: TASK_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const deleteTask = (taskId) => async (dispatch) => {
    dispatch({ type: TASK_DELETE_REQUEST, payload: taskId });
    try {
        const { data } = await serverRequest(`/task/${taskId}`, HttpMethods.DELETE, portName.middleware);
        dispatch({ type: TASK_DELETE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: TASK_DELETE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const generateTaskFromScratch = (task) => async (dispatch) => {
    dispatch({ type: TASK_GENERATE_REQUEST, payload: task });
    try {
        const { data } = await serverRequest('/task/generate', HttpMethods.POST, portName.middleware, task);
        dispatch({ type: TASK_GENERATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: TASK_GENERATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const updateTaskInDialog = (task) => async (dispatch) => {
    dispatch({ type: TASK_UPDATE_REQUEST, payload: task });
    try {
        const { data } = await serverRequest(`/task/${task.id}/update-task-in-dialog`, HttpMethods.PUT, portName.middleware, task);
        dispatch({ type: TASK_UPDATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: TASK_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getTasksCompleted = (groupTaskId) => async (dispatch) => {
    dispatch({ type: TASK_COMPLETED_REQUEST, payload: groupTaskId });
    try {
        const { data } = await serverRequest(`/group-task/${groupTaskId}/tasks-complete`, HttpMethods.GET, portName.middleware);
        dispatch({ type: TASK_COMPLETED_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: TASK_COMPLETED_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
    }
}

export const getTopTasks = () => async (dispatch) => {
    dispatch({ type: TOP_TASK_REQUEST });
    try {
        const { data } = await serverRequest(`/task/top-tasks`, HttpMethods.GET, portName.middleware);
        dispatch({ type: TOP_TASK_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: TOP_TASK_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
    }
}

export const moveTask = (taskId, oldGroupTaskId, newGroupTaskId) => async (dispatch) => {
    dispatch({ type: MOVE_TASK_REQUEST });
    try {
        const { data } = await serverRequest(`/task/${taskId}/move-task`, HttpMethods.PUT, portName.middleware, { oldGroupTaskId, newGroupTaskId });
        dispatch({ type: MOVE_TASK_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({ 
            type: MOVE_TASK_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
    }
}

export const getTableTaskList = (groupTaskId) => async (dispatch) => {
    dispatch({ type: TASK_TABLE_REQUEST, payload: groupTaskId });
    try {
        const { data } = await serverRequest(`/group-task/${groupTaskId}/task-table`, HttpMethods.GET, portName.middleware);
        dispatch({ type: TASK_TABLE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: TASK_TABLE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getDoneTasks = () => async (dispatch) => {
    dispatch({ type: DONE_TASKS_REQUEST });
    try {
        const { data } = await serverRequest(`/task/done-tasks`, HttpMethods.GET, portName.middleware);
        dispatch({ type: DONE_TASKS_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: DONE_TASKS_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
    }
}
