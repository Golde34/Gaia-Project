import { Button, Card, Col, Grid, Metric } from '@tremor/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const GaiaIntroduction2 = ({ onNext, onSkip }) => {
    const dispatch = useDispatch();

    const [showChat, setShowChat] = useState(false);

    const endRef = useRef(null);

    const suggestions = [
        "Who are you?",
        "What features does Gaia offer?",
        "Why should I use Gaia?"
    ];

    const recentHistory = useSelector(state => state.getRecentHistory);

    return (
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
                    transition={{ repeat: showChat ? 0 : Infinity, duration: 1, repeatType: "reverse" }}
                    className='cursor-pointer mt-4'
                    onClick={() => setShowChat(!true)}
                >
                    {!showChat && (
                        <Button variant='light' size='lg'>
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
                            <Card className='flex, flex-col h-[600px]'>
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

                                    {chatHistorymap((msg, idx) => (
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
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    )
}

export default GaiaIntroduction2;