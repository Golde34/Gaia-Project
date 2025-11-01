import { useDispatch, useSelector } from "react-redux";
import { getTabId } from "../../kernels/utils/set-interval";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChatHistory, sendSSEChatMessage } from "../../api/store/actions/chat_hub/messages.actions";
import { Button, Card, Col, Grid, TextInput } from "@tremor/react";
import { useSearchParams } from "react-router-dom";
import { buildChatHistoryKey, defaultChatHistoryState } from "../../api/store/utils/chatHistory";

export default function ChatComponent(props) {
    const isDashboard = props.isDashboard === undefined ? false : props.isDashboard;
    const chatType = props.chatType === undefined ? "" : props.chatType;
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
                onComplete: (finalResponse) => {
                    updateBotMessage({
                        content: finalResponse ?? "",
                        isStreaming: false,
                    });
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

    return (
        <>
            {loading && !chatHistory.length ? (
                <p>Loading ...</p>
            ) : error ? (
                <p>Error when loading chat history: {error}</p>
            ) : (
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
                        <Button onClick={handleSend}>Send</Button>
                    </div>
                </Card>
            )}
        </>
    );
}
