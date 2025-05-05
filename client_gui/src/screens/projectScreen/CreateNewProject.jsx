import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Input, Textarea } from "@material-tailwind/react";
import { Card, Title } from "@tremor/react";
import { Fragment, useState } from "react";
import { useParams } from "react-router-dom"
import RadioButtonIcon from "../../components/icons/RadioButtonIcon";
import { useCreateProjectDispatch } from "../../kernels/utils/write-dialog-api-requests";

export const CreateNewProject = () => {
    const useParam = useParams();

    let [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        setIsOpen(false)
    }
    function openModal() {
        setIsOpen(true)
    }

    const [project] = useState({});
    const [newName, setNewName] = useState('');
    const [description, setDescription] = useState('');
    // Radio button
    const [status, setStatus] = useState('');

    const createNewProject = useCreateProjectDispatch();
    const setObjectProject = (name, description, status) => {
        project.name = name;
        project.description = description;
        project.status = status;
        project.ownerId = "1";
        createNewProject(project);
        window.location.reload();
    }

    return (
        <>
            <Card className="flex flex-col justify-center items-center border-dashed border-2 border-sky-500 hover:border-solid hover:cursor-pointer text-center font-bold w-full h-full"
                onClick={openModal}>
                <Title> Create Project </Title>
            </Card>

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
                                        Create New Project
                                    </DialogTitle>
                                    {/* Task Title Input */}
                                    <div className="mt-2">
                                        <label htmlFor="project-title" className="block text-md font-medium text-gray-700 mb-3">Project Name</label>
                                        <Input
                                            id="project-title"
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Project Name"
                                        />
                                    </div>

                                    {/* Task Description Input */}
                                    <div className="mt-4">
                                        <label htmlFor="project-description" className="block text-md font-medium text-gray-700 mb-3">Description</label>
                                        <Textarea
                                            id="project-description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Project Description"
                                        />
                                    </div>

                                    {/* Status Radio Button */}
                                    <div className="mt-4">
                                        <p className="block text-md font-medium text-gray-700 mb-3">Status</p>
                                        <div className="grid grid-cols-3 m-2">
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
                                                setObjectProject(newName, description, status);
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