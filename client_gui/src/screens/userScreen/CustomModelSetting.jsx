import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageBox from "../../components/subComponents/MessageBox";
import {
    Badge,
    Button,
    Card,
    Flex,
    Select,
    SelectItem,
    Subtitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    TextInput,
    Title,
} from "@tremor/react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { DotsVerticalIcon } from "@heroicons/react/solid";
import { deleteUserLLMModel, getUserLLMModels, upsertUserLLMModel } from "../../api/store/actions/auth_service/user.actions";

const maskKey = (key) => {
    if (!key) return "";
    if (key.length <= 4) return key;
    return `${"•".repeat(Math.max(0, key.length - 4))}${key.slice(-4)}`;
};

const CustomModelSetting = ({ allModels = [] }) => {
    const dispatch = useDispatch();

    const userLlmModels = useSelector((state) => state.userLLMModels);
    const { loading, error, userLLMModels = [] } = userLlmModels;

    const upsertState = useSelector((state) => state.upsertUserLLMModel);
    const { success: upsertSuccess, error: upsertError, loading: upsertLoading } = upsertState;
    const deleteState = useSelector((state) => state.deleteUserLLMModel);
    const { success: deleteSuccess, error: deleteError } = deleteState;

    const [newUserModelName, setNewUserModelName] = useState("");
    const [newSelectedModelName, setNewSelectedModelName] = useState("");
    const [newModelKey, setNewModelKey] = useState("");
    const [newActiveStatus, setNewActiveStatus] = useState(true);
    const [saveMessage, setSaveMessage] = useState("");
    const [formError, setFormError] = useState("");
    const [editingModelId, setEditingModelId] = useState(null);
    const [editingValues, setEditingValues] = useState({
        userModel: "",
        modelName: "",
        modelKey: "",
        activeStatus: true,
    });

    const initialFetchDone = useRef(false);

    const loadUserLLMModelsOnce = useCallback(() => {
        if (initialFetchDone.current) return;
        initialFetchDone.current = true;
        dispatch(getUserLLMModels());
    }, [dispatch]);

    const refreshUserLLMModels = useCallback(() => {
        dispatch(getUserLLMModels());
    }, [dispatch]);
    useEffect(() => {
        loadUserLLMModelsOnce();
    }, [loadUserLLMModelsOnce]);

    useEffect(() => {
        if (upsertSuccess) {
            refreshUserLLMModels();
            setNewUserModelName("");
            setNewSelectedModelName("");
            setNewModelKey("");
            setNewActiveStatus(true);
            setEditingModelId(null);
            setEditingValues({
                userModel: "",
                modelName: "",
                modelKey: "",
                activeStatus: true,
            });
            setSaveMessage("Model saved successfully.");
        }
    }, [upsertSuccess, refreshUserLLMModels]);

    useEffect(() => {
        if (upsertError) {
            setSaveMessage("");
        }
    }, [upsertError]);

    useEffect(() => {
        if (deleteSuccess) {
            refreshUserLLMModels();
            setEditingModelId(null);
            setEditingValues({
                userModel: "",
                modelName: "",
                modelKey: "",
                activeStatus: true,
            });
            setSaveMessage("Model deleted successfully.");
        }
    }, [deleteSuccess, refreshUserLLMModels]);

    useEffect(() => {
        if (deleteError) {
            setSaveMessage("");
        }
    }, [deleteError]);

    const sortedUserModels = useMemo(() => {
        if (!userLLMModels || userLLMModels.length == 0) return [];
        return [...userLLMModels].sort((a, b) => Number(b.activeStatus) - Number(a.activeStatus));
    }, [userLLMModels]);

    const llmModelOptions = useMemo(() => {
        const names = new Set((allModels ?? []).map((model) => model.modelName));
        (userLLMModels ?? []).forEach((model) => {
            if (model?.modelName) {
                names.add(model.modelName);
            }
        });
        return Array.from(names);
    }, [allModels, userLLMModels]);

    const startEditingModel = (model) => {
        setEditingModelId(model.id);
        setEditingValues({
            userModel: model.userModel || "",
            modelName: model.modelName || "",
            modelKey: model.modelKey || "",
            activeStatus: !!model.activeStatus,
        });
        setFormError("");
        setSaveMessage("");
    };

    const cancelEditing = () => {
        setEditingModelId(null);
        setEditingValues({
            userModel: "",
            modelName: "",
            modelKey: "",
            activeStatus: true,
        });
    };

    const handleUpdateModel = () => {
        if (!editingModelId) return;
        const trimmedUserModel = editingValues.userModel.trim();
        const trimmedModelName = editingValues.modelName.trim();
        const trimmedKey = editingValues.modelKey.trim();
        setFormError("");
        setSaveMessage("");

        if (!trimmedUserModel || !trimmedModelName || !trimmedKey) {
            setFormError("User model, LLM model, and API key are required.");
            return;
        }

        dispatch(
            upsertUserLLMModel({
                id: editingModelId,
                userModel: trimmedUserModel,
                modelName: trimmedModelName,
                modelKey: trimmedKey,
                activeStatus: editingValues.activeStatus,
            }),
        );
    };

    const handleAddNewModel = () => {
        const trimmedUserModel = newUserModelName.trim();
        const trimmedModelName = newSelectedModelName.trim();
        const trimmedKey = newModelKey.trim();
        setFormError("");
        setSaveMessage("");

        if (!trimmedUserModel || !trimmedModelName || !trimmedKey) {
            setFormError("User model, LLM model, and API key are required.");
            return;
        }

        dispatch(
            upsertUserLLMModel({
                userModel: trimmedUserModel,
                modelName: trimmedModelName,
                modelKey: trimmedKey,
                activeStatus: newActiveStatus == null ? true : newActiveStatus,
            }),
        );
    };

    const handleDeleteModelKey = (model) => {
        setFormError("");
        setSaveMessage("");
        dispatch(deleteUserLLMModel(model.id));
    };

    const renderActionMenu = (model) => (
        <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                <DotsVerticalIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <MenuItem>
                    {({ active }) => (
                        <button
                            type="button"
                            onClick={() => startEditingModel(model)}
                            className={`${active ? "bg-gray-100 dark:bg-slate-700" : ""
                                } block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200`}
                        >
                            Update
                        </button>
                    )}
                </MenuItem>
                <MenuItem>
                    {({ active }) => (
                        <button
                            type="button"
                            onClick={() => handleDeleteModelKey(model)}
                            className={`${active ? "bg-gray-100 dark:bg-slate-700" : ""
                                } block w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400`}
                        >
                            Delete key
                        </button>
                    )}
                </MenuItem>
            </MenuItems>
        </Menu>
    );

    return (
        <Card>
            <Flex justifyContent="center" alignItems="center">
                <Title className="text-white text-xl font-bold">Your Custom LLM Models</Title>
            </Flex>

            <div className="mt-6">
                <Subtitle className="mb-2">Manage your models</Subtitle>
                {formError && <MessageBox message={formError} />}
                {upsertError && <MessageBox message={upsertError} />}
                {deleteError && <MessageBox message={deleteError} />}
                {saveMessage && <Text className="text-emerald-500">{saveMessage}</Text>}
                {loading ? (
                    <Text>Loading...</Text>
                ) : error ? (
                    <MessageBox message={error} />
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                                <TableHeaderCell>User model name</TableHeaderCell>
                                <TableHeaderCell>LLM model</TableHeaderCell>
                                <TableHeaderCell>Key</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedUserModels.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Text className="text-tremor-content">No custom model registered.</Text>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedUserModels.map((model) => {
                                    const isEditing = editingModelId === model.id;
                                    return (
                                        <TableRow key={`${model.id}-${model.modelName}`} className="border-b border-tremor-border dark:border-dark-tremor-border">
                                            <TableCell className="align-top">
                                                {isEditing ? (
                                                    <TextInput
                                                        value={editingValues.modelName}
                                                        onChange={(e) =>
                                                            setEditingValues((prev) => ({
                                                                ...prev,
                                                                modelName: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="User model alias"
                                                    />
                                                ) : (
                                                    <Text className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                                        {model.modelName || "-"}
                                                    </Text>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top">
                                                {isEditing ? (
                                                    <Select
                                                        value={editingValues.userModel || ""}
                                                        onValueChange={(value) =>
                                                            setEditingValues((prev) => ({
                                                                ...prev,
                                                                userModel: value,
                                                            }))
                                                        }
                                                        placeholder="Select a base model"
                                                    >
                                                        {llmModelOptions.map((name) => (
                                                            <SelectItem key={name} value={name}>
                                                                {name}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                ) : (
                                                    <Text className="font-medium text-tremor-content dark:text-dark-tremor-content">
                                                        {model.userModel || "-"}
                                                    </Text>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top">
                                                {isEditing ? (
                                                    <TextInput
                                                        value={editingValues.modelKey}
                                                        onChange={(e) =>
                                                            setEditingValues((prev) => ({
                                                                ...prev,
                                                                modelKey: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="API key"
                                                    />
                                                ) : (
                                                    <Text className="font-medium text-tremor-content dark:text-dark-tremor-content">
                                                        {maskKey(model.modelKey)}
                                                    </Text>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top">
                                                {isEditing ? (
                                                    <Select
                                                        value={editingValues.activeStatus ? "active" : "inactive"}
                                                        onValueChange={(value) =>
                                                            setEditingValues((prev) => ({
                                                                ...prev,
                                                                activeStatus: value === "active",
                                                            }))
                                                        }
                                                    >
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </Select>
                                                ) : model.activeStatus ? (
                                                    <Badge color="emerald">Active</Badge>
                                                ) : (
                                                    <Badge color="slate">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top">
                                                {isEditing ? (
                                                    <Flex gap="2">
                                                        <Button
                                                            variant="primary"
                                                            color="indigo"
                                                            onClick={handleUpdateModel}
                                                            disabled={upsertLoading}
                                                        >
                                                            {upsertLoading ? "Saving..." : "Update"}
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            color="slate"
                                                            onClick={cancelEditing}
                                                            disabled={upsertLoading}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </Flex>
                                                ) : (
                                                    renderActionMenu(model)
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                            <TableRow>
                                <TableCell>
                                    <TextInput
                                        placeholder="User model alias"
                                        value={newSelectedModelName}
                                        onChange={(e) => setNewSelectedModelName(e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={newUserModelName}
                                        onValueChange={setNewUserModelName}
                                        placeholder={
                                            llmModelOptions.length === 0
                                                ? "No available models"
                                                : "Select a base model"
                                        }
                                        disabled={llmModelOptions.length === 0}
                                    >
                                        {(allModels ?? []).map((model) => (
                                            <SelectItem key={model.modelId} value={model.modelName}>
                                                {model.modelName}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <TextInput
                                        placeholder="API key"
                                        value={newModelKey}
                                        onChange={(e) => setNewModelKey(e.target.value)}
                                    />
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell>
                                    <Button
                                        variant="primary"
                                        color="emerald"
                                        onClick={handleAddNewModel}
                                        disabled={upsertLoading || llmModelOptions.length === 0}
                                    >
                                        {upsertLoading ? "Saving..." : "Add"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                )}
            </div>
        </Card>
    );
};

export default CustomModelSetting;
