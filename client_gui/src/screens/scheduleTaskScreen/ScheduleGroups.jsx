import { Button, Card, Col, Flex, Grid, Metric, Subtitle, Text } from "@tremor/react"
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef } from "react";
import MessageBox from "../../components/subComponents/MessageBox";
import { scheduleGroupList } from "../../api/store/actions/schedule_plan/schedule-group.action";
import { CreateScheduleGroupDialog } from "./CreateScheduleGroup";
import EllipsisMenu from "../../components/EllipsisMenu";
import Template from "../../components/template/Template";
import { useNavigate } from "react-router-dom";

const ScheduleGroups = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const listScheduleGroup = useSelector(state => state.scheduleGroupList);
    const { loading, error, scheduleGroups } = listScheduleGroup;
    const getTasks = useCallback(() => {
        dispatch(scheduleGroupList());
    }, [dispatch]);
    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getTasks();
        }, 200);
        return () => clearTimeout(debounceRef.current);
    }, [getTasks]);

    function randomDecoration() {
        const colors = ["indigo", "red", "green", "blue", "yellow", "purple", "pink", "gray"];
        return colors[Math.floor(Math.random() * colors.length)]
    }

    return (
        <div>
            {loading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <MessageBox message={error} />
            ) : (
                <Template>
                    <Metric className="mb-10">
                        Your Fixed Schedule Groups
                    </Metric>
                    <Card>
                        <Flex justifyContent='end'>
                            <CreateScheduleGroupDialog />
                        </Flex>
                        <Grid numItems={3} className="gap-7 mt-5">
                            {scheduleGroups.map((task) => (
                                <Col numColSpan={1} key={task.id}>
                                    <Card className="w-xs hover:cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300"
                                        decoration={"top"} decorationColor={randomDecoration()}>
                                        <Flex justifyContent="between" alignItems="center">
                                            <Metric>{task.title}</Metric>
                                            <EllipsisMenu elementName="Schedule Group" elementId={task.id} />
                                        </Flex>
                                        <Text> Duration: {task.duration} </Text>
                                        <Text> Start At: {task.startDate}</Text>
                                        <Text> End At: {task.deadline} </Text>
                                        <Text> Repeat: {task.repeat} </Text>
                                        <Text> Project: {task.projectName} </Text>
                                        <Text> Group Task: {task.groupTaskName} </Text>
                                    </Card>
                                </Col>
                            ))}
                        </Grid>
                        <Flex justifyContent="end">
                            <Button className="mt-5"
                                color="indigo"
                                variant="secondary"
                                onClick={() => navigate("/schedule")}>
                                Back to Schedule Plan
                            </Button>
                        </Flex>
                    </Card>
                </Template>
            )
            }
        </div>
    )
}

export default ScheduleGroups;