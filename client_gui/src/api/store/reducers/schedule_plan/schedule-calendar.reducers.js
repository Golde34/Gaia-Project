import { CREATE_DAILY_CALENDAR_FAILURE, CREATE_DAILY_CALENDAR_REQUEST, CREATE_DAILY_CALENDAR_SUCCESS, 
    GET_DAILY_TASKS_FAILURE, GET_DAILY_TASKS_REQUEST, GET_DAILY_TASKS_SUCCESS,
    GET_TIME_BUBBLE_CONFIG_FAILURE,  GET_TIME_BUBBLE_CONFIG_REQUEST, GET_TIME_BUBBLE_CONFIG_SUCCESS,
    REGISTER_SCHEDULE_CALENDAR_FAILURE, REGISTER_SCHEDULE_CALENDAR_REQUEST, REGISTER_SCHEDULE_CALENDAR_SUCCESS,
    UPDATE_TIME_BUBBLE_CONFIG_FAILURE, UPDATE_TIME_BUBBLE_CONFIG_REQUEST, UPDATE_TIME_BUBBLE_CONFIG_SUCCESS,
    DELETE_TASK_AWAY_SCHEDULE_FAILURE, DELETE_TASK_AWAY_SCHEDULE_REQUEST, DELETE_TASK_AWAY_SCHEDULE_SUCCESS
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
            return { loading: false, dailyCalendarObj: action.payload };
        case CREATE_DAILY_CALENDAR_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const getDailyTasksReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case GET_DAILY_TASKS_REQUEST:
            return { loading: true };
        case GET_DAILY_TASKS_SUCCESS:
            return { loading: false, dailyTasks: action.payload };
        case GET_DAILY_TASKS_FAILURE:
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

export const editTimeBubbleReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case UPDATE_TIME_BUBBLE_CONFIG_REQUEST:
            return { loading: true};
        case UPDATE_TIME_BUBBLE_CONFIG_SUCCESS:
            return { loading: false, dailyTask: action.payload };
        case UPDATE_TIME_BUBBLE_CONFIG_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const deleteTaskAwayScheduleReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case DELETE_TASK_AWAY_SCHEDULE_REQUEST:
            return { loading: true };
        case DELETE_TASK_AWAY_SCHEDULE_SUCCESS:
            return { loading: false, dailyCalendar: action.payload };
        case DELETE_TASK_AWAY_SCHEDULE_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}
