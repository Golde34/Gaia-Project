import { useCreateTaskDispatch, useGenerateTaskFromScratchDispatch } from "../../kernels/utils/write-dialog-api-requests";
import { Transition, Dialog, DialogPanel, DialogTitle, TransitionChild } from "@headlessui/react";
import { Textarea } from "@material-tailwind/react";
import { Button, Col, DatePicker, Grid, TextInput } from "@tremor/react";
import { Fragment, useState } from "react";
import RadioButtonIcon from "../../components/icons/RadioButtonIcon";
import CheckBoxIcon from "../../components/icons/CheckboxIcon";
import { pushPriority } from "../../kernels/utils/field-utils";

export const CreateTaskDialog = (props) => {
    const userId = "1";
    const projectId = props.projectId;
    const groupTaskId = props.groupTaskId;

    let defaultDuration = 2;
    let [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        setIsOpen(false);
    }
    function openModal() {
        setIsOpen(true);
    }

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [deadline, setDeadline] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [duration, setDuration] = useState(0);

    const [task] = useState({});

    // Priority Checboxes
    const [isHighPriority, setIsHighPriority] = useState(false);
    const [isMediumPriority, setIsMediumPriority] = useState(false);
    const [isLowPriority, setIsLowPriority] = useState(false);
    const [isStarPriority, setIsStarPriority] = useState(false);

    const generateTaskFromScratch = useGenerateTaskFromScratchDispatch();
    const createTask = useCreateTaskDispatch();

    const setObjectTask = (title, description, status, startDate, deadline, duration, isHighPriority, isMediumPriority, isLowPriority, isStarPriority) => {
        task.title = title;
        task.description = description;
        task.priority = pushPriority(isHighPriority, isMediumPriority, isLowPriority, isStarPriority);
        task.status = status;
        task.deadline = deadline;
        task.startDate = startDate;
        if (duration === 0) {
            task.duration = defaultDuration.toString();
        } else {
            task.duration = duration.toString();
        }
        task.activeStatus = 'ACTIVE';
        task.userId = Number(userId);
        initiateTaskDispatch(projectId, task);
        
        window.location.reload();
    }

    const initiateTaskDispatch = (projectId, task) => {
        if (projectId === null || projectId === undefined) {
            task.groupTaskId = groupTaskId;
            createTask(task);
            localStorage.setItem("activeTab", groupTaskId);
        } else {
            task.projectId = projectId;
            generateTaskFromScratch(task);
            localStorage.setItem("activeTab", 'none');
        }
    }

    return (
        <>
            <Button onClick={openModal} id='create-new-task'
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create New Task
            </Button>

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
                                <DialogPanel className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <DialogTitle
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Create New Task
                                    </DialogTitle>

                                    <div className="mt-5">
                                        <label htmlFor="task-title" className="block text-md font-medium text-gray-700 mb-3">Task Title</label>
                                        <TextInput
                                            id="task-title"
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Task Title"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label htmlFor="task-description" className="block text-md font-medium text-gray-700 mb-3">Description</label>
                                        <Textarea
                                            id="task-description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Task Description"
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <Grid numItems={6}>
                                            <Col numColSpan={3}>
                                                <p className="block text-md font-medium text-gray-700 mb-3">Start Date</p>
                                                <div className="grid grid-cols-1 m-1">
                                                    <div className="inline-flex items-center bg-white">
                                                        <DatePicker
                                                            className="max-w-md mx-auto"
                                                            onValueChange={setStartDate}
                                                            minDate={new Date()}
                                                            value={startDate}
                                                            displayFormat="dd/MM/yyyy"
                                                        ></DatePicker>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col numColSpan={3}>
                                                <p className="block text-md font-medium text-gray-700 mb-3">Due Date</p>
                                                <div className="grid grid-cols-1 m-1">
                                                    <div className="inline-flex items-center bg-white">
                                                        <DatePicker
                                                            className="max-w-md mx-auto"
                                                            onValueChange={setDeadline}
                                                            minDate={new Date()}
                                                            value={deadline}
                                                            displayFormat="dd/MM/yyyy"
                                                        ></DatePicker>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Grid>
                                    </div>

                                    <div className="mt-2">
                                        <p className="block text-md font-medium text-gray-700 mb-3">Duration</p>
                                        <TextInput
                                            type="number"
                                            value={duration === 0 ? defaultDuration : duration}
                                            onChange={(event) => {
                                                    setDuration(event.target.value);
                                            }}
                                            className="mt-1 rounded-md shadow-sm focus:border-blue-500 sm:text-sm"
                                            placeholder="Input working hours"
                                            error={(duration < 1 || duration > 16) && defaultDuration !== 2}
                                            errorMessage="Duration must be between 1 and 16 hours"
                                        />
                                    </div>

                                    <div className="mt-8">
                                        <p className="block text-md font-medium text-gray-700 mb-1">Priority</p>
                                        <div className="grid grid-cols-4 m-1">
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                    htmlFor="priority-checkbox-high" data-ripple-dark="true">
                                                    <input
                                                        id="priority-checkbox-high"
                                                        type="checkbox"
                                                        checked={isHighPriority}
                                                        onChange={() => setIsHighPriority(!isHighPriority)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-red-500 checked:bg-red-500 checked:before:bg-red-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">High</label>
                                            </div>
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                    htmlFor="priority-checkbox-medium" data-ripple-dark="true">
                                                    <input
                                                        id="priority-checkbox-medium"
                                                        type="checkbox"
                                                        checked={isMediumPriority}
                                                        onChange={() => setIsMediumPriority(!isMediumPriority)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-pink-500 checked:bg-pink-500 checked:before:bg-pink-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">Medium</label>
                                            </div>
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                    htmlFor="priority-checkbox-low" data-ripple-dark="true">
                                                    <input
                                                        id="priority-checkbox-low"
                                                        type="checkbox"
                                                        checked={isLowPriority}
                                                        onChange={() => setIsLowPriority(!isLowPriority)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-green-500 checked:bg-green-500 checked:before:bg-green-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">Low</label>
                                            </div>
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                    htmlFor="priority-checkbox-star" data-ripple-dark="true">
                                                    <input
                                                        id="priority-checkbox-star"
                                                        type="checkbox"
                                                        checked={isStarPriority}
                                                        onChange={() => setIsStarPriority(!isStarPriority)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-yellow-500 checked:bg-yellow-500 checked:before:bg-yellow-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">Star</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <p className="block text-md font-medium text-gray-700 mb-1">Status</p>
                                        <div className="grid grid-cols-3 m-1">
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
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => {
                                                setObjectTask(title, description, status, startDate, deadline, duration, isHighPriority, isMediumPriority, isLowPriority, isStarPriority);
                                                closeModal();
                                            }}
                                        >
                                            Create
                                        </button>
                                    </div>

                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition >
        </>
    )
}