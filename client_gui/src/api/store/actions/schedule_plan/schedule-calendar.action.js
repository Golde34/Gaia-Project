import { HttpMethods, serverRequest } from "../../../baseAPI";
import {
    CREATE_DAILY_CALENDAR_FAILURE, CREATE_DAILY_CALENDAR_REQUEST, CREATE_DAILY_CALENDAR_SUCCESS,
    GET_DAILY_TASKS_FAILURE, GET_DAILY_TASKS_REQUEST, GET_DAILY_TASKS_SUCCESS,
    REGISTER_SCHEDULE_CALENDAR_FAILURE, REGISTER_SCHEDULE_CALENDAR_REQUEST, REGISTER_SCHEDULE_CALENDAR_SUCCESS,
    GET_TIME_BUBBLE_CONFIG_FAILURE, GET_TIME_BUBBLE_CONFIG_REQUEST, GET_TIME_BUBBLE_CONFIG_SUCCESS
} from "../../constants/schedule_plan/schedule-calendar.constants";

const portName = {
    middleware: 'middlewarePort'
}

export const registerCalendarAction = (scheduleCalendar) => async (dispatch) => {
    dispatch({ type: REGISTER_SCHEDULE_CALENDAR_REQUEST, payload: scheduleCalendar });
    try {
        const { data } = await serverRequest('/schedule-calendar/register', HttpMethods.POST, portName.middleware, scheduleCalendar);
        dispatch({ type: REGISTER_SCHEDULE_CALENDAR_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: REGISTER_SCHEDULE_CALENDAR_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const createDailyCalendarAction = (dailyTasks) => async (dispatch) => {
    dispatch({ type: CREATE_DAILY_CALENDAR_REQUEST, payload: dailyTasks });
    try {
        const body = { tasks: dailyTasks };
        const { data } = await serverRequest('/schedule-calendar/generate-daily-calendar', HttpMethods.POST, portName.middleware, body);
        dispatch({ type: CREATE_DAILY_CALENDAR_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: CREATE_DAILY_CALENDAR_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getDailyTasksAction = () => async (dispatch) => {
    dispatch({ type: GET_DAILY_TASKS_REQUEST });
    try {
        const { data } = await serverRequest('/schedule-calendar/daily-tasks', HttpMethods.GET, portName.middleware);
        console.log(data);
        dispatch({ type: GET_DAILY_TASKS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: GET_DAILY_TASKS_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getTimeBubbleConfig = () => async (dispatch) => {
    dispatch({ type: GET_TIME_BUBBLE_CONFIG_REQUEST });
    try {
        const { data } = await serverRequest(`/schedule-calendar/time-bubble-config`, HttpMethods.GET, portName.middleware);
        dispatch({ type: GET_TIME_BUBBLE_CONFIG_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: GET_TIME_BUBBLE_CONFIG_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}
