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

        let params = null;
        if (chatType === undefined || chatType === null) {
            params = new URLSearchParams({
                dialogueId: dialogueId,
                message: message,
                sseToken: tokenResponse.data,
            });
        } else {
            params = new URLSearchParams({
                dialogueId: dialogueId,
                message: message,
                type: chatType,
                sseToken: tokenResponse.data,
            });
        }
        const baseUrl = `http://${config.serverHost}:${config.chatHubPort}`;
        const url = `${baseUrl}/chat-system/send-message?${params}`;

        const { onChunk, onComplete, onError } = options ?? {};

        return new Promise((resolve, reject) => {
            const eventSource = new EventSource(url);
            let accumulatedResponse = "";
            let settled = false;
            let timeoutId = null;

            const resolveOnce = (payload) => {
                if (settled) return;
                settled = true;
                if (timeoutId) clearTimeout(timeoutId);
                if (onComplete) {
                    try {
                        onComplete(payload);
                    } catch (callbackError) {
                        console.error("onComplete callback failed:", callbackError);
                    }
                }
                eventSource.close();
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
                    } catch (callbackError) {
                        console.error("onError callback failed:", callbackError);
                    }
                }
                reject(error);
            };

            // Safety timeout: if no message_complete after 2 minutes, resolve with what we have
            timeoutId = setTimeout(() => {
                if (!settled) {
                    const fallback = accumulatedResponse || "Request timeout";
                    resolveOnce({
                        response: fallback,
                        responses: fallback ? [fallback] : [],
                        dialogueId: null,
                        messageHandlerType: null,
                    });
                }
            }, 120000); // 2 minutes

            eventSource.addEventListener("message_chunk", (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("Received message_chunk data:", data);
                    if (data?.chunk) {
                        accumulatedResponse += data.chunk;
                        if (onChunk) {
                            try {
                                onChunk(accumulatedResponse, data.chunk);
                            } catch (callbackError) {
                                console.error("onChunk callback failed:", callbackError);
                            }
                        }
                        // Don't resolve when is_final=true, wait for message_complete to get dialogue_id
                    }
                } catch {
                    accumulatedResponse += event.data || "";
                    if (onChunk) {
                        try {
                            onChunk(accumulatedResponse, event.data || "");
                        } catch (callbackError) {
                            console.error("onChunk callback failed:", callbackError);
                        }
                    }
                }
            });

            eventSource.addEventListener("message_complete", (event) => {
                let finalResponse = accumulatedResponse;
                let dialogueIdFromResponse = null;
                let responsesFromPayload = [];
                let messageHandlerType = null;

                try {
                    const data = JSON.parse(event.data);

                    if (data?.dialogue_id || data?.dialogueId) {
                        dialogueIdFromResponse = data.dialogue_id || data.dialogueId;
                    }

                    if (Array.isArray(data?.responses)) {
                        responsesFromPayload = data.responses;
                    } else if (data?.responses) {
                        responsesFromPayload = [data.responses];
                    }

                    messageHandlerType = data?.message_handler_type || data?.messageHandlerType || data?.type || null;

                    // Use full_response or response from event if accumulated response is empty
                    if (data?.full_response && !finalResponse) {
                        finalResponse = data.full_response;
                    }
                    if (data?.response && !finalResponse) {
                        finalResponse = data.response;
                    }
                } catch (parseError) {
                    // Use accumulated response if parsing fails
                }

                if (!finalResponse && responsesFromPayload.length) {
                    finalResponse = responsesFromPayload.join("\n\n");
                }

                const payload = {
                    response: finalResponse,
                    responses: responsesFromPayload.length ? responsesFromPayload : (finalResponse ? [finalResponse] : []),
                    dialogueId: dialogueIdFromResponse,
                    messageHandlerType,
                };

                resolveOnce(payload);
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

            // Handle generic connection errors
            eventSource.onerror = () => {
                // Don't reject immediately on first error, could be temporary network issue
                // The timeout will handle persistent connection problems
                if (eventSource.readyState === EventSource.CLOSED) {
                    rejectOnce(new Error("EventSource connection closed unexpectedly"));
                }
            };
            
            // Note: We removed onmessage handler because it was catching all events
            // and resolving prematurely. We now rely on specific event listeners:
            // - message_chunk: for streaming chunks
            // - message_complete: for final response with dialogue_id
            // This ensures we always wait for message_complete to get dialogue_id
            
            // Cleanup function (useful if Promise is canceled externally)
            const cleanup = () => {
                if (timeoutId) clearTimeout(timeoutId);
                if (eventSource.readyState !== EventSource.CLOSED) {
                    eventSource.close();
                }
            };
            
            // Attach cleanup to Promise (if needed in future for abort capability)
            resolve.cleanup = cleanup;
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
