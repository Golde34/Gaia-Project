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
			let accumulatedResponse = "";
			let settled = false;

			const resolveOnce = (payload) => {
				if (settled) return;
				settled = true;
				eventSource.close();
				resolve(payload);
			};

			const rejectOnce = (error) => {
				if (settled) return;
				settled = true;
				eventSource.close();
				reject(error);
			};

			eventSource.addEventListener("message_chunk", (event) => {
				try {
					const data = JSON.parse(event.data);
					if (data?.chunk) {
						accumulatedResponse += data.chunk;
						if (data?.is_final) {
							resolveOnce(accumulatedResponse);
						}
					}
				} catch {
					accumulatedResponse += event.data || "";
				}
			});

			eventSource.addEventListener("message_complete", (event) => {
				let finalResponse = accumulatedResponse;
				try {
					const data = JSON.parse(event.data);
					if (data?.full_response) {
						finalResponse = data.full_response;
					}
				} catch {
					if (!finalResponse && event.data) {
						finalResponse = event.data;
					}
				}
				resolveOnce(finalResponse);
			});

			eventSource.addEventListener("error", (event) => {
				let errorMessage = "EventSource error";
				try {
					const data = JSON.parse(event.data);
					if (data?.error) {
						errorMessage = data.error;
					}
				} catch {
					if (event?.data) {
						errorMessage = event.data;
					}
				}
				rejectOnce(new Error(errorMessage));
			});

			eventSource.onmessage = (event) => {
				const response = event.data;
				if (response) {
					accumulatedResponse = response;
				}
				resolveOnce(response ?? accumulatedResponse);
			};

			eventSource.onerror = () => {
				rejectOnce(new Error("EventSource connection error"));
			};
		});
	} catch (error) {
		console.error("Error sending chat message:", error);
		throw error;
	}
};

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
