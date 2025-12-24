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
    const websocketMessageQueue = Array.isArray(props.websocketMessageQueue) ? props.websocketMessageQueue : [];
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
    const processedWebsocketMessageIdsRef = useRef(new Set());

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
        processedWebsocketMessageIdsRef.current = new Set();
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
        if (!websocketMessageQueue.length) return;
        const queuedMessages = websocketMessageQueue.filter(
            (msg) => msg?.id && !processedWebsocketMessageIdsRef.current.has(msg.id)
        );
        if (!queuedMessages.length) return;
        setChatHistory((prev) => [...prev, ...queuedMessages]);
        queuedMessages.forEach((msg) => processedWebsocketMessageIdsRef.current.add(msg.id));
    }, [websocketMessageQueue]);

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

        const botMessageId = `bot-${Date.now()}-${Math.random()}`;
        const botMessage = {
            ...createMessage("...", "bot", { isStreaming: true }),
            id: botMessageId,
        };

        setChatHistory((prev) => [...prev, botMessage]);

        const updateBotMessage = (updater) => {
            setChatHistory((prev) =>
                prev.map((msg) => {
                    if (msg.id !== botMessageId) return msg;
                    const updates = typeof updater === "function" ? updater(msg) : updater;
                    return { ...msg, ...updates };
                })
            );
        };

        const replaceBotWithResponses = (responses) => {
            setChatHistory((prev) => {
                const responseList = Array.isArray(responses)
                    ? responses.filter((item) => item !== null && item !== undefined)
                    : responses
                        ? [responses]
                        : [];

                const botPlaceholder = prev.find((msg) => msg.id === botMessageId);
                const fallbackPayload =
                    responseList.length > 0
                        ? responseList
                        : (botPlaceholder?.content ? [botPlaceholder.content] : [""]);

                const filteredHistory = prev.filter((msg) => msg.id !== botMessageId);
                const botMessages = fallbackPayload.map((resp, index) =>
                    createMessage(formatResponseContent(resp), "bot", {
                        isStreaming: false,
                        sequence: index,
                    })
                );

                return [...filteredHistory, ...botMessages];
            });
        };

        try {
            await sendSSEChatMessage("", chatInput, chatType, {
                onChunk: (accumulated) => {
                    updateBotMessage({ content: accumulated, isStreaming: true });
                },
                onComplete: (result) => {
                    const normalizedResponses = Array.isArray(result?.responses)
                        ? result.responses
                        : result?.response
                            ? [result.response]
                            : [];

                    const newDialogueId = typeof result === "object" ? (result?.dialogueId || result?.dialogue_id) : null;

                    replaceBotWithResponses(normalizedResponses);

                    // Update URL with dialogue_id if received and we don't have one yet
                    if (newDialogueId && (!dialogueId || dialogueId === "")) {
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.set("dialogueId", newDialogueId);
                        if (chatType) {
                            newSearchParams.set("type", chatType);
                        }
                        navigate(`?${newSearchParams.toString()}`, { replace: true });
                        
                        // Reload history after URL update to get persisted messages from database
                        setTimeout(() => {
                            setChatHistory([]);
                            dispatch(getChatHistory(size, "", newDialogueId, chatType));
                        }, 300);
                    }
                },
                onError: () => {
                    replaceBotWithResponses(["Sorry, something went wrong."]);
                },
            });
        } catch (error) {
            console.error("Failed to send chat message:", error);
            replaceBotWithResponses(["Sorry, something went wrong."]);
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
