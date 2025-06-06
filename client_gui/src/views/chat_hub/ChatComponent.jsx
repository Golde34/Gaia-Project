import { useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Grid, Metric, TextInput } from '@tremor/react';
import { useMultiWS } from '../../kernels/context/MultiWSContext';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion"

function ContentArea(props) {
    const chatType = props.chatType;
    const navigate = useNavigate();
    const { messages, isConnected, sendMessage } = useMultiWS();

    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);      // array of {from, text, taskResult}
    const [lastBotIndex, setLastBotIndex] = useState(0);     // how many bot msgs we've consumed
    const endRef = useRef(null);

    useEffect(() => {
        console.log("Received chat messages in: ", messages.chat);
        const botMsgs = messages.chat || [];
        if (botMsgs.length > lastBotIndex) {
            const newOnes = botMsgs.slice(lastBotIndex).map(raw => {
                let text = '';
                let taskResult = null;

                try {
                    const parsedRaw = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    if (parsedRaw && parsedRaw.type === 'taskResult') {
                        text = parsedRaw.response || '';
                        taskResult = parsedRaw.taskResult || null;
                    } else {
                        text = parsedRaw.text || raw;
                    }
                } catch (error) {
                    text = raw;
                }

                return { from: 'bot', text, taskResult };
            });
            console.log("New bot message: ", newOnes);
            setChatHistory(prev => [...prev, ...newOnes]);
            setLastBotIndex(botMsgs.length);
        }
    }, [messages.chat, lastBotIndex]);

    // Scroll to bottom on every chatHistory change
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = () => {
        if (!chatInput.trim()) return;
        setChatHistory(prev => [...prev, { from: 'user', text: chatInput }]);
        console.log("Chathub JWT: ", localStorage.getItem('chatHubJwt'));
        sendMessage(chatType, JSON.stringify({
            type: 'chat_message',
            localStorage: localStorage.getItem('chatHubJwt'),
            text: chatInput
        }));
        setChatInput('');
    };

    const redirectToTaskDetail = (taskId) => {
        navigate(`/task/detail/${taskId}`);
    };

    return (
        <Card className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-4 space-y-3">
                {chatType === 'onboarding' ? (
                    <div className="flex justify-start">
                        <Grid numItems={1}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Col numColSpan={1}>
                                    <div className="m-2 max-w-xs px-4 py-2 rounded-2xl break-words bg-gray-200 text-gray-800">
                                        Please share your typical day: when do you wake up, work, and relax or have fun? This will help me tailor my suggestions for you!
                                    </div>
                                </Col>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.8, delay: 3 }}
                            >
                                <Col numColSpan={1}>
                                    <div className="m-2 max-w-xs px-4 py-2 rounded-2xl break-words bg-gray-200 text-gray-800">
                                        You can either describe your ideal day in the chat box, or manually adjust your daily schedule using the form on the right. Whichever way you prefer, I’ll use this information to create a daily plan that truly fits you!
                                    </div>
                                </Col>
                            </motion.div>
                        </Grid>
                    </div>
                ) : (
                    <></>
                )}
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                        <Grid numItems={1}>
                            <Col numColSpan={1}>
                                <div
                                    className={[
                                        'max-w-xs px-4 py-2 rounded-2xl break-words',
                                        msg.from === 'bot'
                                            ? 'bg-gray-200 text-gray-800'
                                            : 'bg-blue-500 text-white'
                                    ].join(' ')}
                                > {msg.text} </div>
                            </Col>
                            <Col numColSpan={1}>
                                {/* Task Result card (if any) */}
                                {msg.taskResult && (
                                    <div className="mt-4">
                                        <div className="bg-green-100 p-4 rounded-xl">
                                            <button onClick={() => { redirectToTaskDetail(msg.taskResult.taskId) }} className="bg-green-100 w-full mt-2 text-left">
                                                <h4 className="font-bold">Task {msg.taskResult.actionType}</h4>
                                                <Grid numItems={2}>
                                                    <Col numColSpan={2}>
                                                        <p><strong>Title:</strong> {msg.taskResult.title}</p>
                                                    </Col>
                                                    <Col numColSpan={1}>
                                                        <p><strong>Priority:</strong> {msg.taskResult.priority}</p>
                                                    </Col>
                                                    <Col numColSpan={1}>
                                                        <p><strong>Status:</strong> {msg.taskResult.status}</p>
                                                    </Col>
                                                    <Col numColSpan={1}>
                                                        <p><strong>Deadline:</strong> {msg.taskResult.deadline}</p>
                                                    </Col>
                                                    <Col numColSpan={1}>
                                                        <p><strong>Start Date:</strong> {msg.taskResult.startDate}</p>
                                                    </Col>
                                                </Grid>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Col>
                        </Grid>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            <div className="flex items-center p-4 border-t">
                <TextInput
                    placeholder="Type a message..."
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
    );
}

export default function ChatComponent(props) {
    const chatType = props.chatType
    return (
        <ContentArea chatType={chatType} />
    );
}
