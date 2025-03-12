import { COMPARE_COMMTIS_FAILURE, COMPARE_COMMTIS_REQUEST, COMPARE_COMMTIS_SUCCESS, 
    USER_CONTRIBUTIONS_FAILURE, USER_CONTRIBUTIONS_REQUEST, USER_CONTRIBUTIONS_SUCCESS 
} from "../../constants/contribution_tracker/contribution.constants";

export const getUserContributionsReducer = (
    state = { ctLoading: true }, action) => {
    switch (action.type) {
        case USER_CONTRIBUTIONS_REQUEST:
            return { ctLoading: true };
        case USER_CONTRIBUTIONS_SUCCESS:
            return { ctLoading: false, contributions: action.payload }
        case USER_CONTRIBUTIONS_FAILURE:
            return { ctLoading: false, ctError: action.payload };
        default:
            return state;
    }
}

export const compareCommitsReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case COMPARE_COMMTIS_REQUEST:
            return { loading: true };
        case COMPARE_COMMTIS_SUCCESS:
            return { loading: false, commits: action.payload }
        case COMPARE_COMMTIS_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}
