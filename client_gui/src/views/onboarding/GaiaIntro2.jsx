import { Button, Card, Col, Grid, Metric, TextInput } from "@tremor/react";
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

  const messagesContainerRef = useRef(null);

  const suggestions = [
    "Who are you?",
    "What features does Gaia offer?",
    "Why should I use Gaia?",
  ];

  const dbChatHistory = useSelector((state) => state.chatHistory);
  const { loading, error, chatMessages, nextCursor } = dbChatHistory;

  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      setChatHistory((prevHistory) => {
        const existingIds = new Set(prevHistory.map((msg) => msg.id));
        const newMessages = chatMessages.filter((msg) => !existingIds.has(msg.id));
        return [...newMessages, ...prevHistory];
      });
    }
  }, [chatMessages]);

  const handleLoadMore = useCallback(() => {
    if (nextCursor && !loadingMore) {
      setLoadingMore(true);
      setCursor(nextCursor);
    }
  }, [nextCursor, loadingMore]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop <= 50) { 
        handleLoadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleLoadMore]);

  const didGetChatHistoryRef = useRef(false);
  const getChatMessages = useCallback(() => {
    dispatch(getChatHistory(size, cursor, "", "gaia_introduction"));
    setLoadingMore(false);
  }, [dispatch, size, cursor]);

  useEffect(() => {
    if (didGetChatHistoryRef.current) return;
    getChatMessages();
    didGetChatHistoryRef.current = true;
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatHistory, showChat]);

  const handleSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      content: chatInput,
      senderType: "user",
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prevHistory) => [...prevHistory, userMessage]);
    setChatInput("");

    try {
      const response = await sendChatMessage("", chatInput, "gaia_introduction");
      if (response) {
        const botMessage = {
          id: `bot-${Date.now()}`,
          content: response,
          senderType: "bot",
          timestamp: new Date().toISOString(),
        };
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
              style={{ scrollBehavior: "smooth" }} // For smooth scroll to bottom
            >
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
