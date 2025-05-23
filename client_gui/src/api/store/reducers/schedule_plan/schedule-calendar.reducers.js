import { CREATE_DAILY_CALENDAR_FAILURE, CREATE_DAILY_CALENDAR_REQUEST, CREATE_DAILY_CALENDAR_SUCCESS, 
    GET_DAILY_CALENDAR_FAILURE, GET_DAILY_CALENDAR_REQUEST, GET_DAILY_CALENDAR_SUCCESS 
} from "../../constants/schedule_plan/schedule-calendar.constants";

export const createDailyCalendarReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case CREATE_DAILY_CALENDAR_REQUEST:
            return { loading: true };
        case CREATE_DAILY_CALENDAR_SUCCESS:
            return { loading: false, dailyTasks: action.payload };
        case CREATE_DAILY_CALENDAR_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const getDailyCalendarReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case GET_DAILY_CALENDAR_REQUEST:
            return { loading: true };
        case GET_DAILY_CALENDAR_SUCCESS:
            return { loading: false, dailyTasks: action.payload };
        case GET_DAILY_CALENDAR_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}
