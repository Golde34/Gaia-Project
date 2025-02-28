import { USER_CONTRIBUTIONS_FAILURE, USER_CONTRIBUTIONS_REQUEST, USER_CONTRIBUTIONS_SUCCESS } from "../../constants/contribution_tracker/contribution.constants";

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
