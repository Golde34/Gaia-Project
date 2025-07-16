import { GET_CHAT_HISTORY_REQUEST } from "../../constants/chat_hub/messages.constant"

const portName = {
    middlewarePort: 'middlewarePort'
}

export const getChatHistory = () => async (dispatch) => {
    dispatch({ type: GET_CHAT_HISTORY_REQUEST });
    try {
        const { data } = await serverRequest(`/chat-hub/get-chat-history`, HttpMethods.GET, portName.middlewarePort);
        dispatch({ type: GET_CHAT_HISTORY_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: GET_CHAT_HISTORY_FAILURE,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}