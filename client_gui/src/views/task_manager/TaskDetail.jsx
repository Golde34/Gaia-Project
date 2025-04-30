import { useDispatch, useSelector } from "react-redux";
import Template from "../../components/template/Template"
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDetailTask } from "../../api/store/actions/task_manager/task.actions";
import { Badge, BadgeDelta, Button, Card, Col, DatePicker, Flex, Grid, Metric, Text, Textarea, TextInput } from "@tremor/react";
import MessageBox from "../../components/subComponents/MessageBox";
import RadioButtonIcon from "../../components/icons/RadioButtonIcon";
import CheckBoxIcon from "../../components/icons/CheckboxIcon";
import { priorityColor, pullPriority, pushPriority, statusColor } from "../../kernels/utils/field-utils";
import { useUpdateTaskDispatch } from "../../kernels/utils/write-dialog-api-requests";

function ContentArea() {
    const userId = 1;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const taskId = useParams().id;

    const taskDetail = useSelector((state) => state.taskDetail);
    const { loading, error, detail } = taskDetail;
    const didTaskDetailRef = useRef();

    const body = {
        userId: userId,
        taskId: taskId,
        taskDetailType: 'TASK_MANAGER'
    }
    const getTaskDetail = useCallback(() => {
        dispatch(getDetailTask(body));
    }, [dispatch, taskId]);

    useEffect(() => {
        if (didTaskDetailRef.current) return;
        getTaskDetail();
        didTaskDetailRef.current = true;
    }, [taskId]);

    const [title, setTitle] = useState(null);
    const [description, setDescription] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [deadline, setDeadline] = useState(null);
    const [duration, setDuration] = useState(null);
    const [status, setStatus] = useState(null);
    const priorities = pullPriority(detail?.priority);
    const [isHighPriority, setIsHighPriority] = useState(null);
    const [isMediumPriority, setIsMediumPriority] = useState(null);
    const [isLowPriority, setIsLowPriority] = useState(null);
    const [isStarPriority, setIsStarPriority] = useState(null);
    const [taskBatch, setTaskBatch] = useState(null);
    const [taskOrder, setTaskOrder] = useState(null);
    const [stopTime, setStopTime] = useState(null);

    const navigateProjectScreen = (projectId, groupTaskId) => {
        navigate(`/project/${projectId}`);
        localStorage.setItem("activeTab", groupTaskId);
    }

    const updateTask = useUpdateTaskDispatch();
    const setTaskObject = (title, description, startDate, deadline, duration, status, isHighPriority, isMediumPriority, isLowPriority, isStarPriority, taskOrder, stopTime) => {
        if (title === null && description === null && startDate === null && deadline === null && duration === null
            && status === null && isHighPriority === null && isMediumPriority === null && isLowPriority === null && isStarPriority === null
            && taskOrder === null && stopTime === null) {
            alert("Please update at least one field");
            return;
        }
        if (isHighPriority === null && isMediumPriority === null && isLowPriority === null && isStarPriority === null) {
            isHighPriority = priorities[0];
            isMediumPriority = priorities[1];
            isLowPriority = priorities[2];
            isStarPriority = priorities[3];
        }
        const priority = pushPriority(isHighPriority, isMediumPriority, isLowPriority, isStarPriority);
        const body = {
            userId: userId,
            taskId: taskId,
            title: title === null ? detail?.title : title,
            description: description === null ? detail?.description : description,
            startDate: startDate === null ? detail?.startDate : startDate,
            deadline: deadline === null ? detail?.deadline : deadline,
            duration: duration === null ? detail?.duration : Number(duration),
            status: status === null ? detail?.status : status,
            priority: priority,
            taskOrder: taskOrder === null ? detail?.taskOrder : Number(taskOrder),
            stopTime: stopTime === null ? detail?.stopTime : Number(stopTime),
            scheduleTaskId: detail?.scheduleTaskId === null ? 0 : detail?.scheduleTaskId,
        }
        updateTask(body);
        window.location.reload();
    }

    return (
        <>
            {loading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <MessageBox message={error} />
            ) : (
                <>
                    <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                        className="text-2xl font-bold text-gray-800"> Task Detail
                    </Metric>
                    <div className="grid md:grid-cols-3 grid-cols-1 w-full">
                        <div className="col-span-2">
                            <Card className="bg-indigo-100 shadow-lg">
                                <div className="mt-5">
                                    <label htmlFor="task-title" className="block text-md font-medium text-gray-200 mb-3">Task Title</label>
                                    <TextInput
                                        id="task-title"
                                        type="text"
                                        value={title == null ? detail?.title : title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Task Title"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label htmlFor="task-description" className="block text-md font-medium text-gray-200 mb-3">Description</label>
                                    <Textarea
                                        id="task-description"
                                        value={description == null ? detail?.description : description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Task Description"
                                    />
                                </div>

                                <div className="mt-6">
                                    <Grid numItems={6}>
                                        <Col numColSpan={2}>
                                            <p className="block text-md font-medium text-gray-200 mb-3">Start Date</p>
                                            <div className="grid grid-cols-1 me-1">
                                                <div className="inline-flex items-center ">
                                                    <DatePicker
                                                        className="max-w-md mx-auto"
                                                        onValueChange={setStartDate}
                                                        minDate={new Date()}
                                                        value={startDate == null ? detail?.startDate : startDate}
                                                        displayFormat="dd/MM/yyyy"
                                                    ></DatePicker>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col numColSpan={2}>
                                            <p className="block text-md font-medium text-gray-200 mb-3">Due Date</p>
                                            <div className="grid grid-cols-1 ms-1 me-1">
                                                <div className="inline-flex items-center ">
                                                    <DatePicker
                                                        className="max-w-md mx-auto"
                                                        onValueChange={setDeadline}
                                                        minDate={new Date()}
                                                        value={deadline == null ? detail?.deadline : deadline}
                                                        displayFormat="dd/MM/yyyy"
                                                    ></DatePicker>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col numColSpan={2}>
                                            <p className="block text-md font-medium text-gray-200 mb-3">Duration</p>
                                            <TextInput
                                                type="number"
                                                value={duration == null ? detail?.duration : duration}
                                                onChange={(event) => {
                                                    setDuration(event.target.value);
                                                }}
                                                className="mt-1 ms-1 rounded-md shadow-sm focus:border-blue-500 sm:text-sm"
                                                placeholder="Input working hours"
                                                error={(detail?.duration < 1)}
                                                errorMessage="Duration must be between 1 and 16 hours"
                                            />
                                        </Col>
                                    </Grid>
                                </div>

                                <div className="mt-2">
                                    <Grid numItems={6}>
                                        <Col numColSpan={2} className="me-1">
                                            <p className="block text-md font-medium text-gray-200 mb-3">Task Batch</p>
                                            <TextInput
                                                type="number"
                                                value={taskBatch == null ? detail?.taskBatch : taskBatch}
                                                onChange={(event) => {
                                                    setTaskBatch(event.target.value);
                                                }}
                                                className="mt-1 rounded-md shadow-sm focus:border-blue-500 sm:text-sm"
                                                placeholder="Input working hours"
                                                readOnly
                                            />
                                        </Col>
                                        <Col numColSpan={2} className="ms-1 me-1">
                                            <p className="block text-md font-medium text-gray-200 mb-3">Task Order</p>
                                            <TextInput
                                                type="number"
                                                value={taskOrder == null ? detail?.taskOrder : taskOrder}
                                                onChange={(event) => {
                                                    setTaskOrder(event.target.value);
                                                }}
                                                className="mt-1 rounded-md shadow-sm focus:border-blue-500 sm:text-sm"
                                                placeholder="Input working hours"
                                            />
                                        </Col>
                                        <Col numColSpan={2} className="ms-1">
                                            <p className="block text-md font-medium text-gray-200 mb-3">Stop Time</p>
                                            <TextInput
                                                type="number"
                                                value={stopTime == null ? detail?.stopTime : stopTime}
                                                onChange={(event) => {
                                                    setStopTime(event.target.value);
                                                }}
                                                className="mt-1 rounded-md shadow-sm focus:border-blue-500 sm:text-sm"
                                                placeholder="Input working hours"
                                            />
                                        </Col>
                                    </Grid>
                                </div>

                                <div className="mt-6">
                                    <p className="block text-md font-medium text-gray-200 mb-1">Priority</p>
                                    <div className="grid grid-cols-4 m-1">
                                        <div className="inline-flex items-center">
                                            <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                htmlFor="priority-checkbox-high" data-ripple-dark="true">
                                                <input
                                                    id="priority-checkbox-high"
                                                    type="checkbox"
                                                    checked={isHighPriority == null ? priorities[0] : isHighPriority}
                                                    onChange={() => setIsHighPriority(!isHighPriority)}
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-red-500 checked:bg-red-500 checked:before:bg-red-500 hover:before:opacity-10"
                                                />
                                                <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                    <CheckBoxIcon />
                                                </div>
                                            </label>
                                            <label className="text-sm text-gray-200">High</label>
                                        </div>
                                        <div className="inline-flex items-center">
                                            <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                htmlFor="priority-checkbox-medium" data-ripple-dark="true">
                                                <input
                                                    id="priority-checkbox-medium"
                                                    type="checkbox"
                                                    checked={isMediumPriority == null ? priorities[1] : isMediumPriority}
                                                    onChange={() => setIsMediumPriority(!isMediumPriority)}
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-pink-500 checked:bg-pink-500 checked:before:bg-pink-500 hover:before:opacity-10"
                                                />
                                                <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                    <CheckBoxIcon />
                                                </div>
                                            </label>
                                            <label className="text-sm text-gray-200">Medium</label>
                                        </div>
                                        <div className="inline-flex items-center">
                                            <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                htmlFor="priority-checkbox-low" data-ripple-dark="true">
                                                <input
                                                    id="priority-checkbox-low"
                                                    type="checkbox"
                                                    checked={isLowPriority == null ? priorities[2] : isLowPriority}
                                                    onChange={() => setIsLowPriority(!isLowPriority)}
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-green-500 checked:bg-green-500 checked:before:bg-green-500 hover:before:opacity-10"
                                                />
                                                <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                    <CheckBoxIcon />
                                                </div>
                                            </label>
                                            <label className="text-sm text-gray-200">Low</label>
                                        </div>
                                        <div className="inline-flex items-center">
                                            <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                htmlFor="priority-checkbox-star" data-ripple-dark="true">
                                                <input
                                                    id="priority-checkbox-star"
                                                    type="checkbox"
                                                    checked={isStarPriority == null ? priorities[3] : isStarPriority}
                                                    onChange={() => setIsStarPriority(!isStarPriority)}
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-yellow-500 checked:bg-yellow-500 checked:before:bg-yellow-500 hover:before:opacity-10"
                                                />
                                                <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                    <CheckBoxIcon />
                                                </div>
                                            </label>
                                            <label className="text-sm text-gray-200">Star</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <p className="block text-md font-medium text-gray-200 mb-1">Status</p>
                                    <div className="grid grid-cols-3 m-1">
                                        <div className="inline-flex items-center">
                                            <label className="relative flex cursor-pointer items-center rounded-full p-3"
                                                htmlFor="status-radio-todo" data-ripple-dark="true">
                                                <input
                                                    id="status-radio-todo"
                                                    type="radio"
                                                    value="TODO"
                                                    checked={status == null ? detail?.status === 'TODO' : status === 'TODO'}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
                                                />
                                                <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-blue-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                                    <RadioButtonIcon />
                                                </div>
                                            </label>
                                            <label className="text-sm text-gray-200" htmlFor="status-radio-todo">
                                                TO DO
                                            </label>
                                        </div>
                                        <div className="inline-flex items-center">
                                            <label className="relative flex cursor-pointer items-center rounded-full p-3"
                                                htmlFor="status-radio-doing" data-ripple-dark="true">
                                                <input
                                                    id="status-radio-doing"
                                                    type="radio"
                                                    value="IN_PROGRESS"
                                                    checked={status == null ? detail?.status === 'IN_PROGRESS' : status === 'IN_PROGRESS'}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
                                                />
                                                <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-blue-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                                    <RadioButtonIcon />
                                                </div>
                                            </label>
                                            <label className="text-sm text-gray-200" htmlFor="status-radio-doing">
                                                IN PROGRESS
                                            </label>
                                        </div>
                                        <div className="inline-flex items-center">
                                            <label className="relative flex cursor-pointer items-center rounded-full p-3"
                                                htmlFor="status-radio-done" data-ripple-dark="true">
                                                <input
                                                    id="status-radio-done"
                                                    type="radio"
                                                    value="DONE"
                                                    checked={status == null ? detail?.status === 'DONE' : status === 'DONE'}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
                                                />
                                                <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-blue-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                                    <RadioButtonIcon />
                                                </div>
                                            </label>
                                            <label className="text-sm text-gray-200" htmlFor="status-radio-done">
                                                DONE
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <Flex justifyContent="end">
                                    <Button className="mt-4"
                                        variant="primary" color="indigo"
                                        onClick={() => {
                                            setTaskObject(title, description, startDate, deadline, duration, status,
                                                isHighPriority, isMediumPriority, isLowPriority, isStarPriority,
                                                taskOrder, stopTime);
                                        }
                                        }>
                                        Update Task
                                    </Button>
                                </Flex>
                            </Card >

                        </div>
                        <div className="ms-5 w-full">
                            <Card>
                                <div className="mt-5">
                                    <label htmlFor="project" className="block text-md font-medium text-gray-200 mb-3">Project</label>
                                    <Flex justifyContent="center" className="mb-3">
                                        <button onClick={() => { navigateProjectScreen(detail?.projectId, detail?.groupTaskId) }} className="mb-7">
                                            <Card className="w-full" decoration="top" decorationColor={detail?.projectColor}>
                                                <Grid numItems={2}>
                                                    <Col numColSpan={1}>
                                                        <Metric>{detail?.projectName}</Metric>
                                                    </Col>
                                                    <Col numColSpan={1}>
                                                        <Flex justifyContent="end">
                                                            <BadgeDelta className="ms-1 mt-1" deltaType={statusColor(detail?.projectStatus)}>{detail?.projectStatus}</BadgeDelta>
                                                        </Flex>
                                                    </Col>
                                                </Grid>
                                            </Card>
                                        </button>
                                    </Flex>
                                    <label htmlFor="group-task" className="block text-md font-medium text-gray-200 mb-3">Group Task</label>
                                    <Flex justifyContent="center" >
                                        <button onClick={() => { navigateProjectScreen(detail?.projectId, detail?.groupTaskId) }} className="mb-7">
                                            <Card className="w-full" decoration="top" decorationColor="indigo" style={{ maxWidth: '325px', maxHeight: '200px', minHeight: '160px', minWidth: '325px' }}>
                                                <Metric>{detail?.groupTaskTitle}</Metric>
                                                <Grid numItems={2} className="mt-3">
                                                    <Col numColSpan={1}>
                                                        <Flex justifyContent="start">
                                                            {detail?.groupTaskPriority.map((priority) => (
                                                                <Badge key={`${detail?.groupTaskId}-${priority}`} className="me-1 mt-1" color={priorityColor(priority)}>{priority}</Badge>
                                                            ))}
                                                        </Flex>
                                                    </Col>
                                                    <Col numColSpan={1}>
                                                        <Flex justifyContent="end">
                                                            <BadgeDelta className="ms-1 mt-1" deltaType={statusColor(detail?.groupTaskStatus)}>{detail?.groupTaskStatus}</BadgeDelta>
                                                        </Flex>
                                                    </Col>
                                                </Grid>

                                                <Text className="line-clamp-3 mt-3"> {detail?.groupTaskDescription} </Text>
                                            </Card>
                                        </button>
                                    </Flex>
                                </div>
                            </Card>
                            <Card className="mt-4">
                                <div className="mt-5">
                                    <label htmlFor="new-feature" className="block text-md font-medium text-gray-200 mb-3">New feature</label>
                                    <p className="text-gray-700">Do you want to check my new feature?</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

const TaskDetail = () => {
    return (
        <Template>
            <ContentArea />
        </Template>
    )
}

export default TaskDetail;
