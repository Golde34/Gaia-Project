import { Dialog, Transition } from "@headlessui/react";
import { Button, Col, DatePicker, Grid, TextInput } from "@tremor/react";
import { Fragment, useState } from "react";
import CheckBoxIcon from "../../components/icons/CheckboxIcon";
import RadioButtonIcon from "../../components/icons/RadioButtonIcon";
import { pushPriority } from "../../kernels/utils/field-utils";
import { useCreateScheduletaskDispatch } from "../../kernels/utils/write-dialog-api-requests";

export const CreateScheduleTaskDialog = (props) => {
    const userId = props.userId;
    let defaultDuration = 2;
    let [isOpen, setIsOpen] = useState(false);
    function closeModal() {
        setIsOpen(false);
    }
    function openModal() {
        setIsOpen(true);
    }

    const [scheduleTask] = useState({});
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [deadline, setDeadline] = useState(new Date());
    const [duration, setDuration] = useState(0);
    // Priority check boxes
    const [isHighPriority, setIsHighPriority] = useState(false);
    const [isMediumPriority, setIsMediumPriority] = useState(false);
    const [isLowPriority, setIsLowPriority] = useState(false);
    const [isStarPriority, setIsStarPriority] = useState(false);
    // Repeat check boxes
    const [isMonday, setIsMonday] = useState(false);
    const [isTuesday, setIsTuesday] = useState(false);
    const [isWednesday, setIsWednesday] = useState(false);
    const [isThursday, setIsThursday] = useState(false);
    const [isFriday, setIsFriday] = useState(false);
    const [isSaturday, setIsSaturday] = useState(false);
    const [isSunday, setIsSunday] = useState(false);

    const setObjectTask = (title, startDate, deadline, duration,
        isHighPriority, isMediumPriority, isLowPriority, isStarPriority,
        isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday) => {
        scheduleTask.userId = userId;
        scheduleTask.title = title;
        scheduleTask.startDate = startDate;
        scheduleTask.deadline = deadline;
        scheduleTask.duration = duration;
        scheduleTask.priority = pushPriority(isHighPriority, isMediumPriority, isLowPriority, isStarPriority);
        scheduleTask.repeat = [isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday];
        scheduleTask.isNotify = true;
        scheduleTask.activeStatus = 'ACTIVE';

        createScheduleTask(scheduleTask); 
    }

    const createScheduleTask = useCreateScheduletaskDispatch();

    return (
        <>
            <Button type='button' color='indigo' onClick={openModal}>
                Create new Schedule Task
            </Button>

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
                                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Create New Task
                                    </Dialog.Title>

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
                                        <p className="block text-md font-medium text-gray-700 mb-1">Repeat On</p>
                                        <div className="grid grid-cols-4 m-1">
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                    htmlFor="repeat-checkbox-monday" data-ripple-dark="true">
                                                    <input
                                                        id="repeat-checkbox-monday"
                                                        type="checkbox"
                                                        checked={isMonday}
                                                        onChange={() => setIsMonday(!isMonday)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-red-500 checked:bg-red-500 checked:before:bg-red-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">Monday</label>
                                            </div>
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                    htmlFor="repeat-checkbox-tuesday" data-ripple-dark="true">
                                                    <input
                                                        id="repeat-checkbox-tuesday"
                                                        type="checkbox"
                                                        checked={isTuesday}
                                                        onChange={() => setIsTuesday(!isTuesday)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-pink-500 checked:bg-pink-500 checked:before:bg-pink-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">Tuesday</label>
                                            </div>
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                    htmlFor="repeat-checkbox-wednesday" data-ripple-dark="true">
                                                    <input
                                                        id="repeat-checkbox-wednesday"
                                                        type="checkbox"
                                                        checked={isWednesday}
                                                        onChange={() => setIsWednesday(!isWednesday)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-green-500 checked:bg-green-500 checked:before:bg-green-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">Wednesday</label>
                                            </div>
                                            <div></div>
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                    htmlFor="repeat-checkbox-thursday" data-ripple-dark="true">
                                                    <input
                                                        id="repeat-checkbox-thursday"
                                                        type="checkbox"
                                                        checked={isThursday}
                                                        onChange={() => setIsThursday(!isThursday)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-yellow-500 checked:bg-yellow-500 checked:before:bg-yellow-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">Thursday</label>
                                            </div>
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                    htmlFor="repeat-checkbox-friday" data-ripple-dark="true">
                                                    <input
                                                        id="repeat-checkbox-friday"
                                                        type="checkbox"
                                                        checked={isFriday}
                                                        onChange={() => setIsFriday(!isFriday)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:bg-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">Friday</label>
                                            </div>
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                    htmlFor="repeat-checkbox-saturday" data-ripple-dark="true">
                                                    <input
                                                        id="repeat-checkbox-saturday"
                                                        type="checkbox"
                                                        checked={isSaturday}
                                                        onChange={() => setIsSaturday(!isSaturday)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">Saturday</label>
                                            </div>
                                            <div className="inline-flex items-center">
                                                <label className="relative flex items-center p-3 rounded-full cursor-pointer"

                                                    htmlFor="repeat-checkbox-sunday" data-ripple-dark="true">
                                                    <input
                                                        id="repeat-checkbox-sunday"
                                                        type="checkbox"
                                                        checked={isSunday}
                                                        onChange={() => setIsSunday(!isSunday)}
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-gray-500 checked:bg-gray-500 checked:before:bg-gray-500 hover:before:opacity-10"
                                                    />
                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                        <CheckBoxIcon />
                                                    </div>
                                                </label>
                                                <label className="text-sm text-gray-700">Sunday</label>
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
                                                setObjectTask(title, startDate, deadline, duration, 
                                                    isHighPriority, isMediumPriority, isLowPriority, isStarPriority, 
                                                    isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday);
                                                closeModal();
                                            }}
                                        >
                                            Create
                                        </button>
                                    </div>

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition >
        </>
    )
}