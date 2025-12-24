import { Col, Grid } from "@tremor/react";

/**
 * ChatMessageItem - Renders a single chat message bubble
 * @param {Object} msg - Message object
 * @param {string} msg.id - Unique message ID
 * @param {string} msg.content - Message content (string or array)
 * @param {string} msg.senderType - 'user' or 'bot'
 * @param {boolean} msg.isStreaming - Whether message is currently streaming
 * @param {function} formatContent - Function to format message content
 */
export default function ChatMessageItem({ msg, formatContent }) {
    const getSenderType = (msg) => msg.senderType || msg.sender_type || msg.sender || "";
    const sender = getSenderType(msg);
    const isBot = sender === "bot";

    const renderMessageContent = (msg) => {
        const formatted = formatContent(msg.content);
        return (
            <div className="whitespace-pre-wrap break-words">
                {formatted}
            </div>
        );
    };

    return (
        <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
            <Grid numItems={1}>
                <Col numColSpan={1}>
                    <div
                        className={[
                            "max-w-lg px-4 py-2 rounded-3xl break-words",
                            isBot ? "bg-gray-200 text-gray-800" : "bg-blue-500 text-white",
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
