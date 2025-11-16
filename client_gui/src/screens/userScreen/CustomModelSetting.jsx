import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageBox from "../../components/subComponents/MessageBox";
import { Card, Flex, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Title } from "@tremor/react";
import { getUserLLMModels } from "../../api/store/actions/chat_hub/user-llm-models.actions";

const CustomModelSetting = (props) => {
    const dispatch = useDispatch();

    const allModels = props.allModels;

    const userLlmModels = useSelector(state => state.userLLMModels);
    const { loading, error, userLLMModelInfo } = userLlmModels;
    const findUserLLMModelInfo = useCallback(() => {
        dispatch(getUserLLMModels());
    }, [dispatch]);
    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            findUserLLMModelInfo();
        }, 200);
        console.log("userLLMModelInfo: ", userLLMModelInfo);
    }, []);

    return (
        <>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <MessageBox message={error}></MessageBox>
            ) : userLLMModelInfo ? (
                <Card>
                    <Flex justifyContent="center" alignItems="center" className="mb-">
                        <Title className="text-white text-xl font-bold">Your Custom LLM Models</Title>
                    </Flex>
                    <Table className="mt-8">
                        <TableHead>
                            <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                                <TableHeaderCell className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                    Models 
                                </TableHeaderCell>
                                <TableHeaderCell className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                    Key 
                                </TableHeaderCell>
                                <TableHeaderCell className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                    Action
                                </TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                getProjectCommitList.length === 0 ? (
                                    <></>
                                ) : (
                                    getProjectCommitList.map((project) => (
                                        <TableRow key={project.id} className="border-b border-tremor-border dark:border-dark-tremor-border">
                                            <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                                {project.projectName}
                                            </TableCell>
                                            <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                                {project.githubRepo}
                                            </TableCell>
                                            <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                                <Button

                                                    className="flex justify-end"
                                                    variant="primary"
                                                    color="red"
                                                    onClick={() => openModal(project.id)}
                                                >Remove</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
                            }
                            <TableRow>
                                <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                    <Combobox value={selectedProject} onChange={(value) => setSelectedProject(value)} onClose={() => setQueryProject('')}>
                                        <div className="relative">
                                            {/* <ComboboxInput
                                                className={clsx(
                                                    'w-full rounded-lg border-none bg-white/5 py-1.5 pl-3 text-sm/6 text-white',
                                                    'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                                                )}
                                                displayValue={(project) => project?.name}
                                                onChange={(event) => setQueryProject(event.target.value)}
                                            />
                                            <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                                                <ChevronDownIcon className="size-4 fill-white/60 group-data-[hover]:fill-white" />
                                            </ComboboxButton> */}
                                        </div>
                                        {/* <ComboboxOptions
                                            anchor="bottom"
                                            transition
                                            className={clsx(
                                                'w-[var(--input-width)] rounded-xl border border-white/5 bg-white p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
                                                'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
                                            )}
                                        >
                                            {filterProjects.map((project) => (
                                                <ComboboxOption
                                                    key={project.id}
                                                    value={project}
                                                    className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                                                >
                                                    <CheckIcon className="invisible size-4 group-data-[selected]:visible" />
                                                    {project.name}
                                                </ComboboxOption>
                                            ))}
                                        </ComboboxOptions> */}
                                    </Combobox>
                                </TableCell>
                                <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                </TableCell>
                                <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                    <Button
                                        className="flex justify-end"
                                        variant="primary"
                                        color="indigo"
                                        onClick={synchorizeProjectAndRepo}
                                    >Save</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            ) : (
                <></>
            )}
        </>
    )
}

export default CustomModelSetting;