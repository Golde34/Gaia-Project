import {
    DELETE_PROJECT_COMMIT_FAILURE,
    DELETE_PROJECT_COMMIT_REQUEST,
    DELETE_PROJECT_COMMIT_SUCCESS,
    GET_PROJECT_AND_REPO_FAILURE, GET_PROJECT_AND_REPO_REQUEST, GET_PROJECT_AND_REPO_SUCCESS
} from "../../constants/contribution_tracker/project-commit.constants";

export const getProjectAndRepoRequestReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case GET_PROJECT_AND_REPO_REQUEST:
            return { loading: true };
        case GET_PROJECT_AND_REPO_SUCCESS:
            return { loading: false, projectAndRepo: action.payload }
        case GET_PROJECT_AND_REPO_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const deleteProjectCommitReducer = (
    state = {}, action) => {
    switch (action.type) {
        case DELETE_PROJECT_COMMIT_REQUEST:
            return { loading: true };
        case DELETE_PROJECT_COMMIT_SUCCESS:
            return { loading: false, projectCommit: action.payload.projectCommit };
        case DELETE_PROJECT_COMMIT_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}