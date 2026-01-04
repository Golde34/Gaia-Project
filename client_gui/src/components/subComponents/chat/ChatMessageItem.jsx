import { Col, Grid } from "@tremor/react";
import { MESSAGE_TYPES } from "../../../kernels/utils/chat-message-utils";
import CardItem from "../CardItem";

/**
 * ChatMessageItem - Renders a single chat message bubble
 * @param {Object} msg - Message object
 * @param {string} msg.id - Unique message ID
 * @param {string} msg.content - Message content (string or array)
 * @param {string} msg.senderType - 'user' or 'bot'
 * @param {boolean} msg.isStreaming - Whether message is currently streaming
 * @param {string} msg.messageType - Optional message type (use MESSAGE_TYPES constants)
 * @param {Object} msg.taskData - Optional task data for task_result messages
 * @param {function} formatContent - Function to format message content
 */
export default function ChatMessageItem({ msg, formatContent }) {
    const getSenderType = (msg) => msg.senderType || msg.sender_type || msg.sender || "";
    const sender = getSenderType(msg);
    const isBot = sender === "bot";

    const renderMessageContent = (msg) => {
        // Route to appropriate component based on messageType
        switch (msg.messageType) {
            case MESSAGE_TYPES.TASK_RESULT:
                return msg.taskData ? 
                    <CardItem task={msg.taskData} taskId={msg.taskData.taskId} /> 
                    : null;    

            // Add more message types here:
            // case MESSAGE_TYPES.CALENDAR_EVENT:
            //     return <CalendarEventMessage eventData={msg.eventData} />;
            
            default:
                // Default text message rendering
                const formatted = formatContent(msg.content);
                return (
                    <div className="whitespace-pre-wrap break-words">
                        {formatted}
                    </div>
                );
        }
    };

    return (
        <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
            <Grid numItems={1}>
                <Col numColSpan={1}>
                    <div
                        className={[
                            msg.messageType === MESSAGE_TYPES.TASK_RESULT
                                ? "max-w-2xl" 
                                : "max-w-lg px-4 py-2 rounded-3xl break-words",
                            msg.messageType === MESSAGE_TYPES.TASK_RESULT
                                ? ""
                                : isBot ? "bg-gray-200 text-gray-800" : "bg-blue-500 text-white",
                            msg.isStreaming ? "animate-pulse" : "",
                        ].filter(Boolean).join(" ")}
                    >
                        {renderMessageContent(msg)}
                    </div>
                </Col>
            </Grid>
        </div>
    );
}
