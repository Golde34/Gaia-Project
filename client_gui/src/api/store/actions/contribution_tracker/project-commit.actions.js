import { HttpMethods, serverRequest } from "../../../baseAPI";
import { DELETE_PROJECT_COMMIT_FAILURE, DELETE_PROJECT_COMMIT_REQUEST, DELETE_PROJECT_COMMIT_SUCCESS, 
    GET_PROJECT_AND_REPO_FAILURE, GET_PROJECT_AND_REPO_REQUEST, GET_PROJECT_AND_REPO_SUCCESS, 
    SYNC_PROJECT_AND_REPO_FAILURE, SYNC_PROJECT_AND_REPO_REQUEST, SYNC_PROJECT_AND_REPO_SUCCESS 
} from "../../constants/contribution_tracker/project-commit.constants";

const portName = {
    middlewarePort: 'middlewarePort'
}

export const getProjectsAndRepos = (userId) => async (dispatch) => {
    dispatch({ type: GET_PROJECT_AND_REPO_REQUEST, payload: userId });
    try {
        const { data } = await serverRequest(`/user-commit/user-github/get-project-repo/${userId}`, HttpMethods.GET, portName.middlewarePort);
        dispatch({ type: GET_PROJECT_AND_REPO_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GET_PROJECT_AND_REPO_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const syncProjectAndRepo = (userId, project, repo) => async (dispatch) => {
    dispatch({ type: SYNC_PROJECT_AND_REPO_REQUEST, payload: userId });
    try {
        const body = {
            userId,
            project,
            repo
        }
        const { data } = await serverRequest(`/project-commit/sync-project-repo`, HttpMethods.POST, portName.middlewarePort, body);
        dispatch({ type: SYNC_PROJECT_AND_REPO_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: SYNC_PROJECT_AND_REPO_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const deleteProjectCommit = (userId, projectId) => async (dispatch) => {
    dispatch({ type: DELETE_PROJECT_COMMIT_REQUEST, payload: userId });
    try {
        const body = {
            userId,
            projectId
        }
        const { data } = await serverRequest(`/project-commit/delete-project-repo`, HttpMethods.POST, portName.middlewarePort, body);
        dispatch({ type: DELETE_PROJECT_COMMIT_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: DELETE_PROJECT_COMMIT_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}