import { Card, Col, Grid, Subtitle, Text } from "@tremor/react"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const ScheduleTasks = () => {
    const userId = "1";
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // const listScheduleTasks = useSelector(state => state.scheduleTaskList);
    // const { loading, error, scheduleTasks } = listScheduleTasks;

    function randomDecoration() {
        const colors = ["indigo", "red", "green", "blue", "yellow", "purple", "pink", "gray"];
        return colors[Math.floor(Math.random() * colors.length)]
    }

    return (
        <Card>
            <div className="flex gap-10 justify-center mt-5">
                <Subtitle className="text-xl font-bold text-gray-800"> Your Schedule Tasks </Subtitle>
            </div>
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
        </Card>
    )
}