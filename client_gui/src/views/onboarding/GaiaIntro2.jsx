import { Button, Card, Col, Grid, Metric, TextInput } from "@tremor/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	getChatHistory,
	sendChatMessage,
} from "../../api/store/actions/chat_hub/messages.actions";

const GaiaIntroduction2 = ({ onNext, onSkip }) => {
  const dispatch = useDispatch();

  const [showChat, setShowChat] = useState(false);
  const [cursor, setCursor] = useState("");
  const [size, setSize] = useState(20);
  const [chatInput, setChatInput] = useState("");

  const endRef = useRef(null);
  const topRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const suggestions = [
    "Who are you?",
    "What features does Gaia offer?",
    "Why should I use Gaia?",
  ];

  const chatHistory = useSelector((state) => state.chatHistory);
  const { loading, error, chatMessages, nextCursor } = chatHistory;

  const getChatMessages = useCallback(() => {
    dispatch(getChatHistory(size, cursor, "", "gaia_introduction"));
  }, [dispatch, size, cursor]);

  const loadMoreMessages = useCallback(() => {
    if (nextCursor && !loading) {
      setCursor(nextCursor);
    }
  }, [nextCursor, loading]);

  const debounceRef = useRef(null);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      getChatMessages();
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [getChatMessages]);

  useEffect(() => {
    if (endRef.current && chatMessages.length > 0) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loading) {
          loadMoreMessages();
        }
      },
      { root: messagesContainerRef.current, threshold: 0.1 }
    );

    if (topRef.current) {
      observer.observe(topRef.current);
    }

    return () => {
      if (topRef.current) {
        observer.unobserve(topRef.current);
      }
    };
  }, [nextCursor, loading, loadMoreMessages]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const dialogueId = chatHistory.dialogue?.id || "";
    dispatch(sendChatMessage(dialogueId, chatInput, "gaia_introduction"));
    setChatInput("");
  };

  return (
    <>
      {loading && !chatMessages.length ? (
        <p>Loading ...</p>
      ) : error ? (
        <p>Error when loading chat history: {error}</p>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center"
          >
            <Metric className="mb-4">
              Welcome to Gaia, your virtual butler!
            </Metric>

            <motion.div
              animate={{ y: showChat ? 0 : 10 }}
              transition={{
                repeat: showChat ? 0 : Infinity,
                duration: 1,
                repeatType: "reverse",
              }}
              className="cursor-pointer mt-4"
              onClick={() => setShowChat(true)}
            >
              {!showChat && (
                <Button variant="light" size="lg">
                  Get Started
                </Button>
              )}
            </motion.div>
          </motion.div>
          <AnimatePresence>
            {showChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.8 }}
                className="mt-4"
              >
                <Card className="flex flex-col h-[600px]">
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-auto p-4 space-y-3"
                  >
                    <div ref={topRef} /> {/* Trigger for loading more */}
                    <div className="flex justify-start">
                      <Grid numItems={1}>
                        <Col numColSpan={1}>
                          <div className="max-w-lg px-4 py-2 rounded-2xl break-words bg-gray-200 text-gray-800">
                            Hello! I'm Gaia, your AI assistant. I am very excited
                            because you choose me to be your partner in this
                            journey!
                          </div>
                        </Col>
                      </Grid>
                    </div>

                    {chatMessages && chatMessages.length > 0 ? (
                      chatMessages.map((msg, idx) => (
                        <div
                          key={msg.ID || idx} // Prefer msg.id if available
                          className={`flex ${
                            msg.SenderType === "bot"
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <Grid numItems={1}>
                            <Col numColSpan={1}>
                              <div
                                className={[
                                  "max-w-lg px-4 py-2 rounded-3xl break-words",
                                  msg.SenderType === "bot"
                                    ? "bg-gray-200 text-gray-800"
                                    : "bg-blue-500 text-white",
                                ].join(" ")}
                              >
                                {msg.Content}
                              </div>
                            </Col>
                          </Grid>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500">
                        No messages yet
                      </div>
                    )}

                    <div ref={endRef} />
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
                          onClick={() => {
                            setChatInput(suggestion);
                          }}
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
                  <Button variant="light" onClick={onSkip}>
                    Skip
                  </Button>
                  <Button variant="primary" onClick={onNext}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
};

export default GaiaIntroduction2;