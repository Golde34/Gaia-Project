import {
    CREATE_SCHEDULE_GROUP_FAILURE, CREATE_SCHEDULE_GROUP_REQUEST, CREATE_SCHEDULE_GROUP_SUCCESS,
    SCHEDULE_GROUP_LIST_FAILURE, SCHEDULE_GROUP_LIST_REQUEST, SCHEDULE_GROUP_LIST_SUCCESS
} from "../../constants/schedule_plan/schedule-group.constants";

export const createScheduleGroupReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case CREATE_SCHEDULE_GROUP_REQUEST:
            return { loading: true };
        case CREATE_SCHEDULE_GROUP_SUCCESS:
            return { loading: false, scheduleGroup: action.payload.scheduleGroup };
        case CREATE_SCHEDULE_GROUP_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const scheduleGroupListReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case SCHEDULE_GROUP_LIST_REQUEST:
            return { loading: true };
        case SCHEDULE_GROUP_LIST_SUCCESS:
            return { loading: false, scheduleGroups: action.payload.scheduleGroups };
        case SCHEDULE_GROUP_LIST_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}
