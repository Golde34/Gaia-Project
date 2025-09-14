import { Badge, Button, Card, Col, Flex, Grid, Subtitle, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react"
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDailyCalendarAction, getDailyTasksAction, getTimeBubbleConfig } from "../../api/store/actions/schedule_plan/schedule-calendar.action";
import { priorityColor } from "../../kernels/utils/field-utils";
import ScheduleDayBubble from "./ScheduleDayBubble";
import { getActiveTaskBatch } from "../../api/store/actions/schedule_plan/schedule-task.action";

const DailyCalendar = () => {
    const dispatch = useDispatch();

    const [dailyTasksRequest, setDailyTasksRequest] = useState({ tasks: [] });
    const [dailyCalendar, setDailyCalendar] = useState([]);
    const [reload, setReload] = useState(false);

    const timeBubbleConfigList = useSelector((state) => state.getTimeBubbleConfig);
    const { config: timeBubbleConfig, loading: loadingBubble, error: errorBubble } = timeBubbleConfigList;
    const didFetch = useRef(false);
    const fetchStatus = useCallback(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        dispatch(getTimeBubbleConfig());
    }, [dispatch]);

    const { loading: loadingActiveBatch, error: errorActiveBatch, activeTaskBatch } = useSelector((state) => state.activeTaskBatch);
    const didActiveTaskBatch = useRef();
    useEffect(() => {
        if (didActiveTaskBatch.current) return;
        dispatch(getActiveTaskBatch());
        didActiveTaskBatch.current = true;
    }, [dispatch]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const dailyTaskList = useSelector((state) => state.getDailyTasks);
    const { dailyTasks, loading: loadingTasks, error: errorTasks } = dailyTaskList;

    const didDailyTaskListRef = useRef(false);
    const fetchDailyTaskList = useCallback(() => {
        if (didDailyTaskListRef.current) return;
        didDailyTaskListRef.current = true;
        dispatch(getDailyTasksAction());
    }, [dispatch]);

    useEffect(() => {
        fetchDailyTaskList();
    }, [fetchDailyTaskList]);

    useEffect(() => {
        if (reload) {
            dispatch(getDailyTasksAction());
            setReload(false);
        }
    }, [reload, dispatch]);

    useEffect(() => {
        if (dailyTasks?.tasks &&
            (dailyCalendar === null || dailyCalendar === undefined)) {
            setDailyTasksRequest(dailyTasks);
        }
        if (dailyTasks?.dailyCalendar) {
            setDailyCalendar(dailyTasks.dailyCalendar);
        }
    }, [dailyTasks]);

    if (loadingBubble || loadingTasks) return <div>Loading...</div>;
    if (errorBubble) return <div>Error: {errorBubble}</div>;
    if (errorTasks) return <div>Error: {errorTasks}</div>;

    const handleDeleteTask = (taskId) => {
        setDailyTasksRequest(prev => ({
            ...prev,
            tasks: (prev?.tasks || []).filter(t => (t.taskId ?? t.id) !== taskId),
        }));
    };

    const handleAutoGenerateCalendar = async (request) => {
        const source = request ?? dailyTasks ?? dailyTasksRequest ?? { tasks: [] };
        const payload = { ...source };
        if (!payload.tasks?.length && !payload.dailyCalendar?.length) return;

        try {
            const data = await dispatch(createDailyCalendarAction(payload.tasks));
            setDailyCalendar(Array.isArray(data?.dailyCalendar) ? [...data.dailyCalendar] : []);
            setDailyTasksRequest({})
        } catch (err) {
            console.error("Error:", err.message);
        }
    };

    return (
        <>
            <Grid numItems={12}>
                <Col numColSpan={6}>
                    <Flex className="justify-between items-center mt-4">
                        <Title className="text-lg">Your Daily Calendar</Title>
                    </Flex>
                </Col>
                {timeBubbleConfig ? (
                    <>
                        <Col numColSpan={6}>
                            <Flex className="justify-end items-center mt-4">
                                <Button
                                    color="indigo"
                                    variant="primary"
                                    onClick={() => handleAutoGenerateCalendar()}
                                >
                                    Auto generate calendar
                                </Button>
                            </Flex>
                        </Col>
                        {dailyTasksRequest?.tasks && dailyTasksRequest?.tasks?.length > 0 && (
                            <Col numColSpan={12}>
                                <Card className="mt-4">
                                    <Table className="mt-5">
                                        <TableHead>
                                            <TableRow>
                                                <TableHeaderCell>Name</TableHeaderCell>
                                                <TableHeaderCell>Duration</TableHeaderCell>
                                                <TableHeaderCell>Priority</TableHeaderCell>
                                                <TableHeaderCell>Delete in daily tasks</TableHeaderCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(dailyTasksRequest?.tasks ?? []).map((task) => (
                                                <TableRow
                                                    key={task.id ?? task.taskId}
                                                    onClick={() => handleRowClick?.(task.taskId ?? task.id)}
                                                    className="hover:bg-gray-100 cursor-pointer transition-colors"
                                                >
                                                    <TableCell>{task.title}</TableCell>
                                                    <TableCell>
                                                        <Text>{task.duration} Hours</Text>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Text>
                                                            {(task.priority ?? []).map((p) => (
                                                                <Badge key={`${task.id ?? task.taskId}-${p}`} className="me-1 mt-1" color={priorityColor(p)}>
                                                                    {p}
                                                                </Badge>
                                                            ))}
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            color="red"
                                                            variant="secondary"
                                                            onClick={(e) => {
                                                                e.stopPropagation?.();
                                                                handleDeleteTask(task.taskId ?? task.id);
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </Col>
                        )}
                        {
                            dailyCalendar && dailyCalendar?.length > 0 && (
                                dailyCalendar ?? []).map((slot) => (
                                    <Col numColSpan={12} key={slot.id}>
                                        <ScheduleDayBubble
                                            slot={slot}
                                            scheduleTaskList={activeTaskBatch}
                                            onReload={() => setReload(true)}
                                        />
                                    </Col>
                                ))}
                    </>
                ) : (
                    <a href="#">
                        <Subtitle className="text-gray-400 font-medium underline">
                            You must create a calendar config first to use this feature
                        </Subtitle>
                    </a>
                )}
            </Grid>
        </>
    );
};

export default DailyCalendar;
