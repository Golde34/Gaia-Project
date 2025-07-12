import { motion, AnimatePresence } from "framer-motion"
import { Button, Card, Col, Grid, Metric, TextInput } from "@tremor/react"
import { useState, useRef, useEffect } from "react"
import { useMultiWS } from "../../kernels/context/MultiWSContext"

const GaiaIntroduction = ({ onNext, onSkip }) => {
    const { messages, isConnected, sendMessage } = useMultiWS()

    const [showChat, setShowChat] = useState(false)
    const [chatInput, setChatInput] = useState("")
    const [chatHistory, setChatHistory] = useState([])
    const [lastBotIndex, setLastBotIndex] = useState(0);
    const endRef = useRef(null)

    const suggestions = [
        "Who are you?",
        "What features does Gaia offer?",
        "Why should I use Gaia?"
    ]

    useEffect(() => {
        console.log("Received chat messages in: ", messages.chat);
        const botMsgs = messages.chat || [];
        if (botMsgs.length > lastBotIndex) {
            const newOnes = botMsgs.slice(lastBotIndex).map(raw => {
                let text = '';
                try {
                    const parsedRaw = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    text = parsedRaw.text || raw;
                } catch (error) {
                    text = raw;
                }

                return { from: 'bot', text };
            });
            console.log("New bot message: ", newOnes);
            setChatHistory(prev => [...prev, ...newOnes]);
            setLastBotIndex(botMsgs.length);
        }
    }, [messages.chat, lastBotIndex]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = () => {
        if (!chatInput.trim()) return;

        setChatHistory(prev => [...prev, { from: 'user', text: chatInput }]);

        console.log("Chathub JWT: ", localStorage.getItem('chatHubJwt'));
        sendMessage('chat', JSON.stringify({
            type: 'gaia_introduction',
            localStorage: localStorage.getItem('chatHubJwt'),
            text: chatInput
        }));
        setChatInput('');
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-center"
            >
                <Metric className="mb-4">
                    Welcome to Gaia, your virtual assistant!
                </Metric>

                <motion.div
                    animate={{ y: showChat ? 0 : 10 }}
                    transition={{ repeat: showChat ? 0 : Infinity, duration: 1, repeatType: "reverse" }}
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
                            <div className="flex-1 overflow-auto p-4 space-y-3">
                                <div className="flex justify-start">
                                    <Grid numItems={1}>
                                        <Col numColSpan={1}>
                                            <div className="max-w-lg px-4 py-2 rounded-2xl break-words bg-gray-200 text-gray-800">
                                                Hello! I'm Gaia, your AI assistant. I am very excited because you choose me to be you partner in this journey! 
                                            </div>
                                        </Col>
                                    </Grid>
                                </div>

                                {chatHistory.map((msg, idx) => (
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
                                ))}
                                <div ref={endRef} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                                {suggestions.map((suggestion, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                                    >
                                        <Card
                                            className="p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => {
                                                setChatInput(suggestion);
                                                // Optional: automatically send the suggestion
                                                // setChatHistory(prev => [...prev, { from: 'user', text: suggestion }]);
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
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    className="flex-1 mr-2"
                                />
                                <Button onClick={handleSend} disabled={!isConnected.chat}>
                                    Send
                                </Button>
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
    )
}

export default GaiaIntroduction;
