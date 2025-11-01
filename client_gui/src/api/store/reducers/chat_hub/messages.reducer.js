import {
	GET_CHAT_HISTORY_FAILURE,
	GET_CHAT_HISTORY_REQUEST,
	GET_CHAT_HISTORY_SUCCESS,
} from "../../constants/chat_hub/messages.constant";
import { defaultChatHistoryState } from "../../utils/chatHistory";

const cloneDefaultState = () => ({ ...defaultChatHistoryState });

export const chatHistoryReducer = (state = {}, action) => {
	const chatKey = action?.meta?.chatKey || action?.payload?.chatKey;

	switch (action.type) {
		case GET_CHAT_HISTORY_REQUEST: {
			if (!chatKey) return state;

			const previous = state[chatKey] ?? cloneDefaultState();
			const isInitialFetch = !action?.payload?.cursor;

			return {
				...state,
				[chatKey]: {
					...(isInitialFetch ? cloneDefaultState() : previous),
					loading: true,
					error: null,
				},
			};
		}
		case GET_CHAT_HISTORY_SUCCESS: {
			if (!chatKey) return state;

			const chatMessages = Array.isArray(action.payload?.chatMessages)
				? action.payload.chatMessages
				: [];

			return {
				...state,
				[chatKey]: {
					...cloneDefaultState(),
					loading: false,
					error: null,
					chatMessages,
					nextCursor: action.payload?.nextCursor || "",
					hasMore: action.payload?.hasMore || false,
				},
			};
		}
		case GET_CHAT_HISTORY_FAILURE: {
			if (!chatKey) return state;

			const previous = state[chatKey] ?? cloneDefaultState();

			return {
				...state,
				[chatKey]: {
					...previous,
					loading: false,
					error: action.payload,
				},
			};
		}
		default:
			return state;
	}
};
