import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Dialog, DialogPanel, DialogTitle, Input, Transition, TransitionChild } from "@headlessui/react";
import { Button, Col, Grid } from "@tremor/react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import CheckBoxIcon from "../../components/icons/CheckboxIcon";
import { pushPriority, pushRepeat } from "../../kernels/utils/field-utils";
import { useCreateScheduletaskDispatch } from "../../kernels/utils/write-dialog-api-requests";
import { calculateDuration } from "../../kernels/utils/date-picker";
import { useDispatch, useSelector } from "react-redux";
import { getProjects } from "../../api/store/actions/task_manager/project.actions";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import MessageBox from "../../components/subComponents/MessageBox";
import { getGroupTaskList } from "../../api/store/actions/task_manager/group-task.actions";
import { useNavigate } from "react-router-dom";

export const CreateScheduleGroupDialog = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    let [isOpen, setIsOpen] = useState(false);
    function closeModal() {
        setIsOpen(false);
    }
    function openModal() {
        setIsOpen(true);
    }

    const [scheduleTask] = useState({});
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(0);
    const [startHour, setStartHour] = useState('');
    const [endHour, setEndHour] = useState('');
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

    const setObjectTask = (title, duration, startHour, endHour,
        isHighPriority, isMediumPriority, isLowPriority, isStarPriority,
        isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday) => {
        scheduleTask.title = title;
        scheduleTask.projectId = selectedProject.id;
        scheduleTask.groupTaskId = selectedGroupTask.id;
        scheduleTask.duration = Number(duration);
        scheduleTask.startHour = startHour;
        scheduleTask.endHour = endHour;
        scheduleTask.priority = pushPriority(isHighPriority, isMediumPriority, isLowPriority, isStarPriority);
        scheduleTask.repeat = pushRepeat(isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday);
        scheduleTask.isNotify = true;
        scheduleTask.activeStatus = 'ACTIVE';
        
        createScheduleTask(scheduleTask);
        window.location.reload();
    }

    const createScheduleTask = useCreateScheduletaskDispatch();

    useEffect(() => {
        if (startHour && endHour) {
            setDuration(calculateDuration(startHour, endHour));
        }
    })

    const listProject = useSelector((state) => state.projectList);
    const { loading, error, projects } = listProject;
    const getListProjects = useCallback(() => {
        dispatch(getProjects());
    }, [dispatch]);
    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getListProjects();
        }, 200);
    }, []);

    const [selectedProject, setSelectedProject] = useState('');
    const [queryProject, setQueryProject] = useState('');
    const filterProjects = queryProject === ''
        ? projects
        : projects.filter((project) => project.name.toLowerCase().includes(queryProject.toLowerCase()));

    const listGroupTasks = useSelector((state) => state.groupTaskList);
    const { groupTaskLoading, groupTaskError, groupTasks } = listGroupTasks;

    const getGroupTasks = useCallback(() => {
        dispatch(getGroupTaskList(selectedProject.id));
    }, [dispatch, selectedProject.id]);

    useEffect(() => {
        if (selectedProject) {
            getGroupTasks();
        }
    }, [selectedProject.id]);

    const [selectedGroupTask, setSelectedGroupTask] = useState('');
    const [queryGroupTask, setQueryGroupTask] = useState('');
    const filterGroupTasks = queryGroupTask === ''
        ? groupTasks
        : groupTasks.filter((groupTask) => groupTask.title.toLowerCase().includes(queryGroupTask.toLowerCase()));

    return (
        <>
            <Button type='button' color='indigo' onClick={openModal}>
                Create new Schedule Group
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
                                        Create New Schedule Group
                                    </DialogTitle>

                                    <div className="mt-5">
                                        <label htmlFor="task-title" className="block text-md font-medium text-gray-700 mb-3">Task Title</label>
                                        <Input
                                            id="task-title"
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 bg-indigo-50"
                                        />
                                    </div>

                                    {loading ? (
                                        <p>Loading...</p>
                                    ) : error ? (
                                        <MessageBox message={error}></MessageBox>
                                    ) : projects ? (
                                        <>
                                            <label
                                                htmlFor="project"
                                                className="flex items-center justify-between text-md font-medium text-gray-700 mt-4 mb-3"
                                            >
                                                Project
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                                        onClick={() => navigate(`/project`)}
                                                    >
                                                        Create Project
                                                    </button>
                                                </div>
                                            </label>
                                            <Combobox value={selectedProject} onChange={(value) => setSelectedProject(value)} onClose={() => setQueryProject('')}>
                                                <div className="relative">
                                                    <ComboboxInput
                                                        className={clsx(
                                                            "mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                                                            "py-2 px-3 bg-indigo-50"
                                                        )}
                                                        displayValue={(project) => project?.name}
                                                        onChange={(event) => setQueryProject(event.target.value)}
                                                    />
                                                    <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                                                        <ChevronDownIcon className="size-4 fill-black/60 group-data-[hover]:fill-black" />
                                                    </ComboboxButton>
                                                </div>
                                                <ComboboxOptions
                                                    anchor="bottom"
                                                    transition
                                                    className={clsx(
                                                        'w-[var(--input-width)] rounded-xl border border-white/5 bg-white p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
                                                        'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
                                                    )}
                                                >
                                                    {filterProjects.map((project) => (
                                                        <ComboboxOption
                                                            key={project.id}
                                                            value={project}
                                                            className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                                                        >
                                                            <CheckIcon className="invisible size-4 group-data-[selected]:visible" />
                                                            {project.name}
                                                        </ComboboxOption>
                                                    ))}
                                                </ComboboxOptions>
                                            </Combobox>
                                        </>
                                    ) : (
                                        <p>No projects found</p>
                                    )}

                                    {groupTaskLoading ? (
                                        <p>Loading...</p>
                                    ) : groupTaskError ? (
                                        <MessageBox message={groupTaskError}></MessageBox>
                                    ) : groupTasks ? (
                                        <>
                                            <Combobox value={selectedGroupTask} onChange={(value) => setSelectedGroupTask(value)} onClose={() => setQueryGroupTask('')}>
                                                <label
                                                    htmlFor="group-task"
                                                    className="flex items-center justify-between text-md font-medium text-gray-700 mt-4 mb-3"
                                                >
                                                    Group Task
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                                            onClick={() => {
                                                                if (selectedProject.id !== undefined) {
                                                                    navigate(`/project/${selectedProject.id}`)
                                                                } else {
                                                                    navigate(`/project`);
                                                                }
                                                            }}
                                                        >
                                                            Create Group Task
                                                        </button>
                                                    </div>
                                                </label>
                                                <div className="relative">
                                                    <ComboboxInput
                                                        className={clsx(
                                                            "mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                                                            "py-2 px-3 bg-indigo-50"
                                                        )}
                                                        displayValue={(groupTask) => groupTask?.title}
                                                        onChange={(event) => setQueryGroupTask(event.target.value)}
                                                    />
                                                    <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                                                        <ChevronDownIcon className="size-4 fill-black/60 group-data-[hover]:fill-black" />
                                                    </ComboboxButton>
                                                </div>
                                                <ComboboxOptions
                                                    anchor="bottom"
                                                    transition
                                                    className={clsx(
                                                        'w-[var(--input-width)] rounded-xl border border-white/5 bg-white p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
                                                        'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
                                                    )}
                                                >
                                                    {filterGroupTasks.map((groupTask) => (
                                                        <ComboboxOption
                                                            key={groupTask.id}
                                                            value={groupTask}
                                                            className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                                                        >
                                                            <CheckIcon className="invisible size-4 group-data-[selected]:visible" />
                                                            {groupTask.title}
                                                        </ComboboxOption>
                                                    ))}
                                                </ComboboxOptions>
                                            </Combobox>
                                        </>
                                    ) : (
                                        <p>No group tasks found</p>
                                    )}

                                    <div className="mt-4">
                                        <Grid numItems={6}>
                                            <Col numColSpan={2}>
                                                <p className="block text-md font-medium text-gray-700 mb-3">Start Time</p>
                                                <div className="grid grid-cols-1 m-1">
                                                    <div className="inline-flex items-center bg-white">
                                                        <div className="relative">
                                                            <input
                                                                type="time"
                                                                id="start-time"
                                                                className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-full focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                                                min="00:00"
                                                                max="23:59"
                                                                value={startHour}
                                                                onChange={(e) => setStartHour(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col numColSpan={2}>
                                                <p className="block text-md font-medium text-gray-700 mb-3">End Time</p>
                                                <div className="grid grid-cols-1 m-1">
                                                    <div className="inline-flex items-center bg-white">
                                                        <div className="relative">
                                                            <input
                                                                type="time"
                                                                id="end-time"
                                                                className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-full focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                                                min="00:00"
                                                                max="23:59"
                                                                value={endHour}
                                                                onChange={(e) => setEndHour(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col numColSpan={2}>
                                                <p className="block text-md font-medium text-gray-700 mb-3">Duration</p>
                                                <div className="grid grid-cols-1 m-1">
                                                    <div className="inline-flex items-center bg-white">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                id="duration"
                                                                className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-full focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                                                min="0"
                                                                value={duration}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Grid>
                                    </div>

                                    <div className="mt-4">
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
                                                setObjectTask(title, duration, startHour, endHour,
                                                    isHighPriority, isMediumPriority, isLowPriority, isStarPriority,
                                                    isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday);
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