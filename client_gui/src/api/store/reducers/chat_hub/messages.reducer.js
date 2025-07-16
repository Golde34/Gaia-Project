import { 
    GET_CHAT_HISTORY_FAILURE, GET_CHAT_HISTORY_REQUEST, GET_CHAT_HISTORY_SUCCESS 
} from "../../constants/chat_hub/messages.constant";

export const recentHistoryReducer = (
    state = { loading: true, chatHistory: [] }, action) => {
    switch (action.type) {
        case GET_CHAT_HISTORY_REQUEST:
            return { loading: true, chatHistory: [] };
        case GET_CHAT_HISTORY_SUCCESS:
            return { loading: false, chatHistory: action.payload };
        case GET_CHAT_HISTORY_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
};