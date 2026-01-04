export const createSettleHandler = (eventSource, timeoutId, callbacks) => {
    let settled = false;
    const { onComplete, onError } = callbacks;

    return {
        settle: (isSuccess, payload) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            eventSource.close();
            
            if (isSuccess) {
                onComplete?.(payload);
            } else {
                onError?.(payload);
            }
        },
        isSettled: () => settled
    };
};

export const handleMessageStart = (event, messageStore, callbacks) => {
    try {
        const { message_id, dialogue_id } = JSON.parse(event.data);
        if (!message_id) return;

        messageStore.addMessage(message_id);
        if (dialogue_id) messageStore.setDialogueId(dialogue_id);
        callbacks.onMessageStart?.(message_id);
    } catch (e) {
        console.error("message_start error:", e);
    }
};

export const handleMessageChunk = (event, messageStore, callbacks) => {
    try {
        const { message_id, content = "" } = JSON.parse(event.data);
        if (!message_id || !messageStore.hasMessage(message_id)) return;

        messageStore.appendContent(message_id, content);
        const message = messageStore.getMessage(message_id);
        callbacks.onChunk?.(message_id, message.content, content);
    } catch (e) {
        console.error("message_chunk error:", e);
    }
};

export const handleMessageEnd = (event, messageStore, callbacks) => {
    try {
        const { message_id, message_type } = JSON.parse(event.data);
        if (!message_id || !messageStore.hasMessage(message_id)) return;

        messageStore.markCompleted(message_id, message_type);
        const message = messageStore.getMessage(message_id);
        callbacks.onMessageEnd?.(message_id, message.content, message_type);
    } catch (e) {
        console.error("message_end error:", e);
    }
};

export const handleMessageComplete = (event, messageStore, settleHandler) => {
    try {
        const { dialogue_id } = JSON.parse(event.data);
        if (dialogue_id) messageStore.setDialogueId(dialogue_id);
        settleHandler.settle(true, messageStore.buildResponse(true));
    } catch (e) {
        console.error("message_complete error:", e);
        settleHandler.settle(true, messageStore.buildResponse(false));
    }
};

export const handleSuccess = (event, eventSource, timeoutId, settleHandler, messageStore) => {
    try {
        JSON.parse(event.data); // Validate JSON
        console.log("Received SUCCESS event - closing connection");
    } catch (e) {
        console.error("success event error:", e);
    } finally {
        if (!settleHandler.isSettled()) {
            clearTimeout(timeoutId);
            eventSource.close();
            // Note: Using direct resolution instead of settle to avoid triggering onComplete
            return { silent: true, status: "success", dialogueId: messageStore.getDialogueId() };
        }
    }
};

export const handleFailure = (event, settleHandler) => {
    try {
        const { error = "Chat processing failed" } = JSON.parse(event.data);
        console.error("Received FAILURE event:", error);
        settleHandler.settle(false, new Error(error));
    } catch (e) {
        console.error("failure event error:", e);
        settleHandler.settle(false, new Error("Chat processing failed"));
    }
};

export const handleError = (event, settleHandler) => {
    try {
        const { error } = JSON.parse(event.data);
        settleHandler.settle(false, new Error(error || "EventSource error"));
    } catch {
        settleHandler.settle(false, new Error(event?.data || "EventSource error"));
    }
};

export const handleConnectionClosed = (eventSource, settleHandler) => {
    if (eventSource.readyState === EventSource.CLOSED) {
        settleHandler.settle(false, new Error("Connection closed"));
    }
};