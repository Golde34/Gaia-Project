import { Fragment, useState } from "react";
import { Dialog, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Input, Textarea } from "@material-tailwind/react";
import { PlusIcon } from "@heroicons/react/outline";
import { useParams } from "react-router-dom";
import { useCreateGroupTaskDispatch } from '../../kernels/utils/write-dialog-api-requests';
import CheckBoxIcon from "../../components/icons/CheckboxIcon";
import { Button, DialogPanel } from "@tremor/react";
import { RadioButton } from "../../components/subComponents/RadioButton";

export const CreateNewGroupTask = (props) => {
    const useParam = useParams();

    let [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        setIsOpen(false)
    }
    function openModal() {
        setIsOpen(true)
    }

    const [newName, setNewName] = useState('');
    const [description, setDescription] = useState('');
    const [groupTask] = useState({});
    const projectId = useParam.id;
    // Radio button
    const [status, setStatus] = useState('');
    // Checkbox
    const [isHighPriority, setIsHighPriority] = useState(false);
    const [isMediumPriority, setIsMediumPriority] = useState(false);
    const [isLowPriority, setIsLowPriority] = useState(false);
    const [isStarPriority, setIsStarPriority] = useState(false);

    const createNewGroupTask = useCreateGroupTaskDispatch();
    const setObjectGroupTask = (title, description, status, isHighPriority, isMediumPriority, isLowPriority, isStarPriority) => {
        groupTask.title = title;
        groupTask.description = description;
        groupTask.priority = pushPriority(isHighPriority, isMediumPriority, isLowPriority, isStarPriority);
        groupTask.status = status;
        groupTask.projectId = projectId;
        createNewGroupTask(groupTask);
        window.location.reload();
    }
    const pushPriority = (isHighPriority, isMediumPriority, isLowPriority, isStarPriority) => {
        let priority = [];
        if (isHighPriority) {
            priority.push("HIGH");
        }
        if (isMediumPriority) {
            priority.push("MEDIUM");
        }
        if (isLowPriority) {
            priority.push("LOW");
        }
        if (isStarPriority) {
            priority.push("STAR");
        }
        return priority;
    }

    return (
        <>
            {props.gtStatus === 'new' ? (
                <Button onClick={openModal}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Create New Group Task
                </Button>
            ) : (
                <button
                    className="text-white"
                    type="button"
                    onClick={openModal}
                >
                    <PlusIcon className="w-6" />
                </button>
            )
            }

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
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Create New Group Task
                                    </DialogTitle>
                                    {/* Task Title Input */}
                                    <div className="mt-2">
                                        <label htmlFor="task-title" className="block text-md font-medium text-gray-700 mb-3">Title</label>
                                        <Input
                                            id="task-title"
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Task Title"
                                        />
                                    </div>

                                    {/* Task Description Input */}
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

                                    {/* Priority Checkbox */}
                                    <div className="mt-4">
                                        <p className="block text-md font-medium text-gray-700 mb-3">Priority</p>
                                        <div className="grid grid-cols-4 m-2">
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

                                    {/* Status Checkbox */}
                                    <div className="mt-4">
                                        <p className="block text-md font-medium text-gray-700 mb-3">Status</p>
                                        <div className="grid grid-cols-3 m-2">
                                            <RadioButton
                                                id="status-radio-todo"
                                                value="TODO"
                                                getter={status}
                                                setter={setStatus}
                                                color="blue"
                                                label="TO DO"
                                                textLight={700}
                                            />
                                            <RadioButton
                                                id="status-radio-doing"
                                                value="IN_PROGRESS"
                                                getter={status}
                                                setter={setStatus}
                                                color="blue"
                                                label="IN PROGRESS"
                                                textLight={700}
                                            />
                                            <RadioButton
                                                id="status-radio-done"
                                                value="DONE"
                                                getter={status}
                                                setter={setStatus}
                                                color="blue"
                                                label="DONE"
                                                textLight={700}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
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
                                                setObjectGroupTask(newName, description, status, isHighPriority, isMediumPriority, isLowPriority, isStarPriority);
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
            </Transition>
        </>
    )
}