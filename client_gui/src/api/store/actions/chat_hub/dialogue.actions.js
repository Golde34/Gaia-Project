import { HttpMethods, serverRequest } from "../../../baseAPI";
import { 
    GET_ALL_DIALOGUES_FAILURE, GET_ALL_DIALOGUES_REQUEST, GET_ALL_DIALOGUES_SUCCESS 
} from "../../constants/chat_hub/dialogue.constant"

const portName = {
    chatHubPort: "chatHubPort"
}

export const getAllDialogues = (size, cursor) => async (dispatch) => {
    dispatch({ type: GET_ALL_DIALOGUES_REQUEST });
    try {
        const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
        const { data } = await serverRequest(
            `/chat-interaction/dialogues?size=${size}${cursorParam}`,
            HttpMethods.GET,
            portName.chatHubPort,
        );
        dispatch({ type: GET_ALL_DIALOGUES_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: GET_ALL_DIALOGUES_FAILURE,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });
    }
}
