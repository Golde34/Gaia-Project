import { useEffect, useCallback } from 'react';
import { useMultiWS } from '../context/MultiWSContext';
import { createTaskMessage, createTextMessage, MESSAGE_TYPES } from '../utils/chat-message-utils';


const handleGenerateTaskResult = (data, dialogueId) => {
    const { task, response, dialogueId: notifDialogueId } = data;

    if (notifDialogueId !== dialogueId) {
        console.log('[Handler] Skipping - dialogueId mismatch:', notifDialogueId, 'vs', dialogueId);
        return [];
    }

    console.log('[Handler] Processing generate_task_result:', { task, response });

    const generatedMessages = [];

    if (task) {
        generatedMessages.push(createTaskMessage(task, 'bot'));
    }

    if (response) {
        generatedMessages.push(createTextMessage(response, 'bot'));
    }

    return generatedMessages;
};

const NOTIFICATION_HANDLERS = {
    'generate_task_result': handleGenerateTaskResult,
    // Add more handlers here:
    // 'update_task_status': handleUpdateTaskStatus,
    // 'calendar_sync': handleCalendarSync,
};

export const useNotificationHandler = (dialogueId, onMessagesGenerated) => {
    const { messages } = useMultiWS();
    const notificationMessages = messages?.notification || [];

    const processNotification = useCallback((rawMessage) => {
        if (!rawMessage) return null;

        try {
            const parsed = JSON.parse(rawMessage);
            console.log('[Notification Handler] Parsed notification:', parsed);

            const { type, data } = parsed;

            const handler = NOTIFICATION_HANDLERS[type];
            if (handler) {
                const generatedMessages = handler(data, dialogueId);
                if (generatedMessages && generatedMessages.length > 0) {
                    console.log('[Notification Handler] Generated messages:', generatedMessages.length);
                    return generatedMessages;
                }
            }

            return [];

        } catch (error) {
            console.error('[Notification Handler] Error parsing notification:', error);
            return [];
        }
    }, [dialogueId]);

    useEffect(() => {
        if (!notificationMessages || notificationMessages.length === 0) {
            return;
        }

        const latestNotification = notificationMessages[notificationMessages.length - 1];
        const generatedMessages = processNotification(latestNotification);

        if (generatedMessages && generatedMessages.length > 0 && onMessagesGenerated) {
            console.log('[Notification Handler] Calling onMessagesGenerated with', generatedMessages.length, 'messages');
            onMessagesGenerated(generatedMessages);
        }
    }, [notificationMessages, processNotification, onMessagesGenerated]);
};
