import { Card, Col, Flex, Grid, Subtitle, Text } from "@tremor/react"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CreateScheduleTaskDialog } from "./CreateScheduleTask";
import { useCallback, useEffect, useRef } from "react";
import { repeatScheduleTaskList } from "../../api/store/actions/schedule_plan/schedule-task.action";
import MessageBox from "../../components/subComponents/MessageBox";

export const ScheduleTasks = (props) => {
    const userId = "1";
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const listScheduleTasks = useSelector(state => state.repeatScheduleTaskList);
    const { loading, error, scheduleTasks } = listScheduleTasks;
    const getTasks = useCallback(() => {
        dispatch(repeatScheduleTaskList(userId));
    }, [dispatch, userId]);
    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getTasks();
        }, 200);
    }, [userId]);

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
                                    <CreateScheduleTaskDialog userId={userId} />
                                </Flex>
                            </Col>
                        </Grid>
                        <Grid numItems={3} className="gap-7 mt-5">
                            {scheduleTasks.map((task) => (
                                <Col numColSpan={1}>
                                    <Card className="w-xs hover:cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300"
                                        decoration={"top"} decorationColor={randomDecoration()}>
                                        <Subtitle className="text-xl font-bold text-gray-800"> {task.title} </Subtitle>
                                        <Text> Duration: {task.duration} </Text>
                                        <Text> Repeat: {task.repeat} </Text>
                                        <Text> Project: {task.projectName} </Text>
                                        <Text> Group Task: {task.groupTaskName} </Text>
                                    </Card>
                                </Col>
                            ))}
                        </Grid>
                    </Card>
                    {/* <Card>
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
                                    <CreateScheduleTaskDialog userId={userId} />
                                </Flex>
                            </Col>
                        </Grid>
                        <Grid numItems={3} className="gap-7 mt-5">
                            <Col numColSpan={1}>
                                <Card className="w-xs hover:cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300"
                                    decoration={"top"} decorationColor={randomDecoration()}>
                                    <Subtitle className="text-xl font-bold text-gray-800"> Schedule Task 1 </Subtitle>
                                    <Text> Task 1 Description </Text>
                                    <Text> Start At: 5AM </Text>
                                    <Text> End At: 6AM </Text>
                                    <Text> Duration: 1 hour </Text>
                                    <Text> Notification: ON </Text>
                                    <Text> Repeat: Daily </Text>
                                    <Text> Project: Gaia </Text>
                                    <Text> Group Task: Schedule Task</Text>
                                </Card>
                            </Col>
                            <Col numColSpan={1}>
                                <Card className="w-xs hover:cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300"
                                    decoration={"top"} decorationColor={randomDecoration()}>
                                    <Subtitle className="text-xl font-bold text-gray-800"> Schedule Task 2 </Subtitle>
                                    <Text> Task 2 Description </Text>
                                    <Text> Start At: 6AM </Text>
                                    <Text> End At: 7AM </Text>
                                    <Text> Duration: 1 hour </Text>
                                    <Text> Notification: ON </Text>
                                    <Text> Repeat: Daily </Text>
                                    <Text> Project: Gaia </Text>
                                    <Text> Group Task: Schedule Task</Text>
                                </Card>
                            </Col>
                            <Col numColSpan={1}>
                                <Card className="w-xs hover:cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300"
                                    decoration={"top"} decorationColor={randomDecoration()}>
                                    <Subtitle className="text-xl font-bold text-gray-800"> Schedule Task 3 </Subtitle>
                                    <Text> Task 3 Description </Text>
                                    <Text> Start At: 7AM </Text>
                                    <Text> End At: 8AM </Text>
                                    <Text> Duration: 1 hour </Text>
                                    <Text> Notification: ON </Text>
                                    <Text> Repeat: Daily </Text>
                                    <Text> Project: Gaia </Text>
                                    <Text> Group Task: Schedule Task</Text>
                                </Card>
                            </Col>
                        </Grid>
                    </Card> */}
                </>
            )
            }
        </div>
    )
}