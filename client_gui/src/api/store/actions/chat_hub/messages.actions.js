import { HttpMethods, serverRequest } from "../../../baseAPI";
import { 
    GET_CHAT_HISTORY_FAILURE, GET_CHAT_HISTORY_REQUEST, GET_CHAT_HISTORY_SUCCESS 
} from "../../constants/chat_hub/messages.constant"

const portName = {
    chatHubPort: 'chatHubPort',
}

export const getChatHistory = () => async (dispatch) => {
    dispatch({ type: GET_CHAT_HISTORY_REQUEST });
    try {
        const { data } = await serverRequest(`/chat-history`, HttpMethods.GET, portName.chatHubPort);
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