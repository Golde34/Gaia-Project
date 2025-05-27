import { 
    OPTIMZE_TASK_BY_USER_FAILURE, OPTIMZE_TASK_BY_USER_REQUEST, OPTIMZE_TASK_BY_USER_SUCCESS 
} from "../../constants/onboarding/optimize-task.constants";

export const optimizeTaskByUserReducer = (
    state = {}, action) => {
    switch (action.type) {
        case OPTIMZE_TASK_BY_USER_REQUEST:
            return { loading: true };
        case OPTIMZE_TASK_BY_USER_SUCCESS:
            return { loading: false, data: action.payload };
        case OPTIMZE_TASK_BY_USER_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}