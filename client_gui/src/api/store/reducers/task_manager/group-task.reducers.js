import { GROUP_TASK_CREATE_FAIL, GROUP_TASK_CREATE_REQUEST, GROUP_TASK_CREATE_SUCCESS, 
    GROUP_TASK_DELETE_FAIL, GROUP_TASK_DELETE_REQUEST, GROUP_TASK_DELETE_SUCCESS, 
    GROUP_TASK_DETAIL_FAIL, GROUP_TASK_DETAIL_REQUEST, GROUP_TASK_DETAIL_SUCCESS, 
    GROUP_TASK_LIST_FAIL, GROUP_TASK_LIST_REQUEST, GROUP_TASK_LIST_SUCCESS, 
    GROUP_TASK_NAME_UPDATE_FAIL, GROUP_TASK_NAME_UPDATE_REQUEST, GROUP_TASK_NAME_UPDATE_SUCCESS, 
    GROUP_TASK_ORDINAL_FAIL, GROUP_TASK_ORDINAL_REQUEST, GROUP_TASK_ORDINAL_SUCCESS, 
    GROUP_TASK_UPDATE_FAIL, GROUP_TASK_UPDATE_REQUEST, GROUP_TASK_UPDATE_SUCCESS 
} from '../../constants/task_manager/group-task.constants';

export const groupTaskListReducer = (
    state = { loading: true, groupTasks: [] },
    action
) => {
    switch (action.type) {
        case GROUP_TASK_LIST_REQUEST:
            return { groupTaskLoading: true };
        case GROUP_TASK_LIST_SUCCESS:
            return { groupTaskLoading: false, groupTasks: action.payload.getGroupTasksInProject };
        case GROUP_TASK_LIST_FAIL:
            return { groupTaskLoading: false, groupTaskError: action.payload };
        default:
            return state;
    }
}

export const groupTaskDetailReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case GROUP_TASK_DETAIL_REQUEST:
            return { loading: true };
        case GROUP_TASK_DETAIL_SUCCESS:
            return { loading: false, groupTask: action.payload.groupTask };
        case GROUP_TASK_DETAIL_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const groupTaskCreateReducer = (
    state = { }, action) => {
    switch (action.type) {
        case GROUP_TASK_CREATE_REQUEST:
            return { loading: true };
        case GROUP_TASK_CREATE_SUCCESS:
            return { loading: false, groupTask: action.payload.groupTask };
        case GROUP_TASK_CREATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const groupTaskUpdateReducer = (
    state = { }, action) => {
    switch (action.type) {
        case GROUP_TASK_UPDATE_REQUEST:
            return { loading: true };
        case GROUP_TASK_UPDATE_SUCCESS:
            return { loading: false, groupTask: action.payload.groupTask };
        case GROUP_TASK_UPDATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const groupTaskDeleteReducer = (
    state = { }, action) => {
    switch (action.type) {
        case GROUP_TASK_DELETE_REQUEST:
            return { loading: true };
        case GROUP_TASK_DELETE_SUCCESS:
            return { loading: false, groupTask: action.payload.groupTask };
        case GROUP_TASK_DELETE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const groupTaskNameUpdateReducer = (
    state = { }, action) => {
    switch (action.type) {
        case GROUP_TASK_NAME_UPDATE_REQUEST:
            return { loading: true };
        case GROUP_TASK_NAME_UPDATE_SUCCESS:
            return { loading: false, groupTask: action.payload.groupTask };
        case GROUP_TASK_NAME_UPDATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const groupTaskOrdinalUpdateReducer = (
    state = { }, action) => {
    switch (action.type) {
        case GROUP_TASK_ORDINAL_REQUEST :
            return { loading: true };
        case GROUP_TASK_ORDINAL_SUCCESS:
            return { loading: false, groupTask: action.payload.groupTask };
        case GROUP_TASK_ORDINAL_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}