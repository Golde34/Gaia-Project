import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import { getGroupTaskList } from "../../api/store/actions/task_manager/group-task.actions";
import { Button, Card, Col, Flex, Grid, Switch, Text } from "@tremor/react";
import TabGroupTask from "../../screens/groupTaskScreen/TabGroupTask";
import { CreateTaskDialog } from "../../screens/taskScreen/CreateTaskDialog";
import { CreateNewGroupTask } from "../../screens/groupTaskScreen/CreateNewGroupTask";
import MessageBox from "../../components/subComponents/MessageBox";
import { useCookies } from "react-cookie";

const TaskDashboard = (props) => {
    const dispatch = useDispatch();

    const projectId = props.projectId;
    const [cookies] = useCookies(['accessToken'])
    console.log("my cookie: " + cookies.accessToken)

    const listGroupTasks = useSelector((state) => state.groupTaskList);
    const { loading, error, groupTasks } = listGroupTasks;
    const didGroupTasksRef = useRef();

    const getGroupTasks = useCallback(() => {
        dispatch(getGroupTaskList(projectId));
    }, [dispatch, projectId]);

    useEffect(() => {
        if (didGroupTasksRef.current) return;
        getGroupTasks();
        didGroupTasksRef.current = true;
    }, [projectId]);

    const getInititalView = () => {
        const savedView = localStorage.getItem("isTableView");
        return savedView ? JSON.parse(savedView) : false;
    }

    const [isTableView, setTableView] = useState(getInititalView);

    useEffect(() => {
        localStorage.setItem("isTableView", isTableView);
        localStorage.setItem(projectId, JSON.stringify(groupTasks));
    })

    const handleTableViewChange = () => {
        setTableView(!isTableView);
    }

    return (
        <div>
            {loading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <MessageBox message={error} />
            ) : (
                <>
                    <div className="flex justify-end">
                        <Switch
                            id="table-view-switch"
                            name="table-view-switch"
                            checked={isTableView}
                            className="me-2"
                            onChange={() => {
                                setTableView(!isTableView);
                                handleTableViewChange();
                            }} />
                        <label htmlFor="table-view-switch" className="me-5 ms-2"
                        ><Text className="mt-2 me-4">Table View</Text></label>
                        <button
                            type="button"
                            className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        >
                            <a href="/client-gui/schedule">Schedule Plan</a>
                        </button>
                    </div>
                    {
                        groupTasks.length === 0 ? (
                            <>
                                <Grid numItems={4} className="gap-2">
                                    <Col numColSpan={2}>
                                        <Card className="mt-5" style={{ textAlign: "center" }}>
                                            <CreateNewGroupTask gtStatus="new" />
                                            <Text className="mt-5">Creating a Group Task according to the correct process will help you control specific groups of tasks in your project.</Text>
                                            <Text className="mt-5 mb-5">Next, you will create Tasks and classify them into each Task Group.</Text>
                                        </Card>
                                    </Col>
                                    <Col numColSpan={2}>
                                        <Card className="mt-5" style={{ textAlign: "center" }}>
                                            <CreateTaskDialog projectId={projectId} />
                                            <Text className="mt-5">I also help you Create the Quick Task.</Text>
                                            <Text className="mt-5 mb-5">You will create a first task and Group Task will be your first Task. Rest assured that changes can be made later.</Text>
                                        </Card>
                                    </Col>

                                </Grid>
                                <a href="/client-gui/project" className="flex justify-center">
                                    <Button className="mt-5">Back</Button>
                                </a>
                            </>
                        ) : (
                            <>
                                <TabGroupTask groupTasks={groupTasks} projectId={projectId} isTableView={isTableView} />
                                <Flex className="mt-5" justifyContent="end">
                                    <a href="/client-gui/project">
                                        <Button>Back</Button>
                                    </a>
                                </Flex>
                            </>
                        )
                    }
                </>
            )
            }
        </div>
    )
}

export default TaskDashboard;
