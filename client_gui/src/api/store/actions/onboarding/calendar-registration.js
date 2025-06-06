import { HttpMethods, serverRequest } from "../../../baseAPI";

const portName = {
    middlewarePort: 'middlewarePort'
}

export const queryDailyRoutineCalendar = () => async (dispatch) => {
    dispatch({ type: 'QUERY_DAILY_ROUTINE_CALENDAR_REQUEST' });
    try {
        const { data } = await serverRequest('/work-optimization/query-daily-routine-calendar',
            HttpMethods.GET,
            portName.middlewarePort);
        dispatch({ type: 'QUERY_DAILY_ROUTINE_CALENDAR_SUCCESS', payload: data });
    } catch (error) {
        dispatch({
            type: 'QUERY_DAILY_ROUTINE_CALENDAR_FAIL',
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const registerDailyRoutineCalendar = (calendarConfig) => async (dispatch) => {
    dispatch({ type: 'REGISTER_DAILY_ROUTINE_CALENDAR_REQUEST', payload: calendarConfig });
    try {
        const { data } = await serverRequest('/work-optimization/register-daily-routine-calendar', HttpMethods.POST, portName.middlewarePort, calendarConfig);
        dispatch({ type: 'REGISTER_DAILY_ROUTINE_CALENDAR_SUCCESS', payload: data });
        return data.data.registerDailyRoutineCalendar;
    } catch (error) {
        dispatch({
            type: 'REGISTER_DAILY_ROUTINE_CALENDAR_FAIL',
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}
