import { HttpMethods, serverRequest } from "../../../baseAPI";
import { GROUP_TASK_CREATE_FAIL, GROUP_TASK_CREATE_REQUEST, GROUP_TASK_CREATE_SUCCESS, 
    GROUP_TASK_DELETE_FAIL, GROUP_TASK_DELETE_REQUEST, GROUP_TASK_DELETE_SUCCESS, 
    GROUP_TASK_DETAIL_FAIL, GROUP_TASK_DETAIL_REQUEST, GROUP_TASK_DETAIL_SUCCESS, 
    GROUP_TASK_LIST_FAIL, GROUP_TASK_LIST_REQUEST, GROUP_TASK_LIST_SUCCESS, 
    GROUP_TASK_NAME_UPDATE_FAIL, GROUP_TASK_NAME_UPDATE_REQUEST, GROUP_TASK_NAME_UPDATE_SUCCESS, 
    GROUP_TASK_ORDINAL_FAIL, 
    GROUP_TASK_ORDINAL_REQUEST, 
    GROUP_TASK_ORDINAL_SUCCESS, 
    GROUP_TASK_UPDATE_FAIL, GROUP_TASK_UPDATE_REQUEST, GROUP_TASK_UPDATE_SUCCESS 
} from "../../constants/task_manager/group-task.constants";

const portName = {
    middlewarePort: 'middlewarePort'
}

export const getGroupTaskList = (projectId) => async (dispatch) => {
    dispatch({ type: GROUP_TASK_LIST_REQUEST, payload: projectId });
    try {
        const { data } = await serverRequest(`/project/${projectId}/group-tasks`, HttpMethods.GET, portName.middlewarePort);
        dispatch({ type: GROUP_TASK_LIST_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GROUP_TASK_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getDetailGroupTask = (groupTaskId) => async (dispatch) => {
    dispatch({ type: GROUP_TASK_DETAIL_REQUEST, payload: groupTaskId });
    try {
        const { data } = await serverRequest(`/group-task/${groupTaskId}`, HttpMethods.GET, portName.middlewarePort);
        dispatch({ type: GROUP_TASK_DETAIL_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GROUP_TASK_DETAIL_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const createGroupTask = (groupTask) => async (dispatch) => {
    dispatch({ type: GROUP_TASK_CREATE_REQUEST, payload: groupTask });
    try {
        // header is here maybe need it
        // const { userSignin: { userInfo } } = getState();
        // const header = {
        //     'Content-Type': 'multipart/form-data',
        //     'Authorization': `Bearer ${userInfo.token}`
        // }
        const { data } = await serverRequest('/group-task/create', HttpMethods.POST, portName.middlewarePort, groupTask);
        dispatch({ type: GROUP_TASK_CREATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GROUP_TASK_CREATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const updateGroupTask = (groupTask) => async (dispatch) => {
    dispatch({ type: GROUP_TASK_UPDATE_REQUEST, payload: groupTask });
    try {
        // header is here maybe need it
        // const { userSignin: { userInfo } } = getState();
        // const header = {
        //     'Content-Type': 'multipart/form-data',
        //     'Authorization': `Bearer ${userInfo.token}`
        // }
        const { data } = await serverRequest(`/group-task/${groupTask.id}`, HttpMethods.PUT, portName.middlewarePort, groupTask);
        dispatch({ type: GROUP_TASK_UPDATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GROUP_TASK_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const deleteGroupTask = (groupTaskId) => async (dispatch) => {
    dispatch({ type: GROUP_TASK_DELETE_REQUEST, payload: groupTaskId });
    try {
        // header is here maybe need it
        // const { userSignin: { userInfo } } = getState();
        // const header = {
        //     'Content-Type': 'multipart/form-data',
        //     'Authorization': `Bearer ${userInfo.token}`
        // }
        const { data } = await serverRequest(`/group-task/${groupTaskId}`, HttpMethods.DELETE, portName.middlewarePort);
        dispatch({ type: GROUP_TASK_DELETE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GROUP_TASK_DELETE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const updateGroupTaskName = (groupTaskId, newName) => async (dispatch) => {
    dispatch({ type: GROUP_TASK_NAME_UPDATE_REQUEST, payload: groupTaskId });
    try {
        const { data } = await serverRequest(`/group-task/${groupTaskId}/update-name`, HttpMethods.PUT, portName.middlewarePort, { newName });
        dispatch({ type: GROUP_TASK_NAME_UPDATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GROUP_TASK_NAME_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const updateOrdinalNumber = (groupTaskId, projectId) => async (dispatch) => {
    dispatch({ type: GROUP_TASK_ORDINAL_REQUEST, payload: groupTaskId});
    try {
        const { data } = await serverRequest(`/group-task/${groupTaskId}/update-ordinal`, HttpMethods.PUT, portName.middlewarePort, { groupTaskId, projectId});
        dispatch({ type: GROUP_TASK_ORDINAL_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GROUP_TASK_ORDINAL_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}