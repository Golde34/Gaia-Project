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
    const chatKey = buildChatHistoryKey(dialogueId, chatType);
    dispatch({ type: GET_CHAT_HISTORY_REQUEST, meta: { chatKey }, payload: { cursor } });
    try {
        const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
        const { data } = await serverRequest(
            `/chat-interaction/history?size=${size}${cursorParam}&dialogueId=${dialogueId}&chatType=${chatType}`,
            HttpMethods.GET,
            portName.chatHubPort,
        );
        dispatch({
            type: GET_CHAT_HISTORY_SUCCESS, payload: { ...data, chatKey, },
        });
    } catch (error) {
        dispatch({
            type: GET_CHAT_HISTORY_FAILURE,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
            meta: { chatKey },
        });
    }
};

const buildChatHistoryKey = (dialogueId = "", chatType = "") => {
    const normalizedDialogueId = dialogueId && `${dialogueId}`.trim() !== "" ? `${dialogueId}` : "default";
    const normalizedChatType = chatType && `${chatType}`.trim() !== "" ? `${chatType}` : "default";
    return `${normalizedChatType}::${normalizedDialogueId}`;
};

export const sendSSEChatMessage = async (dialogueId, message, chatType, options = {}) => {
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
            sseToken: tokenResponse.data,
            ...(chatType && { type: chatType })
        });
        
        const baseUrl = `http://${config.serverHost}:${config.chatHubPort}`;
        const url = `${baseUrl}/chat-system/send-message?${params}`;

        const { onMessageStart, onChunk, onMessageEnd, onComplete, onError } = options ?? {};

        return new Promise((resolve, reject) => {
            const eventSource = new EventSource(url);
            const messagesMap = new Map();
            let settled = false;
            let timeoutId = null;
            let dialogueIdReceived = null;

            const resolveOnce = (payload) => {
                if (settled) return;
                settled = true;
                if (timeoutId) clearTimeout(timeoutId);
                eventSource.close();
                if (onComplete) {
                    try {
                        onComplete(payload);
                    } catch (e) {
                        console.error("onComplete error:", e);
                    }
                }
                resolve(payload);
            };

            const rejectOnce = (error) => {
                if (settled) return;
                settled = true;
                if (timeoutId) clearTimeout(timeoutId);
                eventSource.close();
                if (onError) {
                    try {
                        onError(error);
                    } catch (e) {
                        console.error("onError error:", e);
                    }
                }
                reject(error);
            };

            timeoutId = setTimeout(() => {
                if (!settled) {
                    const allMessages = Array.from(messagesMap.values()).map(m => m.content);
                    resolveOnce({
                        responses: allMessages.length > 0 ? allMessages : ["Request timeout"],
                        dialogueId: dialogueIdReceived
                    });
                }
            }, 120000);

            eventSource.addEventListener("message_start", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const messageId = data.message_id;
                    if (!messageId) return;

                    messagesMap.set(messageId, { id: messageId, content: "", completed: false });
                    
                    if (data.dialogue_id) {
                        dialogueIdReceived = data.dialogue_id;
                    }

                    if (onMessageStart) {
                        onMessageStart(messageId);
                    }
                } catch (e) {
                    console.error("message_start error:", e);
                }
            });

            eventSource.addEventListener("message_chunk", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const messageId = data.message_id;
                    const chunk = data.content || "";
                    
                    if (!messageId || !messagesMap.has(messageId)) return;

                    const messageData = messagesMap.get(messageId);
                    messageData.content += chunk;

                    if (onChunk) {
                        onChunk(messageId, messageData.content, chunk);
                    }
                } catch (e) {
                    console.error("message_chunk error:", e);
                }
            });

            eventSource.addEventListener("message_end", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const messageId = data.message_id;
                    
                    if (!messageId || !messagesMap.has(messageId)) return;

                    const messageData = messagesMap.get(messageId);
                    messageData.completed = true;

                    if (onMessageEnd) {
                        onMessageEnd(messageId, messageData.content);
                    }
                } catch (e) {
                    console.error("message_end error:", e);
                }
            });

            eventSource.addEventListener("message_complete", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.dialogue_id) {
                        dialogueIdReceived = data.dialogue_id;
                    }

                    const allMessages = Array.from(messagesMap.values())
                        .filter(m => m.completed)
                        .map(m => m.content);

                    resolveOnce({
                        responses: allMessages.length > 0 ? allMessages : [""],
                        dialogueId: dialogueIdReceived
                    });
                } catch (e) {
                    console.error("message_complete error:", e);
                    const allMessages = Array.from(messagesMap.values()).map(m => m.content).filter(c => c);
                    resolveOnce({
                        responses: allMessages.length > 0 ? allMessages : [""],
                        dialogueId: dialogueIdReceived
                    });
                }
            });

            eventSource.addEventListener("success", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("Received SUCCESS event - closing connection:", data);
                    
                    // Close connection silently without triggering onComplete
                    if (!settled) {
                        settled = true;
                        if (timeoutId) clearTimeout(timeoutId);
                        eventSource.close();
                        resolve({ silent: true, status: "success", dialogueId: dialogueIdReceived });
                    }
                } catch (e) {
                    console.error("success event error:", e);
                    if (!settled) {
                        settled = true;
                        if (timeoutId) clearTimeout(timeoutId);
                        eventSource.close();
                        resolve({ silent: true, status: "success", dialogueId: dialogueIdReceived });
                    }
                }
            });

            eventSource.addEventListener("failure", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.error("Received FAILURE event:", data);
                    
                    // Close connection and trigger onError to display error message
                    rejectOnce(new Error(data.error || "Chat processing failed"));
                } catch (e) {
                    console.error("failure event error:", e);
                    rejectOnce(new Error("Chat processing failed"));
                }
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

            eventSource.onerror = () => {
                if (eventSource.readyState === EventSource.CLOSED) {
                    rejectOnce(new Error("Connection closed"));
                }
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
