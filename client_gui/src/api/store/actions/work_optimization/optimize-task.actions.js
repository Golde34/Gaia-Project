import { convertDateToString } from "../../../../kernels/utils/date-picker";
import { HttpMethods, serverRequest } from "../../../baseAPI";
import { OPTIMZE_TASK_BY_USER_FAILURE, OPTIMZE_TASK_BY_USER_REQUEST, OPTIMZE_TASK_BY_USER_SUCCESS } from "../../constants/work_optimization/optimize-task.option";

const portName = {
    middlewarePort: 'middlewarePort'
}

// export const optimizeTaskByUserId = (userId, sendMessage) => async (dispatch) => {
export const optimizeTaskByUserId = (userId) => async (dispatch) => {
    dispatch({ type: OPTIMZE_TASK_BY_USER_REQUEST, payload: userId });
    try {
        const body = {
            userId: parseInt(userId),
            optimizedDate:convertDateToString(new Date()) 
        }
        const { data } = await serverRequest(`/task-optimization/optimize-task-by-user`,
            HttpMethods.POST,
            portName.middlewarePort,
            body
        );
        console.log(data);
        dispatch({ type: OPTIMZE_TASK_BY_USER_SUCCESS, payload: data });

        // sendMessage(JSON.stringify({
        //     userId: userId,
        //     message: 'Init task optimization success',
        // }));
    } catch (error) {
        dispatch({
            type: OPTIMZE_TASK_BY_USER_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}