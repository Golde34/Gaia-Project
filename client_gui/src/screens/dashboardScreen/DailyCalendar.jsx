import { Badge, Button, Card, Col, Dialog, DialogPanel, Flex, Grid, Subtitle, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react"
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDailyCalendarAction, getDailyTasksAction, getTimeBubbleConfig } from "../../api/store/actions/schedule_plan/schedule-calendar.action";
import { priorityColor } from "../../kernels/utils/field-utils";
import { tagColors } from "../../kernels/utils/calendar";
import { DialogTitle, Transition, TransitionChild } from "@headlessui/react";

const DailyCalendar = () => {
    const dispatch = useDispatch();

    let [isOpen, setIsOpen] = useState(false);
    function closeModal() {
        setIsOpen(false)
    }

    function openModal(slot) {
        setIsOpen(true)
        setSelectedSlot(slot)
    }

    const [dailyTasksRequest, setDailyTasksRequest] = useState({ tasks: [] });
    const [dailyCalendar, setDailyCalendar] = useState([]);
    let [selectedSlot, setSelectedSlot] = useState(null);

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

    const handleRowClick = (taskId) => { };

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
                                        <Card key={slot.id} onClick={() => openModal(slot)}
                                            className="flex items-center justify-between p-3 rounded-lg mt-4 
                                                hover:cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300">
                                            <div className="flex-shrink-0">
                                                <Badge
                                                    color={tagColors[slot.tag] || 'gray'} size="sm"
                                                    className="px-2 py-1 rounded-full text-xs font-medium">
                                                    {slot.tag}
                                                </Badge>
                                            </div>

                                            <div className="flex-grow text-center mx-4">
                                                <Text className="text-sm font-semibold text-white truncate mt-1"> {slot.primaryTaskTitle}</Text>
                                            </div>

                                            <div className="flex-shrink-0">
                                                <Text className="text-sm text-gray-400">{slot.startTime} - {slot.endTime}</Text>
                                            </div>
                                        </Card>
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

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <DialogTitle
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-50"
                                    >
                                        Schedule Task Detail
                                    </DialogTitle>
                                    {selectedSlot && (
                                        <div className="mt-4">
                                            <Text>{selectedSlot.startTime} - {selectedSlot.endTime}</Text>
                                            {
                                                selectedSlot.primaryTaskId && selectedSlot.backupTaskId && (
                                                    <>
                                                        <Card className="mt-4 p-4" decoration="left" decorationColor="blue">
                                                            <a href={`/client-gui/task/detail/${selectedSlot.primaryTaskId}`}>
                                                                <Subtitle>Main task:</Subtitle>
                                                                <Text>{selectedSlot.primaryTaskTitle}</Text>
                                                            </a>
                                                        </Card>
                                                        <Card className="mt-4 p-4" decoration="left" decorationColor="red">
                                                            <a href={`/client-gui/task/detail/${selectedSlot.backupTaskId}`}>
                                                                <Subtitle>Backup task:</Subtitle>
                                                                <Text>{selectedSlot.backupTaskTitle}</Text>
                                                            </a>
                                                        </Card>
                                                    </>
                                                )
                                            }
                                        </div>
                                    )}
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            className="inline-flex rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => {
                                                closeModal();
                                            }}
                                        >
                                            OK
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default DailyCalendar;
