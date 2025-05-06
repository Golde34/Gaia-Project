import { Card, Col, Flex, Grid, Metric, Subtitle, Text } from "@tremor/react"
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef } from "react";
import MessageBox from "../../components/subComponents/MessageBox";
import { scheduleGroupList } from "../../api/store/actions/schedule_plan/schedule-group.action";
import { CreateScheduleGroupDialog } from "./CreateScheduleGroup";
import EllipsisMenu from "../../components/EllipsisMenu";

export const ScheduleGroups = (props) => {
    const dispatch = useDispatch();

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
    }, []);

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
                <>
                    <Card>
                        <Grid numItems={12}>
                            <Col numColSpan={7}>
                                <Flex justifyContent="end">
                                    <Subtitle className="text-xl font-bold text-gray-800">
                                        Your Schedule Tasks
                                    </Subtitle>
                                </Flex>
                            </Col>
                            <Col numColSpan={5}>
                                <Flex justifyContent='end'>
                                    <CreateScheduleGroupDialog />
                                </Flex>
                            </Col>
                        </Grid>
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
                    </Card>
                </>
            )
            }
        </div>
    )
}