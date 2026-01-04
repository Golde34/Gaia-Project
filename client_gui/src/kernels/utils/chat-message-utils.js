export const MESSAGE_TYPES = {
    TASK_RESULT: 'task_result',
    CALENDAR_EVENT: 'calendar_event',
    SYSTEM_NOTIFICATION: 'system_notification',
    // Add more types as needed
};

/**
 * Creates a message object with standard structure
 * @param {string|Array} content - Message content
 * @param {string} senderType - 'user' or 'bot'
 * @param {Object} extra - Additional properties
 * @param {string} extra.messageType - Type of message (use MESSAGE_TYPES constants)
 * @param {Object} extra.taskData - Task data for task_result type
 * @returns {Object} Message object
 */
export const createMessage = (content, senderType, extra = {}) => ({
    id: `${senderType}-${Date.now()}-${Math.random()}`,
    content,
    senderType,
    timestamp: new Date().toISOString(),
    ...extra,
});

/**
 * Creates a task result message with proper structure
 * @param {Object} taskData - Task data object
 * @param {string} senderType - Sender type (default: 'bot')
 * @returns {Object} Task message object
 */
export const createTaskMessage = (taskData, senderType = 'bot') => {
    return createMessage(
        JSON.stringify(taskData), // Fallback content
        senderType,
        {
            messageType: MESSAGE_TYPES.TASK_RESULT,
            taskData: taskData
        }
    );
};

/**
 * Creates a text message with proper structure
 * @param {string} text - Message text
 * @param {string} senderType - Sender type ('user' or 'bot')
 * @returns {Object} Text message object
 */
export const createTextMessage = (text, senderType) => {
    return createMessage(text, senderType);
};

/**
 * Formats message content to displayable string
 * @param {string|Array|Object} content - Content to format
 * @returns {string} Formatted content
 */
export const formatResponseContent = (content) => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) return content.join("\n");
    return String(content ?? "");
};

/**
 * Gets sender type from message object
 * @param {Object} msg - Message object
 * @returns {string} Sender type ('user' or 'bot')
 */
export const getSenderType = (msg) => 
    msg.senderType || msg.sender_type || msg.sender || "";
