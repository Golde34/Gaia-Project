import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Col, Grid, Metric, Badge, Title, Text } from "@tremor/react";
import TaskRegistration from "./TaskRegistration";
import ChatComponent from "../chat_hub/ChatComponent";
import { useMultiWS } from "../../kernels/context/MultiWSContext";
import { getTimeBubbleConfig } from "../../api/store/actions/schedule_plan/schedule-calendar.action";
import { dayNames, tagColors } from "../../kernels/utils/calendar";
import { useRegisterScheduleCalendarDispatch } from "../../kernels/utils/write-dialog-api-requests";

const CalendarRegistration = ({ onNext, onSkip, onPrevious }) => {
    const dispatch = useDispatch();
    const { messages, isConnected, sendMessage } = useMultiWS();

    const [scheduleCalendarRegistration, setScheduleCalendarRegistration] = useState(null);
    const [selectedDay, setSelectedDay] = useState('1'); // Default to Monday
    const lastNotificationIndex = useRef(0);

    useEffect(() => {
        const notificationMessages = messages?.notification;
        if (!Array.isArray(notificationMessages)) return;

        const newMessages = notificationMessages.slice(lastNotificationIndex.current);
        newMessages.forEach((message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'register_calendar') {
                    setScheduleCalendarRegistration(data);
                    console.log("Received schedule calendar registration data: ", data);
                }
            } catch (error) {
                console.warn("Failed to parse notification message", error);
            }
        });

        lastNotificationIndex.current = notificationMessages.length;
    }, [messages.notification])

    const timeBubbleConfigList = useSelector((state) => state.getTimeBubbleConfig);
    const { loading, error, config } = timeBubbleConfigList;
    const didTimeBubbleConfig = useRef();
    const timeBubbleConfigs = useCallback(() => {
        dispatch(getTimeBubbleConfig())
    }, [dispatch])

    useEffect(() => {
        if (didTimeBubbleConfig.current) return;
        timeBubbleConfigs();
        didTimeBubbleConfig.current = true;
    }, [])
    useEffect(() => {
        if (!loading && !error && config) {
            const wrapped = { type: 'register_calendar', data: { response: config.data } };
            setScheduleCalendarRegistration(wrapped);
        }
    }, [loading, error, config]);

    const registerScheduleCalendar = useRegisterScheduleCalendarDispatch();
    const handleRegisterCalendar = () => {
        if (!scheduleCalendarRegistration) {
            alert("No schedule calendar data to register.");
            return;
        }
        registerScheduleCalendar(scheduleCalendarRegistration)
            .then((result) => {
                if (result && result.status === "success") {
                    alert("Registered calendar successfully.");
                } else {
                    alert("Registered calendar failed: " + (result?.message || "Unknown error"));
                }
            })
            .catch((error) => {
                alert("Register calendar failed: " + (error?.message || error));
            });
    }

    const renderDaySchedule = (dayKey) => {
        const daySchedule = scheduleCalendarRegistration?.data?.response?.schedule?.[dayKey] || [];

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
                                    {slot.start} - {slot.end}
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
                        <ChatComponent chatType={'register_calendar'} />
                    </div>
                </Col>
                <Col numColSpan={5}>
                    <Card className="mt-4">
                        {!scheduleCalendarRegistration ? (
                            <TaskRegistration />
                        ) : (
                            <div className="space-y-4">
                                <div className="flex flex-row items-center justify-between mb-4">
                                    <div className="flex flex-row space-x-2">
                                        {Object.entries(dayNames).map(([dayKey, dayName]) => (
                                            <Button
                                                key={dayKey}
                                                variant={selectedDay === dayKey ? 'secondary' : 'light'}
                                                size="sm"
                                                onClick={() => setSelectedDay(dayKey)}
                                                color="indigo"
                                            >
                                                {dayName}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="primary"
                                        color="indigo"
                                        onClick={handleRegisterCalendar}
                                    >
                                        Register Calendar
                                    </Button>
                                </div>

                                {/* Schedule Display */}
                                <Card className="p-4">
                                    {renderDaySchedule(selectedDay)}
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

                    </Card>
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
