import { HttpMethods, serverRequest } from "../../../baseAPI";
import { COMPARE_COMMTIS_FAILURE, COMPARE_COMMTIS_REQUEST, COMPARE_COMMTIS_SUCCESS, 
    PROJECT_CONTRIBUTIONS_FAILURE, PROJECT_CONTRIBUTIONS_REQUEST, PROJECT_CONTRIBUTIONS_SUCCESS, 
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

export const getCompareCommits = () => async (dispatch) => {
    dispatch({ type: COMPARE_COMMTIS_REQUEST });
    try {
        const { data } = await serverRequest(`/contribution/compare-commits`, HttpMethods.GET, portName.middlewarePort);
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

export const getProjectContribution = (userId, projectId) => async (dispatch) => {
    dispatch({ type: PROJECT_CONTRIBUTIONS_REQUEST, payload: userId });
    try {
        const { data } = await serverRequest(`/contribution/${userId}/${projectId}`, HttpMethods.GET, portName.middlewarePort);
        dispatch({ type: PROJECT_CONTRIBUTIONS_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: PROJECT_CONTRIBUTIONS_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}