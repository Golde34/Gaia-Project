import { HttpMethods, serverRequest } from "../../../baseAPI";
import { PROJECT_COLOR_UPDATE_FAIL, PROJECT_COLOR_UPDATE_REQUEST, PROJECT_COLOR_UPDATE_SUCCESS, 
    PROJECT_CREATE_FAIL, PROJECT_CREATE_REQUEST, PROJECT_CREATE_SUCCESS, 
    PROJECT_DELETE_FAIL, PROJECT_DELETE_REQUEST, PROJECT_DELETE_SUCCESS, 
    PROJECT_DETAIL_FAIL, PROJECT_DETAIL_REQUEST, PROJECT_DETAIL_SUCCESS, 
    PROJECT_LIST_FAIL, PROJECT_LIST_REQUEST, PROJECT_LIST_SUCCESS, 
    PROJECT_NAME_UPDATE_FAIL, PROJECT_NAME_UPDATE_REQUEST, PROJECT_NAME_UPDATE_SUCCESS, 
    PROJECT_UPDATE_FAIL, PROJECT_UPDATE_REQUEST, PROJECT_UPDATE_SUCCESS, 
    SYNC_PROJECT_MEMORY_FAIL, SYNC_PROJECT_MEMORY_REQUEST, SYNC_PROJECT_MEMORY_SUCCESS
} from "../../constants/task_manager/project.constants";

const portName = {
    middlewarePort: 'middlewarePort'
}

export const getProjects = () => async (dispatch) => {
    dispatch({ type: PROJECT_LIST_REQUEST });
    try {
        const { data } = await serverRequest(`/project/all`, HttpMethods.GET, portName.middlewarePort, null);    
        dispatch({ type: PROJECT_LIST_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: PROJECT_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getDetailProject = (projectId) => async (dispatch) => {
    dispatch({ type: PROJECT_DETAIL_REQUEST, payload: projectId });
    try {
        const { data } = await serverRequest(`/project/${projectId}`, HttpMethods.GET, portName.middlewarePort, null);
        dispatch({ type: PROJECT_DETAIL_SUCCESS, payload: data.data});
    } catch (error) {
        dispatch({
            type: PROJECT_DETAIL_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const createProject = (project) => async (dispatch) => {
    dispatch({ type: PROJECT_CREATE_REQUEST, payload: project });
    try {
        const { data } = await serverRequest('/project/create', HttpMethods.POST, portName.middlewarePort, project);
        dispatch({ type: PROJECT_CREATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: PROJECT_CREATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const updateProject = (project) => async (dispatch) => {
    dispatch({ type: PROJECT_UPDATE_REQUEST, payload: project });
    try {
        const { data } = await serverRequest(`/project/${project.id}`, HttpMethods.PUT, portName.middlewarePort, project);
        dispatch({ type: PROJECT_UPDATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: PROJECT_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const deleteProject = (projectId) => async (dispatch) => {
    dispatch({ type: PROJECT_DELETE_REQUEST, payload: projectId });
    try {
        const { data } = await serverRequest(`/project/${projectId}`, HttpMethods.DELETE, portName.middlewarePort, null);
        dispatch({ type: PROJECT_DELETE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: PROJECT_DELETE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const updateProjectName = (projectId, newName) => async (dispatch) => {
    dispatch({ type: PROJECT_NAME_UPDATE_REQUEST, payload: projectId });
    try {
        const { data } = await serverRequest(`/project/${projectId}/update-name`, HttpMethods.PUT, portName.middlewarePort, { newName });
        dispatch({ type: PROJECT_NAME_UPDATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: PROJECT_NAME_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const updateProjectColor = (projectId, color) => async (dispatch) => {
    dispatch({ type: PROJECT_COLOR_UPDATE_REQUEST, payload: projectId });
    try {
        const { data } = await serverRequest(`/project/${projectId}/update-color`, HttpMethods.PUT, portName.middlewarePort, { color });
        dispatch({ type: PROJECT_COLOR_UPDATE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: PROJECT_COLOR_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const syncProjectMemory = () => async (dispatch) => {
    dispatch({ type: SYNC_PROJECT_MEMORY_REQUEST });
    try {
        const { data } = await serverRequest(`/api-quota/sync-project-memory`, HttpMethods.GET, portName.middlewarePort, {});
        dispatch({ type: SYNC_PROJECT_MEMORY_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: SYNC_PROJECT_MEMORY_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}