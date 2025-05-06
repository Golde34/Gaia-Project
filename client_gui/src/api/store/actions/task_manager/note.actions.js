import { handleFileContent } from "../../../../kernels/utils/display-file-handler";
import { postFile, serverRequest } from "../../../baseAPI";
import { 
    NOTE_CREATE_FAIL, NOTE_CREATE_REQUEST, NOTE_CREATE_SUCCESS, 
    NOTE_DELETE_FAIL, NOTE_DELETE_REQUEST, NOTE_DELETE_SUCCESS, 
    NOTE_DETAIL_FAIL, NOTE_DETAIL_REQUEST, NOTE_DETAIL_SUCCESS, 
    NOTE_LIST_FAIL, NOTE_LIST_REQUEST, NOTE_LIST_SUCCESS, 
    NOTE_LOCK_FAIL, NOTE_LOCK_REQUEST, NOTE_LOCK_SUCCESS, 
    NOTE_UNLOCK_FAIL, NOTE_UNLOCK_REQUEST, NOTE_UNLOCK_SUCCESS, 
    NOTE_UPDATE_FAIL, NOTE_UPDATE_REQUEST, NOTE_UPDATE_SUCCESS 
} from "../../constants/task_manager/note.constants"

const portName = {
    middleware: 'middlewarePort',
}

export const getNoteList = () => async (dispatch) => {
    dispatch({ type: NOTE_LIST_REQUEST });
    try {
        const { data } = await serverRequest(`/note/list`, 'GET', portName.middleware);
        dispatch({ type: NOTE_LIST_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: NOTE_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const createNote = (note) => async (dispatch) => {
    dispatch({ type: NOTE_CREATE_REQUEST });
    try {
        const api = '/note/create';

        const formData = new FormData();
        formData.append('name', note.name);
        formData.append('file', note.contentFile);

        const response = await postFile(api, portName.middleware, formData);
        const data = await response.json();
        
        if (response.ok) {
            dispatch({ type: NOTE_CREATE_SUCCESS, payload: data });
            console.log('Note created successfully:', data);
        } else {
            dispatch({ type: NOTE_CREATE_FAIL, payload: data.message || 'Failed to create note' });
            console.error('Error creating note:', data);
        }
    } catch (error) {
        console.error('Error creating note:', error);
        dispatch({
            type: NOTE_CREATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
};

export const updateNote = (note) => async (dispatch) => {
    dispatch({ type: NOTE_UPDATE_REQUEST });
    try {
        const api = `/note/update/${note.noteId}`;

        const formData = new FormData();
        formData.append('name', note.name);
        formData.append('file', note.contentFile);

        const response = await postFile(api, portName.middleware, formData);
        const data = await response.json();

        if (response.ok) {
            dispatch({ type: NOTE_UPDATE_SUCCESS, payload: data });
        } else {
            dispatch({ type: NOTE_UPDATE_FAIL, payload: data.message || 'Failed to update note' });
        }
    } catch (error) {
        dispatch({
            type: NOTE_UPDATE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getNoteById = (noteId) => async (dispatch) => {
    dispatch({ type: NOTE_DETAIL_REQUEST, payload: noteId });
    try {
        const { data } = await serverRequest(`/note/detail/${noteId}`, 'GET', portName.middleware);
        data.fileContent = handleFileContent(data.fileContent);
        dispatch({ type: NOTE_DETAIL_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: NOTE_DETAIL_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const lockNote = (noteId, notePassword, passwordSuggestion) => async (dispatch) => {
    dispatch({ type: NOTE_LOCK_REQUEST, payload: noteId });
    try {
        const request = {
            noteId,
            notePassword,
            passwordSuggestion,
        };
        const { data } = await serverRequest(`/note/lock/${noteId}`, 'PUT', portName.middleware, request);
        dispatch({ type: NOTE_LOCK_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: NOTE_LOCK_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const unlockNote = (noteId, notePassword) => async (dispatch) => {
    dispatch({ type: NOTE_UNLOCK_REQUEST, payload: noteId });
    try {
        const request = {
            noteId,
            notePassword,
        };
        const { data } = await serverRequest(`/note/unlock/${noteId}`, 'PUT', portName.middleware, request);
        dispatch({ type: NOTE_UNLOCK_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: NOTE_UNLOCK_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const deleteNote = (noteId) => async (dispatch) => {
    dispatch({ type: NOTE_DELETE_REQUEST, payload: noteId });
    try {
        const { data } = await serverRequest(`/note/${noteId}`, 'DELETE', portName.middleware);
        dispatch({ type: NOTE_DELETE_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: NOTE_DELETE_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}