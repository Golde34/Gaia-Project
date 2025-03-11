import { ArrowCircleRightIcon } from "@heroicons/react/solid";
import { Col, Flex, Grid, Tab, TabGroup, TabList, TabPanels } from "@tremor/react"
import { useState } from "react";
import EllipsisMenu from "../../components/EllipsisMenu";
import { CreateNewGroupTask } from "./CreateNewGroupTask";
import { CreateTaskDialog } from "../taskScreen/CreateTaskDialog";
import TaskList from "../taskScreen/TaskList";
import TaskProgress from "../taskScreen/TaskProgress";
import TaskTable from "../taskScreen/TaskTable";

const TabGroupTask = (props) => {
    const isTableView = props.isTableView;
    const groupTasks = props.groupTasks;
    const projectId = props.projectId;

    const [activeTab, setActiveTab] = useState(null);

    if (activeTab === null || activeTab === undefined) {
        if (localStorage.getItem("activeTab") === 'none') {
            localStorage.setItem("activeTab", groupTasks[0].id);
            setActiveTab(groupTasks[0].id);
        } else {
            setActiveTab(localStorage.getItem("activeTab"));
        }
    }

    const handleTabChange = (tabId) => {
        localStorage.setItem("activeTab", tabId);
        setActiveTab(localStorage.getItem("activeTab"));
    }

    return (
        <TabGroup className="mt-3" color="indigo">
            <TabList>
                {groupTasks.map((groupTask) => (
                    <div key={groupTask.id}>
                        <Flex>
                            <Tab
                                key={groupTask.id}
                                icon={activeTab === groupTask.id ? ArrowCircleRightIcon : null}
                                onClick={() => handleTabChange(groupTask.id)}
                                style={
                                    activeTab === groupTask.id
                                        ? { color: "#6366f1", fontSize: "20px" }
                                        : { color: "white", fontSize: "20px" }
                                }
                            >
                                <div className="grid grid-flow-col gap-4">
                                    <div className="col-span-2 mt-1" >{groupTask.title}</div>
                                </div>
                            </Tab>
                            <EllipsisMenu elementName="Group Task" elementId={groupTask.id} projectId={projectId} />
                        </Flex>
                    </div>
                ))}
                <CreateNewGroupTask />
            </TabList>
            <TabPanels>
                {groupTasks.map((groupTask) => (
                    <div key={groupTask.id}>
                        {activeTab && activeTab === groupTask.id ? (
                            <>
                                <div className="mt-10">
                                    <Grid numItems={12} className="gap-2">
                                        <Col numColSpan={10}>
                                            {activeTab && activeTab === groupTask.id && (
                                                <TaskProgress groupTaskId={groupTasks[0].id} activeTab={activeTab} />
                                            )}
                                        </Col>
                                        <Col numColSpan={2} className="mt-4">
                                            <div className="flex justify-center">
                                                <CreateTaskDialog groupTaskId={activeTab} />
                                            </div>
                                        </Col>
                                    </Grid>
                                </div>
                                <>
                                    {isTableView ? (
                                        <TaskTable groupTaskId={activeTab} />
                                    ) : (
                                        <TaskList groupTaskId={activeTab} projectId={projectId} />
                                    )}
                                </>
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                ))}
            </TabPanels>
        </TabGroup>
    )
}

export default TabGroupTask;