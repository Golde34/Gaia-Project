import { Badge, BadgeDelta, Card, Col, Flex, Grid, Metric, Text } from "@tremor/react"
import { useNavigate } from "react-router-dom";
import { priorityColor, shortenTitle, statusColor } from "../../kernels/utils/field-utils";

const CardItem = (props) => {
    const navigate = useNavigate();

    const navigateWord = props.navigateWord;
    const projectId = props.projectId;
    const groupTaskId = props.groupTaskId;
    const task = props.task;
    const taskId = props.taskId;

    const redirectToTaskDetail = () => {
        if (navigateWord === "project") {
            navigate(`/project/${projectId}`);
            localStorage.setItem("activeTab", groupTaskId);
        } else {
            navigate(`/task/detail/${taskId}`);
        }
    }

    return (
        <>
            <button onClick={() => { redirectToTaskDetail() }} className="me-4 mb-4">
                <Card className="w-full" decoration="top" decorationColor="indigo" style={{ maxWidth: '325px', maxHeight: '200px', minHeight: '160px', minWidth: '325px' }}>
                    <Metric>{shortenTitle(task.title)}</Metric>
                    <Grid numItems={2}>
                        <Col numColSpan={1}>
                            <Flex justifyContent="start">
                                {task.priority.map((priority) => (
                                    <Badge key={`${task.id}-${priority}`} className="me-1 mt-1" color={priorityColor(priority)}>{priority}</Badge>
                                ))}
                            </Flex>
                        </Col>
                        <Col numColSpan={1}>
                            <Flex justifyContent="end">
                                <BadgeDelta className="ms-1 mt-1" deltaType={statusColor(task.status)}>{task.status}</BadgeDelta>
                            </Flex>
                        </Col>
                    </Grid>

                    <Text className="line-clamp-3 mt-1"> {task.description} </Text>
                </Card>
            </button>
        </>
    );
};

export default CardItem;