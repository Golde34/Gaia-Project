import { PROJECT_CREATE_FAIL, PROJECT_CREATE_REQUEST, PROJECT_CREATE_SUCCESS, 
    PROJECT_DELETE_FAIL, PROJECT_DELETE_REQUEST, PROJECT_DELETE_SUCCESS, 
    PROJECT_DETAIL_FAIL, PROJECT_DETAIL_REQUEST, PROJECT_DETAIL_SUCCESS, 
    PROJECT_LIST_FAIL, PROJECT_LIST_REQUEST, PROJECT_LIST_SUCCESS, 
    PROJECT_NAME_UPDATE_FAIL, PROJECT_NAME_UPDATE_REQUEST, PROJECT_NAME_UPDATE_SUCCESS, 
    PROJECT_UPDATE_FAIL, PROJECT_UPDATE_REQUEST, PROJECT_UPDATE_SUCCESS, 
    SYNC_PROJECT_MEMORY_FAIL, SYNC_PROJECT_MEMORY_REQUEST, SYNC_PROJECT_MEMORY_SUCCESS
} from "../../constants/task_manager/project.constants";

export const projectListReducer = (
    state = { loading: true, projects: [] }, 
    action
    ) => {
    switch (action.type) {
        case PROJECT_LIST_REQUEST:
            return { loading: true };
        case PROJECT_LIST_SUCCESS:
            return { loading: false, projects: action.payload.listAllProjectsByUserId };
        case PROJECT_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const projectDetailReducer = (
    state = { loading: true }, action ) => {
    switch (action.type) {
        case PROJECT_DETAIL_REQUEST:
            return { loading: true };
        case PROJECT_DETAIL_SUCCESS:
            return { loading: false, project: action.payload.project };
        case PROJECT_DETAIL_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const projectCreateReducer = (
    state = { }, action ) => {
    switch (action.type) {
        case PROJECT_CREATE_REQUEST:
            return { loading: true };
        case PROJECT_CREATE_SUCCESS:
            return { loading: false, project: action.payload.project };
        case PROJECT_CREATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const projectUpdateReducer = (
    state = { }, action ) => {
    switch (action.type) {
        case PROJECT_UPDATE_REQUEST:
            return { loading: true };
        case PROJECT_UPDATE_SUCCESS:
            return { loading: false, project: action.payload.project };
        case PROJECT_UPDATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const projectDeleteReducer = (
    state = { }, action) => {
    switch (action.type) {
        case PROJECT_DELETE_REQUEST:
            return { loading: true };
        case PROJECT_DELETE_SUCCESS:
            return { loading: false, project: action.payload.project };
        case PROJECT_DELETE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const projectNameUpdateReducer = (
    state = { }, action) => {
    switch (action.type) {
        case PROJECT_NAME_UPDATE_REQUEST:
            return { loading: true };
        case PROJECT_NAME_UPDATE_SUCCESS:
            return { loading: false, project: action.payload.project };
        case PROJECT_NAME_UPDATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const projectColorUpdateReducer = (
    state = { }, action) => {
    switch (action.type) {
        case PROJECT_NAME_UPDATE_REQUEST:
            return { loading: true };
        case PROJECT_NAME_UPDATE_SUCCESS:
            return { loading: false, project: action.payload.project };
        case PROJECT_NAME_UPDATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const syncProjectMemoryReducer = (
    state = { }, action) => {
    switch (action.type) {
        case SYNC_PROJECT_MEMORY_REQUEST:
            return { loading: true };
        case SYNC_PROJECT_MEMORY_SUCCESS:
            return { loading: false, project: action.payload };
        case SYNC_PROJECT_MEMORY_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}