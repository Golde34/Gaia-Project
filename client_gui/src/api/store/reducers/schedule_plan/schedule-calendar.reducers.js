import { CREATE_DAILY_CALENDAR_FAILURE, CREATE_DAILY_CALENDAR_REQUEST, CREATE_DAILY_CALENDAR_SUCCESS, 
    GET_DAILY_CALENDAR_FAILURE, GET_DAILY_CALENDAR_REQUEST, GET_DAILY_CALENDAR_SUCCESS, 
    GET_TIME_BUBBLE_CONFIG_FAILURE,  GET_TIME_BUBBLE_CONFIG_REQUEST, GET_TIME_BUBBLE_CONFIG_SUCCESS, 
    REGISTER_SCHEDULE_CALENDAR_FAILURE, REGISTER_SCHEDULE_CALENDAR_REQUEST, REGISTER_SCHEDULE_CALENDAR_SUCCESS
} from "../../constants/schedule_plan/schedule-calendar.constants";

export const registerScheduleCalendarReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case REGISTER_SCHEDULE_CALENDAR_REQUEST:
            return { loading: true };
        case REGISTER_SCHEDULE_CALENDAR_SUCCESS:
            return { loading: false, dailyTasks: action.payload };
        case REGISTER_SCHEDULE_CALENDAR_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

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

const initialState = { loading: false, error: null, config: null };

export const getTimeBubbleConfigReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TIME_BUBBLE_CONFIG_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_TIME_BUBBLE_CONFIG_SUCCESS:
      return { loading: false, error: null, config: action.payload };
    case GET_TIME_BUBBLE_CONFIG_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
