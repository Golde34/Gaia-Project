import { Dialog, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useUpdateColorDispatch } from '../../kernels/utils/dialog-api-requests';
import { RadioButton } from './RadioButton';
import { DialogPanel } from '@tremor/react';

export const ColorDialog = (props) => {

    let [isOpen, setIsOpen] = useState(false)
    let [color, setColor] = useState("");

    function closeModal() {
        setIsOpen(false)
    }
    function openModal() {
        setIsOpen(true)
    }

    const updateColorDispatch = useUpdateColorDispatch();
    const updateColor = (color) => {
        updateColorDispatch(props.elementId, color);
        window.location.reload();
    }

    return (
        <>
            <button
                className="text-black px-6 py-3"
                type="button"
                onClick={openModal}
            >
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
                                        Change Color
                                    </DialogTitle>
                                    <div className="mt-2">
                                        {/* Status Radio Button */}
                                        <div className="mt-4">
                                            <p className="block text-md font-medium text-gray-700 mb-3">Status</p>
                                            <div className="grid grid-cols-3 m-2">
                                                <RadioButton
                                                    id="status-radio-red"
                                                    value="red"
                                                    getter={color}
                                                    setter={setColor}
                                                    color="red"
                                                    label="Red"
                                                    textLight={700}
                                                />
                                                <RadioButton
                                                    id="status-radio-pink"
                                                    value="pink"
                                                    getter={color}
                                                    setter={setColor}
                                                    color="pink"
                                                    label="Pink"
                                                    textLight={700}
                                                />
                                                <RadioButton
                                                    id="status-radio-green"
                                                    value="green"
                                                    getter={color}
                                                    setter={setColor}
                                                    color="green"
                                                    label="Green"
                                                    textLight={700}
                                                />
                                                <RadioButton
                                                    id="status-radio-blue"
                                                    value="blue"
                                                    getter={color}
                                                    setter={setColor}
                                                    color="blue"
                                                    label="Blue"
                                                    textLight={700}
                                                />
                                                <RadioButton
                                                    id="status-radio-yellow"
                                                    value="yellow"
                                                    getter={color}
                                                    setter={setColor}
                                                    color="yellow"
                                                    label="Yellow"
                                                    textLight={700}
                                                />
                                                <RadioButton
                                                    id="status-radio-white"
                                                    value="white"
                                                    getter={color}
                                                    setter={setColor}
                                                    color="black"
                                                    label="White"
                                                    textLight={700}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => {
                                                updateColor(color);
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
    )
}