import { config } from "../../../../kernels/configs/configuration";
import { handleMessageStart, handleMessageChunk, handleMessageEnd, handleMessageComplete,
    handleSuccess, handleFailure, handleError, handleConnectionClosed, createSettleHandler
} from "../../../../kernels/utils/sse_handler";
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
        const sseToken = await initiateSSEConnection();
        const url = buildSSEUrl(dialogueId, message, sseToken, chatType);
        
        return new Promise((resolve, reject) => {
            const eventSource = new EventSource(url);
            const messageStore = createMessageStore();
            const callbacks = { ...options, resolve, reject };
            
            const timeoutId = setTimeout(() => {
                const response = messageStore.buildResponse();
                response.responses[0].content = response.responses[0].content || "Request timeout";
                resolve(response);
                eventSource.close();
            }, 120000);

            const settleHandler = createSettleHandler(eventSource, timeoutId, {
                onComplete: callbacks.onComplete,
                onError: callbacks.onError
            });

            const settleWithPromise = (isSuccess, payload) => {
                settleHandler.settle(isSuccess, payload);
                isSuccess ? resolve(payload) : reject(payload);
            };

            eventSource.addEventListener("message_start", (e) => handleMessageStart(e, messageStore, callbacks));
            eventSource.addEventListener("message_chunk", (e) => handleMessageChunk(e, messageStore, callbacks));
            eventSource.addEventListener("message_end", (e) => handleMessageEnd(e, messageStore, callbacks));
            eventSource.addEventListener("message_complete", (e) => handleMessageComplete(e, messageStore, { settle: settleWithPromise }));
            eventSource.addEventListener("success", (e) => {
                const result = handleSuccess(e, eventSource, timeoutId, settleHandler, messageStore);
                if (result) resolve(result);
            });
            eventSource.addEventListener("failure", (e) => handleFailure(e, { settle: settleWithPromise }));
            eventSource.addEventListener("error", (e) => handleError(e, { settle: settleWithPromise }));
            eventSource.onerror = () => handleConnectionClosed(eventSource, { settle: settleWithPromise });
        });
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw error;
    }
};

const initiateSSEConnection = async () => {
    const tokenResponse = await serverRequest(`/chat-interaction/initiate-chat`, HttpMethods.POST, portName.chatHubPort);
    if (tokenResponse.status !== 200 || !tokenResponse.data) {
        throw new Error("Failed to initiate chat or SSE token not received");
    }
    return tokenResponse.data;
};

const buildSSEUrl = (dialogueId, message, sseToken, chatType) => {
    const params = new URLSearchParams({
        dialogueId,
        message,
        sseToken,
        ...(chatType && { type: chatType })
    });
    return `http://${config.serverHost}:${config.chatHubPort}/chat-system/send-message?${params}`;
};

const createMessageStore = () => {
    const messagesMap = new Map();
    let dialogueIdReceived = null;

    return {
        addMessage: (messageId) => {
            messagesMap.set(messageId, { id: messageId, content: "", completed: false });
        },
        appendContent: (messageId, content) => {
            const message = messagesMap.get(messageId);
            if (message) message.content += content;
        },
        markCompleted: (messageId, messageType) => {
            const message = messagesMap.get(messageId);
            if (message) {
                message.completed = true;
                message.messageType = messageType;
            }
        },
        hasMessage: (messageId) => messagesMap.has(messageId),
        getMessage: (messageId) => messagesMap.get(messageId),
        setDialogueId: (dialogueId) => { dialogueIdReceived = dialogueId; },
        getDialogueId: () => dialogueIdReceived,
        buildResponse: (filterCompleted = false) => {
            const messages = Array.from(messagesMap.values())
                .filter(m => !filterCompleted || m.completed)
                .map(m => ({ content: m.content, messageType: m.messageType }));
            
            return {
                responses: messages.length > 0 ? messages : [{ content: "", messageType: null }],
                dialogueId: dialogueIdReceived
            };
        }
    };
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
