import { convertDateToString } from "../../../../kernels/utils/date-picker";
import { HttpMethods, serverRequest } from "../../../baseAPI";
import { OPTIMZE_TASK_BY_USER_FAILURE, OPTIMZE_TASK_BY_USER_REQUEST, OPTIMZE_TASK_BY_USER_SUCCESS } from "../../constants/work_optimization/optimize-task.constants";

const portName = {
    middlewarePort: 'middlewarePort'
}

// export const optimizeTaskByUserId = (userId, sendMessage) => async (dispatch) => {
export const optimizeTaskByUserId = () => async (dispatch) => {
    dispatch({ type: OPTIMZE_TASK_BY_USER_REQUEST });
    try {
        const body = {
            optimizedDate:convertDateToString(new Date()) 
        }
        const { data } = await serverRequest(`/task-optimization/optimize-task-by-user`,
            HttpMethods.POST,
            portName.middlewarePort,
            body
        );
        dispatch({ type: OPTIMZE_TASK_BY_USER_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: OPTIMZE_TASK_BY_USER_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}