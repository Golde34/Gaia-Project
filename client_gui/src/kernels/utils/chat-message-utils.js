/**
 * Creates a message object with standard structure
 * @param {string|Array} content - Message content
 * @param {string} senderType - 'user' or 'bot'
 * @param {Object} extra - Additional properties
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
