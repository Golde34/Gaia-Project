import { Dialog, Transition } from "@headlessui/react";
import { Input, Textarea } from "@material-tailwind/react";
import { Badge, BadgeDelta, Button, Card, Col, Flex, Grid, Subtitle, Text, Title } from "@tremor/react";
import { Fragment, useState } from "react";
import RadioButtonIcon from "../../components/icons/RadioButtonIcon";
import { useNavigate } from "react-router-dom";
import { convertTimestampToDate } from "../../kernels/utils/date-picker";
import { useDeleteComponentDispatch, useUpdateTaskInDialogDispatch } from "../../kernels/utils/dialog-api-requests";
import { MoveTask } from "./MoveTask";
import { DeleteDialog } from "../../components/subComponents/DeleteDialog";
import { priorityColor, statusColor } from "../../kernels/utils/field-utils";

export const TaskCard = (props) => {
    const task = props.task;
    const projectId = props.projectId;
    const groupTaskId = props.groupTaskId;

    const navigate = useNavigate();

    let [isOpen, setIsOpen] = useState(false);
    let [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    function closeModal() {
        setIsOpen(false)
    }
    function openModal() {
        setIsOpen(true)
    }

    const [title, setTitle] = useState(task.title);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const [description, setDescription] = useState(task.description);
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    // Set status frontend
    const [status, setStatus] = useState(task.status);

    const [taskForm] = useState({});

    const updateTask = useUpdateTaskInDialogDispatch();
    const setObjectTask = (title, description, status) => {
        taskForm.id = task.id;
        taskForm.title = title;
        taskForm.description = description;
        taskForm.status = status;
        updateTask(taskForm);
        window.location.reload();
    }

    const deleteTaskApi = useDeleteComponentDispatch();
    const deleteTask = (taskId) => {
        deleteTaskApi(taskId, "Task");
        window.location.reload();
    }

    return (
        <>
            <Card onClick={openModal} className="w-xs hover:cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300" decoration="left" decorationColor="indigo">
                <Grid numItems={6} className="gap-2">
                    <Col numColSpan={4}>
                        <Title className="text-2xl">{task.title}</Title>
                    </Col>
                    <Col numColSpan={2}>
                        <Flex className="space-x-2" justifyContent="center">
                            <Grid numItems={1}>
                                <Col numColSpan={1}>
                                    <Flex justifyContent="center">
                                        {
                                            task.priority.length === 0 ? (
                                                <Badge color="gray">No Priority</Badge>
                                            ) : (
                                                task.priority.map((priority) => (
                                                    <Badge key={`${task.id}-${priority}`} className="m-1" color={priorityColor(priority)}>{priority}</Badge>
                                                ))
                                            )
                                        }
                                    </Flex>
                                </Col>
                                <Col numColSpan={1}>
                                    <Flex justifyContent="center">
                                        <BadgeDelta deltaType={statusColor(task.status)}>{task.status}</BadgeDelta>
                                    </Flex>
                                </Col>
                            </Grid>
                        </Flex>
                    </Col>
                    <Col numColSpan={4}>
                        <Text className="text-sm">Start Date: {convertTimestampToDate(task.startDate)}</Text>
                        <Text className="text-sm">Deadline: {convertTimestampToDate(task.deadline)}</Text>
                    </Col>
                    <Col numColSpan={2}>
                        <Flex className="space-x-2" justifyContent="center">
                            <Subtitle className="text">Duration: {task.duration}h</Subtitle>
                        </Flex>
                    </Col>
                </Grid>
            </Card>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-3xl transform overflow-auto rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        <Flex>
                                            {isEditingTitle ? (
                                                <Input
                                                    type="text"
                                                    className="border-2 border-gray-200 p-2 rounded-md w-full"
                                                    value={title}
                                                    onChange={(e) => { setTitle(e.target.value) }}
                                                    onBlur={() => { setIsEditingTitle(!isEditingTitle) }}
                                                    autoFocus
                                                />
                                            ) : (
                                                <h1
                                                    className="text-lg cursor-pointer"
                                                    onClick={() => { setIsEditingTitle(!isEditingTitle) }}
                                                >
                                                    {title}
                                                </h1>
                                            )}
                                            <Button className="ms-2" color="indigo" onClick={() => navigate(`/task/detail/${task.id}`)}>
                                                Details
                                            </Button>
                                        </Flex>

                                    </Dialog.Title>
                                    <div className="mt-4">
                                        <label htmlFor="description" className="block text-md font-medium text-gray-700 mb-2">Description</label>
                                        <Textarea
                                            type="text"
                                            className="mt-3 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-32"
                                            value={description}
                                            onChange={(e) => { setDescription(e.target.value) }}
                                            onBlur={() => { setIsEditingDescription(!isEditingDescription) }}
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <p className="block text-md font-medium text-gray-700 mb-3">Deadline</p>
                                        <div className="grid grid-cols-1 m-2">
                                            <Flex justifyContent="start">
                                                <Flex justifyContent="start">
                                                    <p className="text-md font-medium text-gray-700 mb-3 me-10">{convertTimestampToDate(task.deadline)}</p>
                                                    <p className="text-md font-medium text-gray-700 mb-3">Duration: {task.duration}h</p>
                                                </Flex>
                                                <Flex justifyContent="end">
                                                    <Button className="ms-2" color="indigo" onClick={() => navigate(`/project/${task.id}/update-deadline`)}>
                                                        Update Deadline
                                                    </Button>
                                                </Flex>
                                            </Flex>

                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <p className="block text-md font-medium text-gray-700 mb-3">Status</p>
                                        <div className="grid grid-cols-2 m-2">
                                            <div className="inline-flex items-center">
                                                <label className="relative flex cursor-pointer items-center rounded-full p-3"
                                                    htmlFor="status-radio-todo" data-ripple-dark="true">
                                                    <input
                                                        id="status-radio-todo"
                                                        type="radio"
                                                        value="TODO"
                                                        checked={status === 'TODO'}
                                                        onChange={(e) => setStatus(e.target.value)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
                                                    />
                                                    <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-blue-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                                        <RadioButtonIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700" htmlFor="status-radio-todo">
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
                                                        checked={status === 'IN_PROGRESS'}
                                                        onChange={(e) => setStatus(e.target.value)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
                                                    />
                                                    <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-blue-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                                        <RadioButtonIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700" htmlFor="status-radio-doing">
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
                                                        checked={status === 'DONE'}
                                                        onChange={(e) => setStatus(e.target.value)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
                                                    />
                                                    <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-blue-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                                        <RadioButtonIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700" htmlFor="status-radio-done">
                                                    DONE
                                                </label>
                                            </div>
                                            <div className="inline-flex items-center">
                                                <label className="relative flex cursor-pointer items-center rounded-full p-3"
                                                    htmlFor="status-radio-pending" data-ripple-dark="true">
                                                    <input
                                                        id="status-radio-pending"
                                                        type="radio"
                                                        value="PENDING"
                                                        checked={status === 'PENDING'}
                                                        onChange={(e) => setStatus(e.target.value)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
                                                    />
                                                    <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-blue-500 opacity-0 transition-opacity peer-checked:opacity-100">
                                                        <RadioButtonIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700" htmlFor="status-radio-done">
                                                    PENDING
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <MoveTask taskId={task.id} projectId={projectId} groupTaskId={groupTaskId} />
                                    </div>

                                    <div className="mt-6">
                                        <p className="block text-md font-medium text-gray-700 mb-3">Sub Task (Do it later)</p>
                                    </div>

                                    <div className="mt-6">
                                        <p className="block text-md font-medium text-gray-700 mb-3">Comment (Do it later)</p>
                                    </div>

                                    <div className="mt-4 justify-end">
                                        <Flex justifyContent="end">
                                            <DeleteDialog open={isDeleteModalOpen} handleClose={() => setIsDeleteModalOpen(false)} handleDelete={() => deleteTask(task.id)} />
                                            <button
                                                type="button"
                                                className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
                                                onClick={() => {
                                                    archiveTask(task.id);
                                                    closeModal();
                                                }}
                                            >
                                                Archive
                                            </button>
                                            <button
                                                type="button"
                                                className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                onClick={() => {
                                                    setObjectTask(title, description, status)
                                                    closeModal();
                                                }}
                                            >
                                                Update
                                            </button>
                                            <button
                                                type="button"
                                                className='ml-2 inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'
                                                onClick={closeModal}
                                            >
                                                Cancel
                                            </button>
                                        </Flex>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition >
        </>
    );
};