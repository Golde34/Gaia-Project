import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { useLockNoteDispatch, useUnlockNoteDispatch } from "../../kernels/utils/dialog-api-requests";
import { Fragment, useState } from "react";
import { Input } from "@material-tailwind/react";

export const LockDialog = (props) => {
    const isLock = props.isLock;

    let [isOpen, setIsOpen] = useState(false);
    function closeModal() {
        setIsOpen(false);
    }
    function openModal() {
        setIsOpen(true);
    }

    let [notePassword, setNotePassword] = useState("");
    let [passwordSuggestion, setPasswordSuggestion] = useState("");

    const lockDispatch = useLockNoteDispatch();
    const unlockDispatch = useUnlockNoteDispatch();
    const lockNote = (notePassword, passwordSuggestion, isLock) => {
        if (isLock) {
            unlockDispatch(props.elementId, notePassword);
            window.location.reload();
            return;
        } else {
            lockDispatch(props.elementId, notePassword, passwordSuggestion);
            window.location.reload();
        }
    };

    return (
        <>
            <button className="text-black px-6 py-3" type="button" onClick={openModal}>
                {props.component}
            </button>

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
                                        {props.component}
                                    </DialogTitle>
                                    <div className="mt-2">
                                        {isLock ? (
                                            <>
                                                <p className="text-sm text-red-700">
                                                    Are you sure you want to unlock this {props.elementName}?
                                                </p>
                                                <p className="text-md text-black-800">
                                                    Your password suggestion is: {props.suggestion}
                                                </p>
                                                <Input
                                                    type="text"
                                                    outline={true}
                                                    placeholder="Password"
                                                    value={notePassword}
                                                    onChange={(e) => setNotePassword(e.target.value)}
                                                    className="mt-2 block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm text-red-700">
                                                    Are you sure you want to {props.action} this {props.elementName}? You must set a password for your note to lock it.
                                                </p>
                                                <Input
                                                    id="space-bug"
                                                    type="text"
                                                    outline={true}
                                                    placeholder={props.elementName + " Password"}
                                                    value={notePassword}
                                                    onChange={(e) => setNotePassword(e.target.value)}
                                                    className="mt-2 block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                                                />
                                                <Input
                                                    id="space-bug"
                                                    type="text"
                                                    outline={true}
                                                    placeholder="Password Suggestion in case you forget"
                                                    value={passwordSuggestion}
                                                    onChange={(e) => setPasswordSuggestion(e.target.value)}
                                                    className="mt-4 block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                                                />
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            disabled={isLock ? notePassword === "" : (notePassword === "" || passwordSuggestion === "")}
                                            className={`bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg ${isLock ? (notePassword === "" ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-500") : (!notePassword || !passwordSuggestion ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-500")
                                                } transition duration-300 ease-in-out`}
                                            onClick={() => {
                                                if (isLock) {
                                                    // Unlocking only requires notePassword
                                                    if (notePassword === "") {
                                                        alert("Please fill in the password field to unlock.");
                                                        return;
                                                    }
                                                } else {
                                                    // Locking requires both fields
                                                    if (notePassword === "" || passwordSuggestion === "") {
                                                        alert("Please fill in the password and password suggestion fields to lock.");
                                                        return;
                                                    }
                                                }
                                                lockNote(notePassword, passwordSuggestion, isLock);
                                                closeModal();
                                            }}
                                        >
                                            OK
                                        </button>
                                        <button
                                            type="button"
                                            className='ml-2 inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'
                                            onClick={closeModal}
                                        >
                                            Cancel
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