import {
	GET_CHAT_HISTORY_FAILURE,
	GET_CHAT_HISTORY_REQUEST,
	GET_CHAT_HISTORY_SUCCESS,
	SEND_CHAT_MESSAGE_REQUEST,
	SEND_CHAT_MESSAGE_SUCCESS,
	SEND_CHAT_MESSAGE_FAIL,
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
                loading: false,
                chatMessages: [...state.chatMessages, ...action.payload.chatMessages],
                nextCursor: action.payload.nextCursor || ""
            };
        case GET_CHAT_HISTORY_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export const sendChatMessageReducer = (
	state = { loading: true, chatMessages: [] },
	action,
) => {
	switch (action.type) {
		case SEND_CHAT_MESSAGE_REQUEST:
			return { ...state, sending: true };
		case SEND_CHAT_MESSAGE_SUCCESS:
			return {...state, sending: false, chatMessages: [...state.chatMessages, action.payload] };
		case SEND_CHAT_MESSAGE_FAIL:
			return { ...state, sending: false, error: action.payload };
		default:
			return state;
	}
};
