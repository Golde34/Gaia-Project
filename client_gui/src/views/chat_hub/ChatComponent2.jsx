import { useDispatch, useSelector } from "react-redux";
import { getTabId } from "../../kernels/utils/set-interval";
import { useCallback, useEffect, useRef, useState } from "react";
import { getChatHistory, sendSSEChatMessage } from "../../api/store/actions/chat_hub/messages.actions";
import { Button, Card, Col, Grid, TextInput } from "@tremor/react";
import { useSearchParams } from "react-router-dom";

export default function ChatComponent2(props) {
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
    const { loading, error, chatMessages, nextCursor, hasMore } = dbChatHistory;

    const messagesContainerRef = useRef(null);
    const didGetChatHistoryRef = useRef(false);
    const isLoadingMoreRef = useRef(false);
    const prevScrollHeightRef = useRef(0);
    const prevScrollTopRef = useRef(0);

    const getChatMessages = useCallback((loadCursor) => {
        const cursorToUse = loadCursor || nextCursor || "";
		console.log("Dialogue ID:", dialogueId);
        dispatch(getChatHistory(size, cursorToUse, dialogueId, chatType));
    }, [dispatch, size, nextCursor]);

    useEffect(() => {
        if (didGetChatHistoryRef.current) return;
        getChatMessages();
        didGetChatHistoryRef.current = true;
    }, []);

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
                getChatMessages();
            }
        };
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [hasMore, loading, getChatMessages]);

    // Handle sending messages
    const handleSend = async () => {
        const createMessage = (content, senderType) => ({
            id: `${senderType}-${Date.now()}-${Math.random()}`,
            content,
            senderType,
            timestamp: new Date().toISOString(),
        });

        if (!chatInput.trim()) return;
        const userMessage = createMessage(chatInput, "user");
        setChatHistory((prev) => [...prev, userMessage]);
        setChatInput("");

        try {
            const response = await sendSSEChatMessage("", chatInput, chatType);
            if (response) {
                const botMessage = createMessage(response, "bot");
                setChatHistory((prev) => [...prev, botMessage]);
            }
        } catch (error) {
            console.error("Failed to send chat message:", error);
        }
    };
    return (
        <>
            {loading && !chatHistory.length ? (
                <p>Loading ...</p>
            ) : error ? (
                <p>Error when loading chat history: {error}</p>
            ) : (
                <Card className="flex flex-col h-[80vh]">
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
                                            <div className={[
                                                "max-w-lg px-4 py-2 rounded-3xl break-words",
                                                msg.senderType === "bot" ? "bg-gray-200 text-gray-800" : "bg-blue-500 text-white",
                                            ].join(" ")}>
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
