import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageBox from "../../components/subComponents/MessageBox";
import {
    Badge,
    Button,
    Card,
    Flex,
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
import { getUserLLMModels, upsertUserLLMModel } from "../../api/store/actions/auth_service/user.actions";

const maskKey = (key) => {
    if (!key) return "";
    if (key.length <= 4) return key;
    return `${"•".repeat(Math.max(0, key.length - 4))}${key.slice(-4)}`;
};

const CustomModelSetting = () => {
    const dispatch = useDispatch();

    const userLlmModels = useSelector((state) => state.userLLMModels);
    const { loading, error, userLLMModels = [] } = userLlmModels;

    const upsertState = useSelector((state) => state.upsertUserLLMModel);
    const { success: upsertSuccess, error: upsertError, loading: upsertLoading } = upsertState;

    const [modelName, setModelName] = useState("");
    const [modelKey, setModelKey] = useState("");
    const [activeStatus, setActiveStatus] = useState(true);
    const [saveMessage, setSaveMessage] = useState("");
    const [formError, setFormError] = useState("");

    const findUserLLMModelInfo = useCallback(() => {
        dispatch(getUserLLMModels());
    }, [dispatch]);

    useEffect(() => {
        findUserLLMModelInfo();
    }, [findUserLLMModelInfo]);

    useEffect(() => {
        if (upsertSuccess) {
            findUserLLMModelInfo();
            setModelName("");
            setModelKey("");
            setActiveStatus(true);
            setSaveMessage("Model saved successfully.");
        }
    }, [upsertSuccess, findUserLLMModelInfo]);

    useEffect(() => {
        if (upsertError) {
            setSaveMessage("");
        }
    }, [upsertError]);

    const sortedUserModels = useMemo(() => {
        return [...userLLMModels].sort((a, b) => Number(b.activeStatus) - Number(a.activeStatus));
    }, [userLLMModels]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const trimmedName = modelName.trim();
        const trimmedKey = modelKey.trim();
        setFormError("");
        setSaveMessage("");

        if (!trimmedName || !trimmedKey) {
            setFormError("Model name and API key are required.");
            return;
        }

        dispatch(upsertUserLLMModel({ modelName: trimmedName, modelKey: trimmedKey, activeStatus }));
    };

    return (
        <Card>
            <Flex justifyContent="center" alignItems="center">
                <Title className="text-white text-xl font-bold">Your Custom LLM Models</Title>
            </Flex>

            <Flex className="mt-6" justifyContent="between" alignItems="start" wrap="wrap" gap="4">
                <div className="flex-1 min-w-[280px]">
                    <Subtitle className="mb-2">Registered models</Subtitle>
                    {loading ? (
                        <Text>Loading...</Text>
                    ) : error ? (
                        <MessageBox message={error}></MessageBox>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                                    <TableHeaderCell>Name</TableHeaderCell>
                                    <TableHeaderCell>Key</TableHeaderCell>
                                    <TableHeaderCell>Status</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedUserModels.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            <Text className="text-tremor-content">No custom model registered.</Text>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedUserModels.map((model) => (
                                        <TableRow key={`${model.id}-${model.modelName}`} className="border-b border-tremor-border dark:border-dark-tremor-border">
                                            <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                                {model.modelName || model.userModel}
                                            </TableCell>
                                            <TableCell className="font-medium text-tremor-content dark:text-dark-tremor-content">
                                                {maskKey(model.modelKey)}
                                            </TableCell>
                                            <TableCell>
                                                {model.activeStatus ? (
                                                    <Badge color="emerald">Active</Badge>
                                                ) : (
                                                    <Badge color="slate">Inactive</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <div className="flex-1 min-w-[280px]">
                    <Subtitle className="mb-2">Add or update a model</Subtitle>
                    {formError && <MessageBox message={formError} />}
                    {upsertError && <MessageBox message={upsertError} />}
                    {saveMessage && (
                        <Text className="text-emerald-500">{saveMessage}</Text>
                    )}
                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <div>
                            <TextInput
                                placeholder="Model name"
                                required
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                            />
                        </div>
                        <div>
                            <TextInput
                                placeholder="API key"
                                required
                                value={modelKey}
                                onChange={(e) => setModelKey(e.target.value)}
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-tremor-content dark:text-dark-tremor-content">
                            <input
                                type="checkbox"
                                checked={activeStatus}
                                onChange={(e) => setActiveStatus(e.target.checked)}
                            />
                            Mark as active
                        </label>
                        <Button type="submit" variant="primary" color="indigo" disabled={upsertLoading}>
                            {upsertLoading ? "Saving..." : "Save model"}
                        </Button>
                    </form>
                </div>
            </Flex>
        </Card>
    );
};

export default CustomModelSetting;
