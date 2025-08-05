import { Button, Card, Col, Grid, Metric, Badge, Title, Text } from "@tremor/react";
import ChatComponent from "../chat_hub/ChatComponent";
import TaskRegistration from "./TaskRegistration";
import { motion } from "framer-motion";
import ChatComponent2 from "../chat_hub/ChatComponent2";
import { useMultiWS } from "../../kernels/context/MultiWSContext";
import { useEffect, useState } from "react";

const CalendarRegistration = ({ onNext, onSkip, onPrevious }) => {
    const { messages, isConnected, sendMessage } = useMultiWS();

    const [scheduleCalendarRegistration, setScheduleCalendarRegistration] = useState(null);
    const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'
    const [selectedDay, setSelectedDay] = useState('2'); // Default to Monday
    
    const dayNames = {
        '2': 'Thứ Hai',
        '3': 'Thứ Ba', 
        '4': 'Thứ Tư',
        '5': 'Thứ Năm',
        '6': 'Thứ Sáu'
    };

    const tagColors = {
        'work': 'blue',
        'eat': 'green', 
        'travel': 'yellow',
        'relax': 'purple',
        'sleep': 'gray'
    };

    useEffect(() => {
        const handleMessage = (message) => {
            const data = JSON.parse(message);
            if (data.type === 'calendar_registered') {
                setScheduleCalendarRegistration(data);
            }
        };
        messages.chat.forEach(handleMessage);
    }, [messages])

    const formatTime = (time) => {
        return time;
    };

    const renderDaySchedule = (dayKey) => {
        const daySchedule = scheduleCalendarRegistration?.data?.schedule?.[dayKey] || [];
        
        return (
            <div className="space-y-2">
                <Title className="text-lg font-semibold mb-3">{dayNames[dayKey]}</Title>
                {daySchedule.length > 0 ? (
                    daySchedule.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Badge color={tagColors[slot.tag] || 'gray'} size="sm">
                                    {slot.tag}
                                </Badge>
                                <Text>
                                    {formatTime(slot.start)} - {formatTime(slot.end)}
                                </Text>
                            </div>
                        </div>
                    ))
                ) : (
                    <Text className="text-gray-500 italic">No schedule calendar</Text>
                )}
            </div>
        );
    };

    const renderWeekSchedule = () => {
        return (
            <div className="space-y-4">
                {Object.keys(dayNames).map(dayKey => (
                    <Card key={dayKey} className="p-4">
                        {renderDaySchedule(dayKey)}
                    </Card>
                ))}
            </div>
        );
    };

    const renderTotals = () => {
        const totals = scheduleCalendarRegistration?.data?.totals || {};
        
        return (
            <Card className="p-4 mt-4">
                <Title className="text-lg font-semibold mb-3">Total time in week</Title>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(totals).map(([tag, hours]) => (
                        <div key={tag} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <Badge color={tagColors[tag] || 'gray'} size="sm">
                                {tag}
                            </Badge>
                            <Text className="font-medium">{hours}h</Text>
                        </div>
                    ))}
                </div>
            </Card>
        );
    };

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
                        {!scheduleCalendarRegistration ? (
                            <TaskRegistration />
                        ) : (
                            <div className="space-y-4">
                                {/* View Mode Controls */}
                                <div className="flex items-center justify-between mb-4">
                                    <Title className="text-xl">Lịch trình của bạn</Title>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant={viewMode === 'day' ? 'primary' : 'secondary'}
                                            size="sm"
                                            onClick={() => setViewMode('day')}
                                        >
                                            For days 
                                        </Button>
                                        <Button
                                            variant={viewMode === 'week' ? 'primary' : 'secondary'}
                                            size="sm"
                                            onClick={() => setViewMode('week')}
                                        >
                                            For weeks 
                                        </Button>
                                    </div>
                                </div>

                                {/* Day Selector for Day View */}
                                {viewMode === 'day' && (
                                    <div className="flex space-x-2 mb-4">
                                        {Object.entries(dayNames).map(([dayKey, dayName]) => (
                                            <Button
                                                key={dayKey}
                                                variant={selectedDay === dayKey ? 'primary' : 'light'}
                                                size="sm"
                                                onClick={() => setSelectedDay(dayKey)}
                                            >
                                                {dayName}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                {/* Schedule Display */}
                                <Card className="p-4">
                                    {viewMode === 'day' ? (
                                        renderDaySchedule(selectedDay)
                                    ) : (
                                        renderWeekSchedule()
                                    )}
                                </Card>

                                {/* Totals */}
                                {renderTotals()}
                            </div>
                        )}

                        {/* Default fallback card when no data */}
                        {scheduleCalendarRegistration && !scheduleCalendarRegistration.data && (
                            <Card className="p-4 bg-white shadow-md rounded-lg">
                                <div className="text-gray-500">No schedule calendar data</div>
                            </Card>
                        )}
                    </motion.div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={onPrevious}>
                            Back
                        </Button>
                        <Button variant="light" onClick={onSkip}>
                            Skip
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
