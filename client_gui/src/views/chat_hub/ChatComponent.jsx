import { useDispatch, useSelector } from "react-redux";
import { getTabId } from "../../kernels/utils/set-interval";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChatHistory, sendSSEChatMessage } from "../../api/store/actions/chat_hub/messages.actions";
import { Card } from "@tremor/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { buildChatHistoryKey, defaultChatHistoryState } from "../../kernels/utils/chat-history-utils";
import { createMessage, formatResponseContent } from "../../kernels/utils/chat-message-utils";
import { useNotificationHandler } from "../../kernels/hooks/useNotificationHandler";
import ChatMessageList from "../../components/subComponents/chat/ChatMessageList";
import ChatInputArea from "../../components/subComponents/chat/ChatInputArea";

export default function ChatComponent(props) {
    const navigate = useNavigate();
    const isDashboard = props.isDashboard === undefined ? false : props.isDashboard;
    const chatType = (props.chatType === undefined || props.chatType === null)
        ? undefined : props.chatType;
    const tabId = getTabId();

    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const dialogueId = searchParams.get("dialogueId") ?? "";

    const [size] = useState(20);
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loadingMore, setLoadingMore] = useState(false);

    const dbChatHistory = useSelector((state) => state.chatHistory);
    const conversationKey = useMemo(
        () => buildChatHistoryKey(dialogueId, chatType),
        [dialogueId, chatType]
    );
    const chatState = dbChatHistory[conversationKey] ?? defaultChatHistoryState;
    const { loading, error, chatMessages, nextCursor, hasMore } = chatState;

    const messagesContainerRef = useRef(null);
    const isLoadingMoreRef = useRef(false);
    const prevScrollHeightRef = useRef(0);
    const prevScrollTopRef = useRef(0);

    const handleNotificationMessages = useCallback((generatedMessages) => {
        console.log('[ChatComponent] Received generated messages from notification:', generatedMessages);
        if (generatedMessages && generatedMessages.length > 0) {
            setChatHistory((prev) => [...prev, ...generatedMessages]);
        }
    }, []);

    useNotificationHandler(dialogueId, handleNotificationMessages);

    const scrollRefs = useMemo(() => ({
        containerRef: messagesContainerRef,
        prevScrollHeightRef,
        prevScrollTopRef,
    }), []);

    const getChatMessages = useCallback(
        (cursorOverride = "") => {
            const cursorToUse = cursorOverride ?? "";
            dispatch(getChatHistory(size, cursorToUse, dialogueId, chatType));
        },
        [dispatch, size, dialogueId, chatType]
    );

    useEffect(() => {
        setChatHistory([]);
        isLoadingMoreRef.current = false;
        prevScrollHeightRef.current = 0;
        prevScrollTopRef.current = 0;
    }, [conversationKey]);

    useEffect(() => {
        getChatMessages("");
    }, [conversationKey, getChatMessages]);

    useEffect(() => {
        if (!chatMessages || chatMessages.length === 0) return;

        setChatHistory((prev) => {
            const existingIds = new Set(prev.map((msg) => msg.id));
            const newMessages = chatMessages.filter((msg) => !existingIds.has(msg.id));
            return [...newMessages, ...prev];
        });
    }, [chatMessages]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (isLoadingMoreRef.current) {
            const newScrollHeight = container.scrollHeight;
            const delta = newScrollHeight - prevScrollHeightRef.current - 50;
            container.scrollTop = prevScrollTopRef.current + delta;
            isLoadingMoreRef.current = false;
            setLoadingMore(false);
        } else {
            container.scrollTop = container.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        const container = scrollRefs.containerRef.current;
        if (!container) return;
        const handleScroll = () => {
            if (
                container.scrollTop === 0 &&
                hasMore &&
                !loading &&
                !isLoadingMoreRef.current
            ) {
                isLoadingMoreRef.current = true;
                prevScrollHeightRef.current = container.scrollHeight;
                prevScrollTopRef.current = container.scrollTop;
                setLoadingMore(true);
                getChatMessages(nextCursor);
            }
        };
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [hasMore, loading, getChatMessages, nextCursor, scrollRefs]);

    // Handle sending messages
    const handleSend = async () => {
        if (!chatInput.trim()) return;
        const userMessage = createMessage(chatInput, "user");
        setChatHistory((prev) => [...prev, userMessage]);
        setChatInput("");

        const handleMessageStart = (messageId) => {
            const botMessage = {
                ...createMessage("", "bot", { isStreaming: true }),
                id: messageId,
            };
            setChatHistory((prev) => [...prev, botMessage]);
        };

        const handleChunk = (messageId, fullContent) => {
            setChatHistory((prev) =>
                prev.map((msg) => 
                    msg.id === messageId 
                        ? { ...msg, content: fullContent, isStreaming: true }
                        : msg
                )
            );
        };

        const handleMessageEnd = (messageId, finalContent, messageType) => {
            setChatHistory((prev) =>
                prev.map((msg) => {
                    if (msg.id !== messageId) return msg;
                    
                    // Try to parse as JSON if messageType is provided
                    let parsedData = null;
                    let displayContent = finalContent;
                    
                    if (messageType) {
                        try {
                            parsedData = JSON.parse(finalContent);
                            displayContent = finalContent;
                        } catch (e) {
                            console.warn(`Failed to parse JSON for messageType ${messageType}:`, e);
                        }
                    }
                    
                    return {
                        ...msg,
                        content: displayContent,
                        messageType: messageType,
                        taskData: parsedData, // For task_result type
                        parsedData: parsedData, // Generic parsed data
                        isStreaming: false
                    };
                })
            );
        };

        const handleComplete = (result) => {
            const newDialogueId = result?.dialogueId;

            if (newDialogueId && (!dialogueId || dialogueId === "")) {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("dialogueId", newDialogueId);
                if (chatType) {
                    newSearchParams.set("type", chatType);
                }
                navigate(`?${newSearchParams.toString()}`, { replace: true });
                
                setTimeout(() => {
                    setChatHistory([]);
                    dispatch(getChatHistory(size, "", newDialogueId, chatType));
                }, 300);
            }
        };

        const handleError = () => {
            const errorMessage = createMessage("Sorry, something went wrong.", "bot", { isStreaming: false });
            setChatHistory((prev) => [...prev, errorMessage]);
        };

        try {
            const result = await sendSSEChatMessage("", chatInput, chatType, {
                onMessageStart: handleMessageStart,
                onChunk: handleChunk,
                onMessageEnd: handleMessageEnd,
                onComplete: handleComplete,
                onError: handleError,
            });
            
            // Handle SUCCESS event - just close connection silently without displaying anything
            if (result?.silent && result?.status === "success") {
                console.log("SSE connection closed successfully");
                // Don't display anything to the user
                return;
            }
        } catch (error) {
            console.error("Failed to send chat message:", error);
            handleError();
        }
    };

    const getDashboardClass = (isDashboard) =>
        `flex flex-col ${isDashboard ? 'h-[40vh] mt-4' : 'h-[80vh]'}`;

    const navigateToOtherChats = () => {
        navigate('/chat');
    };

    const handleChatInputChange = (value) => {
        setChatInput(value);
    };

    return (
        <>
            {loading && !chatHistory.length ? (
                <p>Loading ...</p>
            ) : error ? (
                <p>Error when loading chat history: {error}</p>
            ) : (
                <>
                    <Card className={getDashboardClass(isDashboard)}>
                        <ChatMessageList 
                            messages={chatHistory}
                            loadingMore={loadingMore}
                            isLoadingMoreRef={isLoadingMoreRef}
                            scrollRefs={scrollRefs}
                            formatContent={formatResponseContent}
                        />

                        <ChatInputArea 
                            value={chatInput}
                            onChange={handleChatInputChange}
                            onSend={handleSend}
                            isDashboard={isDashboard}
                            onNavigateToOtherChats={navigateToOtherChats}
                        />
                    </Card>
                </>
            )}
        </>
    );
}
