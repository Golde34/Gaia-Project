import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Col, Grid, Metric, Badge, Title, Text } from "@tremor/react";
import ChatComponent from "../chat_hub/ChatComponent";
import { useMultiWS } from "../../kernels/context/MultiWSContext";
import { getTimeBubbleConfig } from "../../api/store/actions/schedule_plan/schedule-calendar.action";
import { dayNames, tagColors } from "../../kernels/utils/calendar";
import { useRegisterScheduleCalendarDispatch } from "../../kernels/utils/write-dialog-api-requests";
import { formatTime } from "../../kernels/utils/date-picker";

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
            const wrapped = { type: 'register_calendar', data: config.data };
            setScheduleCalendarRegistration(wrapped);
            const responseText = extractResponseText(wrapped);
            appendResponseToQueue(responseText);
        }
    }, [loading, error, config, appendResponseToQueue, extractResponseText]);

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

    const normalizeDaySchedule = (dayKey) => {
        const config = scheduleCalendarRegistration?.data;
        if (!config) return [];

        const mapConfig = config.timeBubbleConfig;
        console.log("Normalizing day schedule for day ", mapConfig);
        const listConfig = config.timeBubblesConfig;

        if (mapConfig && typeof mapConfig === "object" && !Array.isArray(mapConfig)) {
            return mapConfig?.[dayKey] ?? [];
        }

        if (Array.isArray(listConfig)) {
            return listConfig
                .filter((slot) => `${slot?.dayOfWeek}` === `${dayKey}`)
                .map((slot) => ({
                    tag: slot?.tag,
                    start: slot?.start ?? slot?.startTime,
                    end: slot?.end ?? slot?.endTime,
                }));
        }

        return [];
    };

    const renderDaySchedule = (dayKey) => {
        const daySchedule = normalizeDaySchedule(dayKey).map((slot) => ({
            tag: slot?.tag ?? "unknown",
            start: formatTime(slot?.start),
            end: formatTime(slot?.end),
        }));

        console.log("Rendering schedule for day ", dayKey, daySchedule);
        return (
            <div className="space-y-2">
                <Title className="text-lg font-semibold mb-3">{dayNames[dayKey]}</Title>
                {daySchedule.length > 0 ? (
                    daySchedule.map((slot, index) => (
                        <div key={`${slot.tag}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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

    const normalizeTotals = () => {
        const totals = scheduleCalendarRegistration?.data?.taskConfig;
        if (!totals) return [];

        if (typeof totals === "string") {
            return totals ? [{ tag: totals, hours: null, isMessage: true }] : [];
        }

        if (Array.isArray(totals)) {
            return totals
                .map((item, index) => ({
                    tag: item?.tag ?? `Item ${index + 1}`,
                    hours: item?.hours ?? item?.duration ?? item?.value ?? 0,
                }))
                .filter((item) => item.tag);
        }

        if (typeof totals === "object") {
            return Object.entries(totals).map(([tag, hours]) => ({
                tag,
                hours,
            }));
        }

        return [];
    };

    const renderTotals = () => {
        const normalizedTotals = normalizeTotals();
        if (!normalizedTotals.length) return null;

        const isMessageOnly = normalizedTotals.length === 1 && normalizedTotals[0].isMessage;

        return (
            <Card className="p-4 mt-4">
                <Title className="text-lg font-semibold mb-3">Total time in week</Title>
                {isMessageOnly ? (
                    <Text className="text-gray-600">{normalizedTotals[0].tag}</Text>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {normalizedTotals.map(({ tag, hours }) => (
                            <div key={tag} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <Badge color={tagColors[tag] || 'gray'} size="sm">
                                    {tag}
                                </Badge>
                                <Text className="font-medium">{hours}h</Text>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        );
    };

    return (
        <>
            <Metric className="text-2xl">
                Calendar Registration
            </Metric>
            <Grid numItems={9}>
                <Col numColSpan={4}>
                    <div className="m-4">
                        <ChatComponent
                            chatType={'register_calendar'}
                        />
                    </div>
                </Col>
                <Col numColSpan={5}>
                    <Card className="mt-4">
                        <div className="space-y-4">
                            <div className="flex flex-row space-x-5">
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

                            {/* Schedule Display */}
                            <Card className="p-4">
                                {renderDaySchedule(selectedDay)}
                            </Card>

                            {/* Totals */}
                            {renderTotals()}
                        </div>

                        {/* Default fallback card when no data */}
                        {scheduleCalendarRegistration && !scheduleCalendarRegistration.data && (
                            <Card className="p-4 bg-white shadow-md rounded-lg">
                                <div className="text-gray-500">No schedule calendar data</div>
                            </Card>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="primary"
                                color="indigo"
                                onClick={handleRegisterCalendar}
                                className="flex justify-end"
                            > Register Calendar
                            </Button>
                        </div>
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
