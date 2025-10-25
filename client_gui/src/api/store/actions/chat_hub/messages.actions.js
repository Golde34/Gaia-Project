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

const aiCoreEndpointMap = {
	gaia_introduction: "/onboarding/introduce-gaia",
	register_calendar: "/onboarding/register-calendar",
};

const getAiCoreEndpoint = (chatType) => {
	if (!chatType) return "/chat/send-message";
	return aiCoreEndpointMap[chatType] || "/chat/send-message";
};

const resolveUserId = () => {
	if (typeof window === "undefined") return "";
	try {
		const userInfo = window.localStorage.getItem("userInfo");
		if (!userInfo) {
			return "";
		}
		const parsed = JSON.parse(userInfo);
		const potentialIds = [
			parsed?.id,
			parsed?.userId,
			parsed?.user?.id,
			parsed?.user?.userId,
		];
		const resolved = potentialIds.find((value) => value !== undefined && value !== null && `${value}`.length > 0);
		return resolved ? `${resolved}` : "";
	} catch (error) {
		console.warn("Unable to parse userInfo from localStorage", error);
		return "";
	}
};

export const sendSSEChatMessage = (dialogueId, message, chatType, callbacks = {}) => {
	if (!message?.trim()) {
		return Promise.reject(new Error("Message is required"));
	}

	const { onChunk, onComplete, onError, onEvent } = callbacks;
	const userId = resolveUserId();
	const baseUrl = `http://${config.serverHost}:${config.aiCorePort}`;
	const endpoint = getAiCoreEndpoint(chatType);
	const params = new URLSearchParams({
		dialogue_id: dialogueId ?? "",
		message,
		user_id: userId ?? "",
	});

	const url = `${baseUrl}${endpoint}?${params.toString()}`;

	return new Promise((resolve, reject) => {
		const eventSource = new EventSource(url, { withCredentials: true });
		let aggregatedResponse = "";
		let isClosed = false;
		let closeTimer = null;

		const closeStream = () => {
			if (!isClosed) {
				isClosed = true;
				eventSource.close();
				if (closeTimer) {
					clearTimeout(closeTimer);
					closeTimer = null;
				}
			}
		};

		const scheduleAutoClose = () => {
			if (closeTimer) return;
			closeTimer = setTimeout(() => {
				closeStream();
			}, 30000);
		};

		eventSource.addEventListener("message_chunk", (event) => {
			try {
				const data = JSON.parse(event.data);
				const chunk = data?.chunk ?? "";
				aggregatedResponse += chunk;
				onChunk?.(chunk, aggregatedResponse, data);
			} catch (error) {
				console.error("Failed to parse SSE chunk data", error);
			}
		});

		eventSource.addEventListener("message_complete", (event) => {
			let finalResponse = aggregatedResponse;
			try {
				const data = JSON.parse(event.data);
				if (typeof data?.full_response === "string" && data.full_response.length > 0) {
					finalResponse = data.full_response;
				}
			} catch (error) {
				console.warn("Failed to parse SSE completion data", error);
			}
			onComplete?.(finalResponse);
			resolve(finalResponse);
			scheduleAutoClose();
		});

		eventSource.addEventListener("error", (event) => {
			if (isClosed) {
				return;
			}
			closeStream();
			console.error("AI Core SSE stream error:", event);
			const error = new Error("EventSource error");
			onError?.(error, event);
			reject(error);
		});

		eventSource.addEventListener("register_calendar_result", (event) => {
			try {
				const data = JSON.parse(event.data);
				onEvent?.("register_calendar_result", data);
			} catch (error) {
				console.error("Failed to parse register calendar SSE event", error);
			}
			scheduleAutoClose();
		});
	});
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
