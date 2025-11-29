import { useDispatch, useSelector } from "react-redux";
import { getTabId } from "../../kernels/utils/set-interval";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChatHistory, sendSSEChatMessage } from "../../api/store/actions/chat_hub/messages.actions";
import { Button, Card, Col, Grid, TextInput } from "@tremor/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { buildChatHistoryKey, defaultChatHistoryState } from "../../kernels/utils/chat-history-utils";

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
        const container = messagesContainerRef.current;
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
    }, [hasMore, loading, getChatMessages, nextCursor]);

    // Handle sending messages
    const handleSend = async () => {
        const createMessage = (content, senderType, extra = {}) => ({
            id: `${senderType}-${Date.now()}-${Math.random()}`,
            content,
            senderType,
            timestamp: new Date().toISOString(),
            ...extra,
        });

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

        try {
            await sendSSEChatMessage("", chatInput, chatType, {
                onChunk: (accumulated) => {
                    updateBotMessage({ content: accumulated, isStreaming: true });
                },
                onComplete: (result) => {
                    const finalResponse = typeof result === "string" ? result : result?.response;
                    const newDialogueId = typeof result === "object" ? result?.dialogueId : null;
                    
                    updateBotMessage({
                        content: finalResponse ?? "",
                        isStreaming: false,
                    });
                    
                    // Update URL with dialogue_id if received and we don't have one yet
                    if (newDialogueId && (!dialogueId || dialogueId === "")) {
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.set("dialogueId", newDialogueId);
                        if (chatType) {
                            newSearchParams.set("type", chatType);
                        }
                        navigate(`?${newSearchParams.toString()}`, { replace: true });
                    }
                },
                onError: () => {
                    updateBotMessage({
                        content: "Sorry, something went wrong.",
                        isStreaming: false,
                        hasError: true,
                    });
                },
            });
        } catch (error) {
            console.error("Failed to send chat message:", error);
            updateBotMessage({
                content: "Sorry, something went wrong.",
                isStreaming: false,
                hasError: true,
            });
        }
    };

    const getDashboardClass = (isDashboard) =>
        `flex flex-col ${isDashboard ? 'h-[40vh] mt-4' : 'h-[80vh]'}`;

    const navigateToOtherChats = () => {
        navigate('/chat');
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
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-auto p-4 space-y-3"
                            style={{ scrollBehavior: "smooth" }}
                        >
                            {loadingMore && (
                                <div className="text-center text-gray-400 my-2">Loading more...</div>
                            )}

                            {chatHistory && chatHistory.length > 0 ? (
                                chatHistory.map((msg, idx) => (
                                    <div
                                        key={msg.id || idx}
                                        className={`flex ${msg.senderType === "bot" ? "justify-start" : "justify-end"}`}
                                    >
                                        <Grid numItems={1}>
                                            <Col numColSpan={1}>
                                                <div
                                                    className={[
                                                        "max-w-lg px-4 py-2 rounded-3xl break-words",
                                                        msg.senderType === "bot" ? "bg-gray-200 text-gray-800" : "bg-blue-500 text-white",
                                                        msg.isStreaming ? "animate-pulse" : "",
                                                    ].filter(Boolean).join(" ")
                                                    }
                                                >
                                                    {msg.content}
                                                </div>
                                            </Col>
                                        </Grid>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500">No messages yet</div>
                            )}
                        </div>

                        <div className="flex items-center p-4 border-t">
                            <TextInput
                                placeholder="Type your message here..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="flex-1 mr-2"
                            />
                            <Button color="indigo" onClick={handleSend}>Send</Button>
                        </div>
                        {isDashboard && (
                            <div className="mt-2 text-center">
                                <Button variant="light" size="sm" onClick={navigateToOtherChats}>
                                    Go to Other Chats
                                </Button>
                            </div>
                        )}
                    </Card>
                </>
            )}
        </>
    );
}
