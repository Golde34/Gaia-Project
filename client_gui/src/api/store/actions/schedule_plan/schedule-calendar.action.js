import { HttpMethods, serverRequest } from "../../../baseAPI";
import {
    CREATE_DAILY_CALENDAR_FAILURE, CREATE_DAILY_CALENDAR_REQUEST, CREATE_DAILY_CALENDAR_SUCCESS,
    GET_DAILY_TASKS_FAILURE, GET_DAILY_TASKS_REQUEST, GET_DAILY_TASKS_SUCCESS,
    REGISTER_SCHEDULE_CALENDAR_FAILURE, REGISTER_SCHEDULE_CALENDAR_REQUEST, REGISTER_SCHEDULE_CALENDAR_SUCCESS,
    GET_TIME_BUBBLE_CONFIG_FAILURE, GET_TIME_BUBBLE_CONFIG_REQUEST, GET_TIME_BUBBLE_CONFIG_SUCCESS,
    UPDATE_TIME_BUBBLE_CONFIG_REQUEST, UPDATE_TIME_BUBBLE_CONFIG_SUCCESS, UPDATE_DAILY_CALENDAR_FAILURE,
    DELETE_TASK_AWAY_SCHEDULE_REQUEST, DELETE_TASK_AWAY_SCHEDULE_SUCCESS, DELETE_TASK_AWAY_SCHEDULE_FAILURE
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

export const createDailyCalendarAction = (tasks) => async (dispatch) => {
    dispatch({ type: CREATE_DAILY_CALENDAR_REQUEST, payload: tasks });
    try {
        const body = { tasks };
        const { data } = await serverRequest('/schedule-calendar/generate-daily-calendar', HttpMethods.POST, portName.middleware, body);
        dispatch({ type: CREATE_DAILY_CALENDAR_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const msg = error.response?.data?.message ?? error.message;
        dispatch({ type: CREATE_DAILY_CALENDAR_FAILURE, payload: msg });
        throw new Error(msg);
    }
};

export const getDailyTasksAction = () => async (dispatch) => {
    dispatch({ type: GET_DAILY_TASKS_REQUEST });
    try {
        const { data } = await serverRequest('/schedule-calendar/daily-tasks', HttpMethods.GET, portName.middleware);
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

export const editTimeBubble = (timeBubble) => async (dispatch) => {
    dispatch({ type: UPDATE_TIME_BUBBLE_CONFIG_REQUEST, payload: timeBubble });
    try {
        const { data } = await serverRequest(`/schedule-calendar/edit-time-bubble`, HttpMethods.POST, portName.middleware, timeBubble);
        dispatch({ type: UPDATE_TIME_BUBBLE_CONFIG_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: UPDATE_DAILY_CALENDAR_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const deleteTaskAwaySchedule = (scheduleDay) => async (dispatch) => {
    dispatch({ type: DELETE_TASK_AWAY_SCHEDULE_REQUEST, payload: scheduleDay });
    try {
        const { data } = await serverRequest(`/schedule-calendar/schedule-day/delete-task-away-schedule`, HttpMethods.POST, portName.middleware, scheduleDay);
        dispatch({ type: DELETE_TASK_AWAY_SCHEDULE_SUCCESS, payload: data });
        return data;
    } catch (error) {
        const msg = error.response && error.response.data.message ? error.response.data.message : error.message;
        dispatch({ type: DELETE_TASK_AWAY_SCHEDULE_FAILURE, payload: msg });
        throw new Error(msg);
    }
};
