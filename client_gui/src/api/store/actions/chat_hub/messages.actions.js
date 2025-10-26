import { config } from "../../../../kernels/configs/configuration";
import { HttpMethods, serverRequest } from "../../../baseAPI";
import {
	GET_CHAT_HISTORY_FAILURE,
	GET_CHAT_HISTORY_REQUEST,
	GET_CHAT_HISTORY_SUCCESS,
} from "../../constants/chat_hub/messages.constant";

const portName = {
	chatHubPort: "chatHubPort",
};

export const getChatHistory = (size, cursor, dialogueId, chatType) => async (dispatch) => {
	dispatch({ type: GET_CHAT_HISTORY_REQUEST });
	try {
		const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
		const { data } = await serverRequest(
			`/chat-interaction/history?size=${size}${cursorParam}&dialogueId=${dialogueId}&chatType=${chatType}`,
			HttpMethods.GET,
			portName.chatHubPort,
		);
		dispatch({ type: GET_CHAT_HISTORY_SUCCESS, payload: data });
	} catch (error) {
		dispatch({
			type: GET_CHAT_HISTORY_FAILURE,
			payload:
				error.response && error.response.data.message
					? error.response.data.message
					: error.message,
		});
	}
};

export const sendSSEChatMessage = async (dialogueId, message, chatType) => {
	try {
		const tokenResponse = await serverRequest(`/chat-interaction/initiate-chat`, HttpMethods.POST, portName.chatHubPort);
		if (tokenResponse.status !== 200) {
			throw new Error("Failed to initiate chat");
		}
		if (!tokenResponse.data) {
			throw new Error("SSE token not received");
		}

		const params = new URLSearchParams({
			dialogueId: dialogueId,
			message: message,
			type: chatType,
			sseToken: tokenResponse.data,
		});
		const baseUrl = `http://${config.serverHost}:${config.chatHubPort}`;
		const url = `${baseUrl}/chat-system/send-message?${params}`;

		return new Promise((resolve, reject) => {
			const eventSource = new EventSource(url);

			eventSource.onmessage = (event) => {
				eventSource.close();
				const response = event.data;
				resolve(response);
			};

			eventSource.onerror = (error) => {
				eventSource.close();
				reject(new Error("EventSource error"));
			};
		});
	} catch (error) {
		console.error("Error sending chat message:", error);
		throw error;
	}
};

export const subscribeSSE = async (dialogueId, tabId, onMessage) => {
	const tokenResponse = await serverRequest(`/chat-interaction/initiate-chat`, HttpMethods.POST, portName.chatHubPort);
	if (tokenResponse.status !== 200) {
		throw new Error("Failed to initiate chat");
	}
	if (!tokenResponse.data) {
		throw new Error("SSE token not received");
	}

	const baseUrl = `http://${config.serverHost}:${config.chatHubPort}`;
	const url = `${baseUrl}/chat-system/subscribe-sse?dialogueId=${encodeURIComponent(dialogueId)}&tabId=${encodeURIComponent(tabId)}&sseToken=${tokenResponse.data}`;

	const eventSource = new EventSource(url);
	eventSource.onmessage = (event) => {
		if (event.data) {
			try {
				event.data = JSON.parse(event.data);
				onMessage(event.data);
			} catch (error) {
				console.error("Error parsing SSE message:", error);
				onMessage({ content: event.data })
			}
		}
	};
	eventSource.onerror = (error) => {
		setTimeout(() => {
			subscribeSSE(dialogueId, tabId, onMessage);
		}, 5000); // Retry after 5 seconds
		console.error("Error subscribing to SSE:", error);
	};
	return eventSource;
}

export const sendNormalChatMessageNew = async (dialogueId, message, chatType, tabId) => {
	const resp = await serverRequest(`/chat-interaction/send-message`, HttpMethods.POST, portName.chatHubPort, {
		dialogueId: dialogueId,
		message: message,
		type: chatType,
		tabId: tabId,
	});
	if (resp.status !== 200) {
		throw new Error("Failed to send chat message");
	}
	return resp.data;
};
