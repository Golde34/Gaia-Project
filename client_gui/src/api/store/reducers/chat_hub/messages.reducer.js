import {
    GET_CHAT_HISTORY_FAILURE,
    GET_CHAT_HISTORY_REQUEST,
    GET_CHAT_HISTORY_SUCCESS,
} from "../../constants/chat_hub/messages.constant";

export const chatHistoryReducer = (
    state = { loading: true, chatMessages: [], nextCursor: "" },
    action
) => {
    switch (action.type) {
        case GET_CHAT_HISTORY_REQUEST:
            return { ...state, loading: true, error: null };
        case GET_CHAT_HISTORY_SUCCESS:
            return {
                ...state,
                chatMessages: Array.isArray(action.payload.chatMessages) ?
                    action.payload.chatMessages : [],
                nextCursor: action.payload.nextCursor || "",
                loading: false,
                error: null,
            };
        case GET_CHAT_HISTORY_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};
