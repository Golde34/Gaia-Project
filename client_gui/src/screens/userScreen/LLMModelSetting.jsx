import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLLMModels } from "../../api/store/actions/auth_service/user.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import {
    Badge,
    Button,
    Card,
    Col,
    Flex,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    Title,
} from "@tremor/react";
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { useUpdateUserModelDispatch } from "../../kernels/utils/write-dialog-api-requests";
import CustomModelSetting from "./CustomModelSetting";
import MemoryModelSetting from "./MemoryModelSetting";

const LLMModelSettingScreen = (props) => {
    const user = props.user;
    const currentModel = props.model;
    const dispatch = useDispatch();

    const { loading, error, llmModelInfo = [] } = useSelector((state) => state.llmModels);

    const findLLMModelInfo = useCallback(() => {
        dispatch(getLLMModels());
    }, [dispatch]);

    useEffect(() => {
        findLLMModelInfo();
    }, [findLLMModelInfo]);

    const [selectedModel, setSelectedModel] = useState(null);
    const [queryModel, setqueryModel] = useState("");

    useEffect(() => {
        if (!selectedModel && llmModelInfo.length > 0) {
            const activeModel = llmModelInfo.find((model) => model.modelName === currentModel);
            setSelectedModel(activeModel || llmModelInfo[0]);
        }
    }, [llmModelInfo, currentModel, selectedModel]);

    const filterModels = useMemo(() => {
        return llmModelInfo.filter((model) =>
            model.modelName.toLowerCase().includes(queryModel.toLowerCase())
        );
    }, [llmModelInfo, queryModel]);

    const updateUserModel = useUpdateUserModelDispatch();
    const updateModel = () => {
        if (!selectedModel) return;
        if (selectedModel.modelName === currentModel) {
            alert("You're already using this model.");
            return;
        }
        updateUserModel(selectedModel.modelId);
        window.location.reload();
    };

    const renderModelSelector = () => (
        <Table>
            <TableHead>
                <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                    <TableHeaderCell>
                        <Flex justifyContent="start" alignItems="center" className="gap-2">
                            <Text className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                Current model
                            </Text>
                            <Badge color="indigo">{currentModel}</Badge>
                        </Flex>
                    </TableHeaderCell>
                    <TableHeaderCell></TableHeaderCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        <Combobox
                            value={selectedModel}
                            onChange={(value) => setSelectedModel(value)}
                            onClose={() => setqueryModel("")}
                        >
                            <div className="relative">
                                <ComboboxInput
                                    className={clsx(
                                        "w-full rounded-lg border-none bg-white/5 py-1.5 pl-3 text-sm/6 text-white",
                                        "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
                                    )}
                                    displayValue={(model) => model?.modelName}
                                    onChange={(event) => setqueryModel(event.target.value)}
                                    placeholder="Choose your model so Gaia can respond to you appropriately"
                                />
                                <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                                    <ChevronDownIcon className="size-4 fill-white/60 group-data-[hover]:fill-white" />
                                </ComboboxButton>
                            </div>
                            <ComboboxOptions
                                anchor="bottom"
                                transition
                                className={clsx(
                                    "w-[var(--input-width)] rounded-xl border border-white/5 bg-white p-1 [--anchor-gap:var(--spacing-1)] empty:invisible",
                                    "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
                                )}
                            >
                                {filterModels.map((model) => (
                                    <ComboboxOption
                                        key={model.modelId}
                                        value={model}
                                        className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                                    >
                                        <CheckIcon className="invisible size-4 group-data-[selected]:visible" />
                                        {model.modelName}
                                    </ComboboxOption>
                                ))}
                            </ComboboxOptions>
                        </Combobox>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="primary" color="indigo" onClick={updateModel}>
                            Save Current Model
                        </Button>
                    </TableCell>
                </TableRow>
            </TableBody>
            <MemoryModelSetting />
        </Table>
    );

    return (
        <>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <MessageBox message={error}></MessageBox>
            ) : llmModelInfo.length > 0 ? (
                <>
                    <Card className="mb-4">
                        <Flex justifyContent="center" alignItems="center">
                            <Title className="text-white text-xl font-bold">Choose your LLM Model</Title>
                        </Flex>
                        {renderModelSelector()}
                    </Card>
                    <CustomModelSetting allModels={llmModelInfo} user={user} />
                </>
            ) : (
                <Text>No model is available right now.</Text>
            )}
        </>
    );
};

export default LLMModelSettingScreen;
