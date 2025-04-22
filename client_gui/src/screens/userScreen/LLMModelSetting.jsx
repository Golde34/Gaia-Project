import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLLMModels } from "../../api/store/actions/auth_service/user.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import { Button, Card, Flex, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Title } from "@tremor/react";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/solid";

const LLMModelSettingScreen = (props) => {
    const currentModel = props.model;
    const dispatch = useDispatch();

    const llmModels = useSelector(state => state.llmModels);
    const { loading, error, llmModelInfo } = llmModels;
    const findLLMModelInfo = useCallback(() => {
        dispatch(getLLMModels());
    }, [dispatch]);
    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            findLLMModelInfo();
        }, 200);
        console.log("llmModelInfo: ", llmModelInfo);
    }, []);

    const [selectedModel, setSelectedModel] = useState({});
    const [queryModel, setqueryModel] = useState('');
    const filterModels = llmModelInfo?.filter((model) =>
        model.modelName.toLowerCase().includes(queryModel.toLowerCase())
    );

    function updateModel() {
        console.log("updateModel: ", selectedModel);
        if (selectedModel) {
            console.log("updateModel: ", selectedModel);
        }
    }

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <MessageBox message={error}></MessageBox>
            ) : llmModelInfo ? (
                <Card >
                    <Flex justifyContent="center" alignItems="center" className="mb-">
                        <Title className="text-white text-xl font-bold">Choose your LLM Model</Title>

                    </Flex>
                    <Table className="mt-8">
                        <TableHead>
                            <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                                <TableHeaderCell>
                                    Your current model <u>{currentModel}</u>
                                </TableHeaderCell>
                                <TableHeaderCell className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                </TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                    <Combobox value={selectedModel} onChange={(value) => setSelectedModel(value)} onClose={() => setqueryModel('')}>
                                        <div className="relative">
                                            <ComboboxInput
                                                className={clsx(
                                                    'w-full rounded-lg border-none bg-white/5 py-1.5 pl-3 text-sm/6 text-white',
                                                    'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                                                )}
                                                displayValue={(model) => model?.modelName}
                                                onChange={(event) => setqueryModel(event.target.value)}
                                            />
                                            <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                                                <ChevronDownIcon className="size-4 fill-white/60 group-data-[hover]:fill-white" />
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
                                <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                    <Button
                                        className="flex justify-end"
                                        variant="primary"
                                        color="indigo"
                                        onClick={updateModel}
                                    >Save</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            ) : (
                <>?????????</>
            )}
        </div>
    )
}

export default LLMModelSettingScreen;
