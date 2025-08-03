import { Button, Card, Col, Grid, Metric } from "@tremor/react";
import ChatComponent from "../chat_hub/ChatComponent";
import TaskRegistration from "./TaskRegistration";
import { motion } from "framer-motion";
import ChatComponent2 from "../chat_hub/ChatComponent2";
import { useMultiWS } from "../../kernels/context/MultiWSContext";
import { useEffect, useState } from "react";

const CalendarRegistration = ({ onNext, onSkip, onPrevious }) => {
    const { messages, isConnected, sendMessage } = useMultiWS();

    const [scheduleCalendarRegistration, setScheduleCalendarRegistration] = useState(null);
    useEffect(() => {
        const handleMessage = (message) => {
            const data = JSON.parse(message);
            if (data.type === 'calendar_registered') {
                console.log('Calendar registration successful:', data.data);
                setScheduleCalendarRegistration(data);
            } else if (data.type === 'registration_failed') {
                console.error('Calendar registration failed:', data);
            }
        };
        messages.chat.forEach(handleMessage);
    }, [messages])

    return (
        <>
            <Metric className="text-2xl mb-5">
                Calendar Registration
            </Metric>
            <Grid numItems={9}>
                <Col numColSpan={4}>
                    <div className="m-4">
                        <ChatComponent2 chatType={'register_calendar'} />
                    </div>
                </Col>
                <Col numColSpan={5}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.8, delay: 3 }}
                    >
                        <TaskRegistration />
                        <Card className="p-4 bg-white shadow-md rounded-lg">
                            {scheduleCalendarRegistration ? (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Calendar Registration Successful</h3>
                                    <p>{scheduleCalendarRegistration.data.message}</p>
                                </div>
                            ) : (
                                <div className="text-gray-500">No calendar registration data available.</div>
                            )}
                        </Card>
                    </motion.div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={onPrevious}>
                            Back
                        </Button>
                        <Button variant="light" onClick={onSkip}>
                            SkipchatType
                        </Button>
                        <Button variant="primary" onClick={onNext}>
                            Continue
                        </Button>
                    </div>
                </Col>
            </Grid>
        </>
    )
}

export default CalendarRegistration;
