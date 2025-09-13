import { DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Badge, Button, Card, Col, Dialog, DialogPanel, Divider, Flex, Grid, Select, SelectItem, Subtitle, Text, TextInput, Title } from "@tremor/react";
import { Menu, MenuHandler, MenuItem, MenuList } from "@material-tailwind/react";
import { Fragment, useMemo, useState } from "react";
import { tagColors } from "../../kernels/utils/calendar";
import { toMin } from "../../kernels/utils/date-picker";
import { useUpdateTimeBubbleDispatch, useDeleteTaskAwayScheduleDispatch } from "../../kernels/utils/write-dialog-api-requests";
import { ColorBadge } from "../../components/subComponents/ColorBadge";
import EllipsisIcon from "../../components/icons/EllipsisIcon";

const ScheduleDayBubble = (props) => {
    const { slot, updatedDailyTaskList } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [isEdited, setIsEdited] = useState(false);

    const [form, setForm] = useState({
        id: slot.id,
        startTime: slot.startTime ?? "",
        endTime: slot.endTime ?? "",
        primaryTaskId: slot.primaryTaskId ?? "",
        primaryTaskTitle: slot.primaryTaskTitle ?? "",
        backupTaskId: slot.backupTaskId ?? "",
        backupTaskTitle: slot.backupTaskTitle ?? "",
        timeBubbleId: slot.timeBubbleId,
        tag: slot.tag
    });

    const openModal = (s) => {
        setForm({
            id: s.id,
            startTime: s.startTime ?? "",
            endTime: s.endTime ?? "",
            primaryTaskId: s.primaryTaskId ?? "",
            primaryTaskTitle: s.primaryTaskTitle ?? "",
            backupTaskId: s.backupTaskId ?? "",
            backupTaskTitle: s.backupTaskTitle ?? "",
            timeBubbleId: s.timeBubbleId,
            tag: s.tag
        });
        setIsOpen(true);
        setIsEdited(false);
    };

    const closeModal = () => setIsOpen(false);

    // Helpers
    const byId = useMemo(() => {
        const map = new Map();
        (updatedDailyTaskList ?? []).forEach((t) => map.set(String(t.id), t));
        return map;
    }, [updatedDailyTaskList]);

    const timeError = (() => {
        const s = toMin(form.startTime);
        const e = toMin(form.endTime);
        if (s != null && e != null && e <= s) return "End time must be after start time.";
        return null;
    })();

    // Handlers
    const handleTimeChange = (name, value) => {
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handlePrimarySelect = (taskId) => {
        const t = byId.get(String(taskId));
        setForm((p) => ({
            ...p,
            primaryTaskId: taskId || "",
            primaryTaskTitle: t?.title || "",
        }));
    };

    const handleBackupSelect = (taskId) => {
        const t = byId.get(String(taskId));
        setForm((p) => ({
            ...p,
            backupTaskId: taskId || "",
            backupTaskTitle: t?.title || "",
        }));
    };

    const clearBackup = () => setForm((p) => ({ ...p, backupTaskId: "", backupTaskTitle: "" }));

    const handleEdit = () => setIsEdited(true);
    const handleTagForm = (value) => {
        setForm((prev) => ({ ...prev, tag: value }));
    }

    const updateTimeBubble = useUpdateTimeBubbleDispatch();
    const deleteTaskAwaySchedule = useDeleteTaskAwayScheduleDispatch();
    const handleSave = () => {
        if (timeError) return;
        console.log("update form: ", form)
        updateTimeBubble(form)
        closeModal();
    };
    const handleDelete = (e) => {
        e?.stopPropagation?.();
        deleteTaskAwaySchedule({ timeBubbleId: slot.timeBubbleId });
    }

    return (
        <>
            <Card
                key={slot.id}
                onClick={() => openModal(slot)}
                className="flex items-center justify-between p-3 rounded-lg mt-4 
                   hover:cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300"
            >
                <div className="flex-shrink-0">
                    <ColorBadge color={tagColors[slot.tag]} name={slot.tag}></ColorBadge>
                </div>

                <div className="flex-grow text-center mx-4">
                    <Text className="text-sm font-semibold text-white truncate mt-1">
                        {slot.primaryTaskTitle}
                    </Text>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                    <Text className="text-sm text-gray-400">
                        {slot.startTime} - {slot.endTime}
                    </Text>
                    <Menu placement="bottom-end">
                        <MenuHandler>
                            <div onClick={(e) => e.stopPropagation()} className="rounded p-1 hover:bg-gray-700">
                                <EllipsisIcon />
                            </div>
                        </MenuHandler>
                        <MenuList>
                            <MenuItem onClick={handleDelete}>Delete from schedule</MenuItem>
                        </MenuList>
                    </Menu>
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
                                <DialogPanel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-50">
                                        Edit
                                    </DialogTitle>
                                    <>
                                        {!isEdited ? (
                                            <Card className="mt-6 p-4">
                                                <Title>Preview</Title>
                                                <Divider></Divider>
                                                <Flex>
                                                    <Text className="text-sm">
                                                        {form.startTime || "—"} - {form.endTime || "—"}
                                                    </Text>
                                                    <ColorBadge color={tagColors[slot.tag]} name={slot.tag}></ColorBadge>
                                                </Flex>
                                                <Grid numItems={2} className="mt-3">
                                                    <Col numColSpan={1}>
                                                        {form.primaryTaskTitle && (
                                                            <a href={`/client-gui/task/detail/${form.primaryTaskId}`}>
                                                                <Text className="mt-1">
                                                                    Main: <span className="font-medium">{form.primaryTaskTitle}</span>
                                                                </Text>
                                                            </a>
                                                        )}
                                                    </Col>
                                                    <Col numColSpan={1}>
                                                        {form.backupTaskTitle && (
                                                            <a href={`/client-gui/task/detail/${form.backupTaskId}`}>
                                                                <Text className="mt-1">
                                                                    Backup: <span className="font-medium">{form.backupTaskTitle}</span>
                                                                </Text>
                                                            </a>
                                                        )}
                                                    </Col>
                                                </Grid>
                                            </Card>
                                        ) : (
                                            <>
                                                {/* Time */}
                                                <Grid numItemsLg={2} numItemsSm={1} className="gap-4 mt-4">
                                                    <Col>
                                                        <Text className="mb-1">Start time</Text>
                                                        <TextInput
                                                            type="time"
                                                            value={form.startTime}
                                                            onChange={(e) => handleTimeChange("startTime", e.target.value)}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <Text className="mb-1">End time</Text>
                                                        <TextInput
                                                            type="time"
                                                            value={form.endTime}
                                                            onChange={(e) => handleTimeChange("endTime", e.target.value)}
                                                        />
                                                    </Col>
                                                    <Col numColSpanLg={2} numColSpan={1}>
                                                        <Select defaultValue={form.tag} onValueChange={handleTagForm}>
                                                            <SelectItem value="work">
                                                                <ColorBadge color={tagColors["work"]} name={"Work"}></ColorBadge>
                                                            </SelectItem>
                                                            <SelectItem value="relax">
                                                                <ColorBadge color={tagColors["relax"]} name={"Relax"}></ColorBadge>
                                                            </SelectItem>
                                                            <SelectItem value="travel">
                                                                <ColorBadge color={tagColors["travel"]} name={"Travel"}></ColorBadge>
                                                            </SelectItem>
                                                            <SelectItem value="eat">
                                                                <ColorBadge color={tagColors["eat"]} name={"Eat"}></ColorBadge>
                                                            </SelectItem>
                                                            <SelectItem value="sleep">
                                                                <ColorBadge color={tagColors["sleep"]} name={"Sleep"}></ColorBadge>
                                                            </SelectItem>
                                                        </Select>
                                                    </Col>
                                                </Grid>
                                                {timeError && <Text className="text-red-600 mt-2">{timeError}</Text>}

                                                {/* Primary task */}
                                                <Card decoration="left" decorationColor="blue" className="mt-6 p-4">
                                                    <Flex justifyContent="between" alignItems="center">
                                                        <Subtitle>Main task</Subtitle>
                                                        {form.primaryTaskId && (
                                                            <a
                                                                href={`/client-gui/task/detail/${form.primaryTaskId}`}
                                                                className="underline"
                                                            >
                                                                <Text>Open detail</Text>
                                                            </a>
                                                        )}
                                                    </Flex>

                                                    <Text className="mt-2 mb-1">Choose primary task</Text>
                                                    <Select
                                                        value={form.primaryTaskId || ""}
                                                        onValueChange={handlePrimarySelect}
                                                        placeholder="Select a task…"
                                                    >
                                                        {(updatedDailyTaskList ?? []).map((t) => (
                                                            <SelectItem key={t.id} value={String(t.id)}>
                                                                {t.title}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>

                                                    {form.primaryTaskTitle && (
                                                        <Text className="mt-2 text-gray-600">
                                                            Selected: <span className="font-medium">{form.primaryTaskTitle}</span>
                                                        </Text>
                                                    )}
                                                </Card>

                                                {/* Backup task */}
                                                <Card decoration="left" decorationColor="red" className="mt-4 p-4">
                                                    <Flex justifyContent="between" alignItems="center">
                                                        <Subtitle>Backup task</Subtitle>
                                                        <div className="flex items-center gap-3">
                                                            {form.backupTaskId && (
                                                                <a
                                                                    href={`/client-gui/task/detail/${form.backupTaskId}`}
                                                                    className="underline"
                                                                >
                                                                    <Text>Open detail</Text>
                                                                </a>
                                                            )}
                                                            <Button variant="secondary" size="sm" onClick={clearBackup}>
                                                                Clear
                                                            </Button>
                                                        </div>
                                                    </Flex>

                                                    <Text className="mt-2 mb-1">Choose backup task (optional)</Text>
                                                    <Select
                                                        value={form.backupTaskId || ""}
                                                        onValueChange={handleBackupSelect}
                                                        placeholder="Select a backup task…"
                                                    >
                                                        <SelectItem key="__none" value="">
                                                            — None —
                                                        </SelectItem>
                                                        {(updatedDailyTaskList ?? []).map((t) => (
                                                            <SelectItem key={t.id} value={String(t.id)}>
                                                                {t.title}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>

                                                    {form.backupTaskTitle ? (
                                                        <Text className="mt-2 text-gray-600">
                                                            Selected: <span className="font-medium">{form.backupTaskTitle}</span>
                                                        </Text>
                                                    ) : (
                                                        <Text className="mt-2 text-gray-500">No backup selected</Text>
                                                    )}
                                                </Card>
                                            </>
                                        )}
                                    </>

                                    {/* Actions */}
                                    <Flex className="mt-6" justifyContent="end" alignItems="center">
                                        {isEdited ? (
                                            <Button onClick={handleSave} color="indigo">
                                                Save
                                            </Button>
                                        ) : (
                                            <Button onClick={handleEdit} color="indigo">
                                                Edit
                                            </Button>
                                        )}

                                        <Button onClick={closeModal} variant="secondary" className="ml-2">
                                            Cancel
                                        </Button>
                                    </Flex>
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

