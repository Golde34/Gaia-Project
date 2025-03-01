import { USER_CONTRIBUTIONS_FAILURE, USER_CONTRIBUTIONS_REQUEST, USER_CONTRIBUTIONS_SUCCESS } from "../../constants/contribution_tracker/contribution.constants";

export const getUserContributionsReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case USER_CONTRIBUTIONS_REQUEST:
            return { loading: true };
        case USER_CONTRIBUTIONS_SUCCESS:
            return { loading: false, contributions: action.payload }
        case USER_CONTRIBUTIONS_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}
