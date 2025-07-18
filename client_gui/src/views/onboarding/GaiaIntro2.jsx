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
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [chatInput, setChatInput] = useState("");

  const endRef = useRef(null);

  const suggestions = [
    "Who are you?",
    "What features does Gaia offer?",
    "Why should I use Gaia?",
  ];

  const chatHistory = useSelector((state) => state.chatHistory);
  const userInfo = useSelector((state) => state.userSignin?.userInfo);
  const { loading, error, chatMessages } = chatHistory;

  const getChatMessages = useCallback(() => {
    dispatch(getChatHistory(size, page, "gaia_introduction"));
  }, [dispatch, size, page]);

  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      getChatMessages();
    }, 200);
  }, []);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const userId = userInfo?.id || "";
    dispatch(sendChatMessage(userId, chatInput, "gaia_introduction"));
    setChatInput("");
  };

  return (
    <>
      {loading ? (
        <p>Loading ...</p>
      ) : error ? (
        <p> Error when loading chat history {error.message}</p>
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
              onClick={() => setShowChat(!true)}
            >
              {!showChat && (
                <Button variant="light" size="lg">
                  Get Started
                </Button>
              )}
            </motion.div>
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="mt-4"
                >
                  <Card className="flex, flex-col h-[600px]">
                    <div className="flex-1 overflow-auto p-4 space-y-3">
                      <div className="flex justify-start">
                        <Grid numItems={1}>
                          <Col numColSpan={1}>
                            <div className="max-w-lg px-4 py-2 rounded-2xl break-words bg-gray-200 text-gray-800">
                              Hello! I'm Gaia, your AI assistant. I am very
                              excited because you choose me to be you partner in
                              this journey!
                            </div>
                          </Col>
                        </Grid>
                      </div>

                      {chatMessages.messages((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.senderType === "bot" ? "justify-start" : "justify-end"}`}
                        >
                          <Grid numItems={1}>
                            <Col numColSpan={1}>
                              <div
                                className={[
                                  "max-w-lg px-4 py-2 rounded-3xl break-words",
                                  msg.senderType === "bot"
                                    ? "bg-gray-200 text-gray-800"
                                    : "bg-blue-500 text-white",
                                ].join(" ")}
                              >
                                {msg.content}
                              </div>
                            </Col>
                          </Grid>
                        </div>
                      ))}

                      {/* {chatHistorymap((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                                                    <Grid numItems={1}>
                                                        <Col numColSpan={1}>
                                                            <div
                                                                className={[
                                                                    'max-w-lg px-4 py-2 rounded-3xl break-words',
                                                                    msg.from === 'bot'
                                                                        ? 'bg-gray-200 text-gray-800'
                                                                        : 'bg-blue-500 text-white'
                                                                ].join(' ')}
                                                            >
                                                                {msg.text}
                                                            </div>
                                                        </Col>
                                                    </Grid>
                                                </div>
                                            ))} */}
                      <div ref={endRef} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                      {suggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.2 + index * 0.1,
                          }}
                        >
                          <Card
                            className="p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              setChatInput(suggestion);
                              // Optional: automatically send the suggestion
                              // setChatHistory(prev => [...prev, { from: 'user', text: suggestion }]);
                            }}
                          >
                            <p className="text-gray-700 text-sm">
                              {suggestion}
                            </p>
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </>
  );
};

export default GaiaIntroduction2;
