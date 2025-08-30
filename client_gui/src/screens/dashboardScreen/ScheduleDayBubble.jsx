import { DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Badge, Card, Dialog, DialogPanel, Subtitle, Text } from "@tremor/react";
import { Fragment, useState } from "react";
import { tagColors } from "../../kernels/utils/calendar";

const ScheduleDayBubble = (props) => {
    const updateDailyTaskList = props.updateDailyTaskList;
    const slot = props.slot;

    let [isOpen, setIsOpen] = useState(false);
    function closeModal() {
        setIsOpen(false)
    }

    function openModal(slot) {
        setIsOpen(true);
        setSelectedSlot(slot);
        setFormData({
            startTime: slot.startTime,
            endTime: slot.endTime,
            primaryTaskId: slot.primaryTaskId,
            primaryTaskTitle: slot.primaryTaskTitle,
            backupTaskId: slot.backupTaskId,
            backupTaskTitle: slot.backupTaskTitle,
        });
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateSlot = () => {
        // Update logic here
        updateDailyTaskList(formData); // Assuming updateDailyTaskList is responsible for updating the slot
        closeModal();
    };

    return (
        <>
            <Card
                key={slot.id}
                onClick={() => openModal(slot)}
                className="flex items-center justify-between p-3 rounded-lg mt-4 hover:cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300"
            >
                <div className="flex-shrink-0">
                    <Badge
                        color={tagColors[slot.tag] || "gray"}
                        size="sm"
                        className="px-2 py-1 rounded-full text-xs font-medium"
                    >
                        {slot.tag}
                    </Badge>
                </div>

                <div className="flex-grow text-center mx-4">
                    <Text className="text-sm font-semibold text-white truncate mt-1">
                        {slot.primaryTaskTitle}
                    </Text>
                </div>

                <div className="flex-shrink-0">
                    <Text className="text-sm text-gray-400">
                        {slot.startTime} - {slot.endTime}
                    </Text>
                </div>
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
                                        className="text-lg font-medium leading-6 text-gray-50"
                                    >
                                        Schedule Task
                                    </DialogTitle>
                                    <div className="mt-4">
                                        <Text>Start Time</Text>
                                        <TextInput
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <Text>End Time</Text>
                                        <TextInput
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <Text>Main Task</Text>
                                        <TextInput
                                            name="primaryTaskTitle"
                                            value={formData.primaryTaskTitle}
                                            onChange={handleChange}
                                            placeholder="Task title"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <Text>Backup Task</Text>
                                        <TextInput
                                            name="backupTaskTitle"
                                            value={formData.backupTaskTitle}
                                            onChange={handleChange}
                                            placeholder="Task title"
                                        />
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <Button onClick={handleUpdateSlot} color="indigo">
                                            Update
                                        </Button>
                                        <Button
                                            onClick={closeModal}
                                            variant="secondary"
                                            className="ml-2"
                                        >
                                            Cancel
                                        </Button>
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

export default ScheduleDayBubble; 