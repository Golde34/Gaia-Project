import { Button, Card, Col, Grid, TextInput } from "@tremor/react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getChatHistory, sendChatMessage } from "../../api/store/actions/chat_hub/messages.actions";

const GaiaIntroduction2 = ({ onNext, onSkip }) => {
  const dispatch = useDispatch();

  const [showChat, setShowChat] = useState(false);
  const [cursor, setCursor] = useState("");
  const [size, setSize] = useState(6);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const dbChatHistory = useSelector((state) => state.chatHistory);
  const { loading, error, chatMessages, nextCursor } = dbChatHistory;

  const messagesContainerRef = useRef(null);
  const isLoadingMoreRef = useRef(false);
  const lastLoadedCursorRef = useRef("__init__");
  const prevScrollHeightRef = useRef(0);
  const didGetChatHistoryRef = useRef(false);

  const suggestions = [
    "Who are you?",
    "What features does Gaia offer?",
    "Why should I use Gaia?",
  ];

  // Fetch chat history
  useEffect(() => {
    console.log("First time loading chat history");
    if (didGetChatHistoryRef.current) return;
    getChatMessages();
    didGetChatHistoryRef.current = true;
  }, []);

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      setChatHistory((prev) => {
        const existingIds = new Set(prev.map((msg) => msg.id));
        const newMessages = chatMessages.filter((msg) => !existingIds.has(msg.id));
        return [...newMessages, ...prev];
      });
      setHasMore(!!nextCursor);
      setCursor(nextCursor || "");
    } else if (chatMessages && chatMessages.length === 0) {
      setHasMore(false);
    }
    setLoadingMore(false);
    isLoadingMoreRef.current = false;
    console.log("Loading more: ", loadingMore, "Has more:", hasMore);
  }, [chatMessages, nextCursor]);

  const getChatMessages = useCallback((loadCursor) => {
    const cursorToUse = loadCursor || nextCursor || "";
    if (cursorToUse === lastLoadedCursorRef.current) return;
    dispatch(getChatHistory(size, cursorToUse, "", "gaia_introduction"));
    lastLoadedCursorRef.current = cursorToUse;
  }, [dispatch, size, nextCursor]);

  // Handle scroll to load more messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (loadingMore) {
      const scrollDiff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop = scrollDiff;
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatHistory, loadingMore]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (container.scrollTop == 0 && hasMore &&
        !loading && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true;
        prevScrollHeightRef.current = container.scrollHeight;
        setLoadingMore(true);
        getChatMessages(cursor);
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
    setChatHistory((prevHistory) => [...prevHistory, userMessage]);
    setChatInput("");

    try {
      const response = await sendChatMessage("", chatInput, "gaia_introduction");
      if (response) {
        const botMessage = createMessage(response, "bot");
        setChatHistory((prevHistory) => [...prevHistory, botMessage]);
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
        <>
          <Card className="flex flex-col h-[600px]">
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-auto p-4 space-y-3"
              style={{ scrollBehavior: "smooth" }}
            >
              {!hasMore && chatHistory.length > 0 && (
                <div className="text-center text-gray-400 my-2">No more messages</div>
              )}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card
                    className="p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setChatInput(suggestion)}
                  >
                    <p className="text-gray-700 text-sm">{suggestion}</p>
                  </Card>
                </motion.div>
              ))}
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

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="light" onClick={onSkip}>Skip</Button>
            <Button variant="primary" onClick={onNext}>Continue</Button>
          </div>
        </>
      )}
    </>
  );
};

export default GaiaIntroduction2;
