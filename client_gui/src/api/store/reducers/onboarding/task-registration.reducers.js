import { QUERY_TASK_CONFIG_FAIL, QUERY_TASK_CONFIG_REQUEST, QUERY_TASK_CONFIG_SUCCESS, 
    REGISTER_TASK_CONFIG_FAIL, REGISTER_TASK_CONFIG_REQUEST, REGISTER_TASK_CONFIG_SUCCESS }
from "../../constants/onboarding/task-registration.constants";

export const queryTaskConfigReducer = (
    state = { }, action) => {
    switch (action.type) {
        case QUERY_TASK_CONFIG_REQUEST:
            return { loading: true };
        case QUERY_TASK_CONFIG_SUCCESS:
            return { loading: false, taskRegistry: action.payload.data };
        case QUERY_TASK_CONFIG_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const registerTaskConfigReducer = (
    state = { }, action) => {
    switch (action.type) {
        case REGISTER_TASK_CONFIG_REQUEST:
            return { loading: true };
        case REGISTER_TASK_CONFIG_SUCCESS:
            return { loading: false, taskRegistry: action.payload.data.registerTaskConfig };
        case REGISTER_TASK_CONFIG_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}
