import { Card, Metric, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import Template from "../../components/template/Template"
import { useParams } from "react-router-dom"
import TaskDashboard from "./TaskDashboard";
import AreaChartComponent from "../../components/subComponents/AreaChartComponent";

function ContentArea() {
    const projectId = useParams().id;
    return (
        <>
            <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                className="text-2xl font-bold text-gray-800"> Task Dashboard
            </Metric>
            <Card>
                <TabGroup className="mt-3" color="indigo">
                    <TabList>
                        <Tab>
                            <div className="grid grid-flow-col gap-4">
                                <div className="col-span-2 mt-1" >Task Dashboard</div>
                            </div>
                        </Tab>
                        <Tab>
                            <div className="grid grid-flow-col gap-4">
                                <div className="col-span-2 mt-1" >Project Statistic</div>
                            </div>
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <TaskDashboard projectId={projectId} />
                        </TabPanel>
                        <TabPanel>
                            <AreaChartComponent projectId={projectId} />
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </Card>
        </>
    )
}

const ProjectDetail = () => {
    return (
        <Template>
            <ContentArea />
        </Template>
    )
}

export default ProjectDetail;