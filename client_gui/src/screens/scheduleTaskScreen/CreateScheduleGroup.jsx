import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Dialog, DialogPanel, DialogTitle, Input, Transition, TransitionChild } from "@headlessui/react";
import { Button, Col, Grid } from "@tremor/react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
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
import { CheckBoxComponent } from "../../components/subComponents/CheckBox";

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
                                            <CheckBoxComponent
                                                id="priority-checkbox-high"
                                                getter={isHighPriority}
                                                setter={setIsHighPriority}
                                                color="red"
                                                label="High"
                                            />
                                            <CheckBoxComponent
                                                id="priority-checkbox-medium"
                                                getter={isMediumPriority}
                                                setter={setIsMediumPriority}
                                                color="pink"
                                                label="Medium"
                                            />
                                            <CheckBoxComponent
                                                id="priority-checkbox-low"
                                                getter={isLowPriority}
                                                setter={setIsLowPriority}
                                                color="green"
                                                label="Low"
                                            />
                                            <CheckBoxComponent
                                                id="priority-checkbox-star"
                                                getter={isStarPriority}
                                                setter={setIsStarPriority}
                                                color="yellow"
                                                label="Star"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <p className="block text-md font-medium text-gray-700 mb-1">Repeat On</p>
                                        <Grid numItems={4}>
                                            <Col numColSpan={1}>
                                                <CheckBoxComponent
                                                    id="repeat-checkbox-monday"
                                                    getter={isMonday}
                                                    setter={setIsMonday}
                                                    color="green"
                                                    label="Monday"
                                                />
                                            </Col>
                                            <Col numColSpan={1}>
                                                <CheckBoxComponent
                                                    id="repeat-checkbox-tuesday"
                                                    getter={isTuesday}
                                                    setter={setIsTuesday}
                                                    color="teal"
                                                    label="Tuesday"
                                                />
                                            </Col>
                                            <Col numColSpan={1}>
                                                <CheckBoxComponent
                                                    id="repeat-checkbox-wednesday"
                                                    getter={isWednesday}
                                                    setter={setIsWednesday}
                                                    color="blue"
                                                    label="Wednesday"
                                                />
                                            </Col>
                                            <Col numColSpan={1}></Col>
                                            <Col numColSpan={1}>
                                                <CheckBoxComponent
                                                    id="repeat-checkbox-thursday"
                                                    getter={isThursday}
                                                    setter={setIsThursday}
                                                    color="indigo"
                                                    label="Thursday"
                                                />
                                            </Col>
                                            <Col numColSpan={1}>
                                                <CheckBoxComponent
                                                    id="repeat-checkbox-friday"
                                                    getter={isFriday}
                                                    setter={setIsFriday}
                                                    color="pink"
                                                    label="Friday"
                                                />
                                            </Col>
                                            <Col numColSpan={1}>
                                                <CheckBoxComponent
                                                    id="repeat-checkbox-saturday"
                                                    getter={isSaturday}
                                                    setter={setIsSaturday}
                                                    color="red"
                                                    label="Saturday"
                                                />
                                            </Col>
                                            <Col numColSpan={1}>
                                                <CheckBoxComponent
                                                    id="repeat-checkbox-sunday"
                                                    getter={isSunday}
                                                    setter={setIsSunday}
                                                    color="yellow"
                                                    label="Sunday"
                                                />
                                            </Col>
                                        </Grid>
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