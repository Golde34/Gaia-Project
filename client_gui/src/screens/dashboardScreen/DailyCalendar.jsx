import { Badge, Button, Card, Col, Flex, Grid, Subtitle, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react"
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDailyTasksAction, getTimeBubbleConfig } from "../../api/store/actions/schedule_plan/schedule-calendar.action";
import { priorityColor } from "../../kernels/utils/field-utils";
import { userGenerateDailyCalendarDispatch } from "../../kernels/utils/write-dialog-api-requests";

const DailyCalendar = () => {
    const dispatch = useDispatch();

    const timeBubbleConfigList = useSelector((state) => state.getTimeBubbleConfig);
    const { config: timeBubbleConfig, loading: loadingBubble, error: errorBubble } = timeBubbleConfigList;
    const didFetch = useRef(false);
    const fetchStatus = useCallback(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        dispatch(getTimeBubbleConfig());
    }, [dispatch]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const dailyTaskList = useSelector((state) => state.getDailyTasks);
    const { dailyTasks: dailyTasks, loading: loadingTasks, error: errorTasks } = dailyTaskList;
    const didDailyTaskListRef = useRef();
    const fetchDailyTaskList = useCallback(() => {
        if (didDailyTaskListRef.current) return;
        didDailyTaskListRef.current = true;
        dispatch(getDailyTasksAction());
    }, [dispatch]);

    useEffect(() => {
        fetchDailyTaskList();
    }, [fetchDailyTaskList]);

    if (loadingBubble || loadingTasks) {
        return <div>Loading...</div>;
    }

    if (errorBubble) {
        return <div>Error: {errorBubble}</div>;
    }
    if (errorTasks) {
        return <div>Error: {errorTasks}</div>;
    }

    const handleAutoGenerateCalendar = (dailyTasks) =>{
        generateDailyCalendar(dailyTasks);
    }
    const generateDailyCalendar = userGenerateDailyCalendarDispatch();

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
                                <Button color="indigo" variant="primary" onClick={handleAutoGenerateCalendar(dailyTasks)}>
                                    Auto generate calendar
                                </Button>
                            </Flex>
                        </Col>
                        <Col numColSpan={12}>
                            <Card className="mt-4">
                                <Title>Do you want to include these tasks in your calendar?</Title>
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
                                        {dailyTasks.tasks.map((task) => (
                                            <TableRow key={task.id}
                                                onClick={() => handleRowClick(task.taskId)}
                                                className="hover:bg-gray-100 cursor-pointer transition-colors">
                                                <TableCell>{task.title}</TableCell>
                                                <TableCell>
                                                    <Text>{task.duration} Hours</Text>
                                                </TableCell>
                                                <TableCell>
                                                    <Text>
                                                        {task.priority.map((priority) => (
                                                            <Badge key={`${task.id}-${priority}`} className="me-1 mt-1" color={priorityColor(priority)}>{priority}</Badge>
                                                        ))}
                                                    </Text>
                                                </TableCell>
                                                <TableCell>
                                                    <Button color="red" variant="secondary">
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </Col>
                    </>
                ) : (
                    <a href="#">
                        <Subtitle className="text-gray-400 font-medium underline">
                            You must create a calendar config first to use this feature
                        </Subtitle>
                    </a>
                )
                }
            </Grid >
        </>
    )
}

export default DailyCalendar;