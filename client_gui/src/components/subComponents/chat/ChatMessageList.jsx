import { useEffect, useRef } from "react";
import ChatMessageItem from "./ChatMessageItem";

/**
 * ChatMessageList - Displays list of chat messages with auto-scroll
 * @param {Array} messages - Array of message objects
 * @param {boolean} loadingMore - Whether more messages are being loaded
 * @param {boolean} isLoadingMoreRef - Ref to track loading state
 * @param {Object} scrollRefs - Object containing scroll-related refs
 * @param {function} formatContent - Function to format message content
 */
export default function ChatMessageList({ 
    messages, 
    loadingMore, 
    isLoadingMoreRef,
    scrollRefs,
    formatContent 
}) {
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (isLoadingMoreRef.current) {
            const newScrollHeight = container.scrollHeight;
            const delta = newScrollHeight - scrollRefs.prevScrollHeightRef.current - 50;
            container.scrollTop = scrollRefs.prevScrollTopRef.current + delta;
            isLoadingMoreRef.current = false;
        } else {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, isLoadingMoreRef, scrollRefs]);

    // Expose ref to parent through scrollRefs
    useEffect(() => {
        if (scrollRefs && messagesContainerRef.current) {
            scrollRefs.containerRef = messagesContainerRef;
        }
    }, [scrollRefs]);

    return (
        <div
            ref={messagesContainerRef}
            className="flex-1 overflow-auto p-4 space-y-3"
            style={{ scrollBehavior: "smooth" }}
        >
            {loadingMore && (
                <div className="text-center text-gray-400 my-2">Loading more...</div>
            )}

            {messages && messages.length > 0 ? (
                messages.map((msg, idx) => (
                    <ChatMessageItem 
                        key={msg.id || idx} 
                        msg={msg} 
                        formatContent={formatContent}
                    />
                ))
            ) : (
                <div className="text-center text-gray-500">No messages yet</div>
            )}
        </div>
    );
}
