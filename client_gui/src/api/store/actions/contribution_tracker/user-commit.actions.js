import { HttpMethods, serverRequest } from "../../../baseAPI";
import { GET_USER_GITHUB_INFO_FAILURE, GET_USER_GITHUB_INFO_REQUEST, GET_USER_GITHUB_INFO_SUCCESS } from "../../constants/contribution_tracker/user-commit.constants"

const portName = {
    middlewarePort: 'middlewarePort'
}

export const getUserGithubInfo = (userId) => async (dispatch) => {
    dispatch({ type: GET_USER_GITHUB_INFO_REQUEST, payload: userId });
    try {
        const { data } = await serverRequest(`/user-github/${userId}`, HttpMethods.GET, portName.middlewarePort);
        dispatch({ type: GET_USER_GITHUB_INFO_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GET_USER_GITHUB_INFO_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}