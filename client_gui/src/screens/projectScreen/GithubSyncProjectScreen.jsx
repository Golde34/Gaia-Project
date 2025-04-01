import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteProjectCommit, getProjectsAndRepos, syncProjectAndRepo } from "../../api/store/actions/contribution_tracker/project-commit.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import { Button, Card, Flex, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Title } from "@tremor/react";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/solid";

const GithubSyncProjectScreen = (props) => {
    const user = props.user;

    const dispatch = useDispatch();

    const projectsAndRepos = useSelector(state => state.projectsAndRepos);
    const { loading, error, projectAndRepo } = projectsAndRepos;
    const projectsAndReposDispatch = useCallback(() => {
        dispatch(getProjectsAndRepos(user.id));
    }, [dispatch, user.id]);
    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            projectsAndReposDispatch();
        }, 200);
    }, []);

    const [selectedProject, setSelectedProject] = useState('');
    const [queryProject, setQueryProject] = useState('');
    const [selectedRepo, setSelectedRepo] = useState('');
    const [queryRepo, setQueryRepo] = useState('');

    const filterProjects = queryProject === ''
        ? projectAndRepo?.listAllProjectsByUserId
        : projectAndRepo?.listAllProjectsByUserId.filter((project) => project.name.toLowerCase().includes(queryProject.toLowerCase()));
    const filteredRepos = queryRepo === ''
        ? projectAndRepo?.getAllGithubRepos
        : projectAndRepo?.getAllGithubRepos.filter((repo) => repo.name.toLowerCase().includes(queryRepo.toLowerCase()));
    const getProjectCommitList = projectAndRepo?.getProjectCommitList;

    const synchorizeProjectAndRepo = () => {
        dispatch(syncProjectAndRepo(user.id.toString(), selectedProject, selectedRepo));
        window.location.reload();
    }

    const [viewedProject, setViewedProject] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const closeModal = () => {
        setIsOpen(false);
    }
    const openModal = (projectId) => {
        setIsOpen(true);
        setViewedProject(projectId);
    }

    const deleteProjectAndRepo = () => {
        dispatch(deleteProjectCommit(user.id.toString(), viewedProject));
        window.location.reload();
    }

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <MessageBox message={error}></MessageBox>
            ) : projectAndRepo ? (
                <>
                    <Card className="w-full">
                        <Flex justifyContent="center" alignItems="center" className="mb-4">
                            <Title className="text-white text-xl font-bold">Github Project Synchronization</Title>
                        </Flex>
                        <Table className="mt-8">
                            <TableHead>
                                <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                                    <TableHeaderCell className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                        Project
                                    </TableHeaderCell>
                                    <TableHeaderCell className="text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                        Github Repository
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
                                                <ComboboxInput
                                                    className={clsx(
                                                        'w-full rounded-lg border-none bg-white/5 py-1.5 pl-3 text-sm/6 text-white',
                                                        'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                                                    )}
                                                    displayValue={(project) => project?.name}
                                                    onChange={(event) => setQueryProject(event.target.value)}
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
                                            </ComboboxOptions>
                                        </Combobox>
                                    </TableCell>
                                    <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                        <Combobox value={selectedRepo} onChange={(value) => setSelectedRepo(value)} onClose={() => setQueryRepo('')}>
                                            <div className="relative">
                                                <ComboboxInput
                                                    className={clsx(
                                                        'w-full rounded-lg border-none bg-white/5 py-1.5 pl-3 text-sm/6 text-white',
                                                        'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                                                    )}
                                                    displayValue={(repo) => repo?.name}
                                                    onChange={(event) => setQueryRepo(event.target.value)}
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
                                                {filteredRepos.map((project) => (
                                                    <ComboboxOption
                                                        key={project.id}
                                                        value={project}
                                                        className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                                                    >
                                                        <CheckIcon className="invisible size-4 group-data-[selected]:visible" />
                                                        {project.name}
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
                                            onClick={synchorizeProjectAndRepo}
                                        >Synchronize</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
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
                                                Remove Synchronized Project and Repository
                                            </DialogTitle>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Do you really want to delete this item?
                                                </p>
                                            </div>

                                            <div className="mt-4">
                                                <button
                                                    type="button"
                                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                    onClick={() => {
                                                        deleteProjectAndRepo();
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
            ) : (
                <></>
            )}
        </div>
    )
}

export default GithubSyncProjectScreen;