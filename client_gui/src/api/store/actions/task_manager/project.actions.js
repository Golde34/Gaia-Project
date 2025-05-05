import addAuthHeaders from "../../../../kernels/utils/add-headers";
import { HttpMethods, serverRequest } from "../../../baseAPI";
import { PROJECT_COLOR_UPDATE_FAIL, PROJECT_COLOR_UPDATE_REQUEST, PROJECT_COLOR_UPDATE_SUCCESS, 
    PROJECT_CREATE_FAIL, PROJECT_CREATE_REQUEST, PROJECT_CREATE_SUCCESS, 
    PROJECT_DELETE_FAIL, PROJECT_DELETE_REQUEST, PROJECT_DELETE_SUCCESS, 
    PROJECT_DETAIL_FAIL, PROJECT_DETAIL_REQUEST, PROJECT_DETAIL_SUCCESS, 
    PROJECT_LIST_FAIL, PROJECT_LIST_REQUEST, PROJECT_LIST_SUCCESS, 
    PROJECT_NAME_UPDATE_FAIL, PROJECT_NAME_UPDATE_REQUEST, PROJECT_NAME_UPDATE_SUCCESS, 
    PROJECT_UPDATE_FAIL, PROJECT_UPDATE_REQUEST, PROJECT_UPDATE_SUCCESS 
} from "../../constants/task_manager/project.constants";

const portName = {
    middlewarePort: 'middlewarePort'
}

export const getProjects = (userId) => async (dispatch) => {
    dispatch({ type: PROJECT_LIST_REQUEST });
    try {
        // const headers = addAuthHeaders();
        // const { data } = await serverRequest('/project/all', HttpMethods.GET, portName.middlewarePort, null, headers);  
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
        // header is here maybe need it
        // const { userSignin: { userInfo } } = getState();
        // const header = {
        //     'Content-Type': 'multipart/form-data',
        //     'Authorization': `Bearer ${userInfo.token}`
        // } 
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
        // header is here maybe need it 
        // const { userSignin: { userInfo } } = getState();
        // const headers = {
        //     'Content-Type': 'multipart/form-data',
        //     'Authorization': `Bearer ${userInfo.token}`
        // }
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
        // header is here maybe need it 
        // const { userSignin: { userInfo } } = getState();
        // const headers = {
        //     'Content-Type': 'multipart/form-data',
        //     'Authorization': `Bearer ${userInfo.token}`
        // }
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