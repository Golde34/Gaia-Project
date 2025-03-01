import { HttpMethods, serverRequest } from "../../../baseAPI";
import { COMPARE_COMMTIS_FAILURE, COMPARE_COMMTIS_REQUEST, COMPARE_COMMTIS_SUCCESS, 
    USER_CONTRIBUTIONS_FAILURE, USER_CONTRIBUTIONS_REQUEST, USER_CONTRIBUTIONS_SUCCESS 
} from "../../constants/contribution_tracker/contribution.constants";

const portName = {
    middlewarePort: 'middlewarePort'
}

export const getUserContributions = (userId) => async (dispatch) => {
    dispatch({ type: USER_CONTRIBUTIONS_REQUEST, payload: userId });
    try {
        const { data } = await serverRequest(`/contribution/${userId}`, HttpMethods.GET, portName.middlewarePort);
        dispatch({ type: USER_CONTRIBUTIONS_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: USER_CONTRIBUTIONS_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getCompareCommits = (userId) => async (dispatch) => {
    dispatch({ type: COMPARE_COMMTIS_REQUEST, payload: userId });
    try {
        const { data } = await serverRequest(`/contribution/${userId}/compare-commits`, HttpMethods.GET, portName.middlewarePort);
        console.log(data);
        dispatch({ type: COMPARE_COMMTIS_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: COMPARE_COMMTIS_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}
