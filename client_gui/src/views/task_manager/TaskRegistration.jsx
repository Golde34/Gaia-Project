import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import Template from "../../components/template/Template";
import { Button, Card, CategoryBar, Col, Flex, Grid, Legend, Metric, NumberInput, Subtitle, Text, TextInput, Title } from "@tremor/react";
import { formatHourNumber } from "../../kernels/utils/date-picker";
import { queryTaskConfig, registerTaskConfig } from "../../api/store/actions/work_optimization/task-registration.actions";
import ProjectList from "./ProjectList";
import SchedulingTable from "../schedule_plan/SchedulingTable";
import { isNullOrUndefined } from "../../kernels/utils/cn";

function ContentArea(props) {
    const dispatch = useDispatch();
    const redirectPage = props.redirectPage;

    const [ validateErrors, setValidateErrors ] = useState({});
    const userId = "1";
    const [sleepTime, setSleepTime] = useState(0);
    const [startSleepTime, setStartSleepTime] = useState("");
    const [endSleepTime, setEndSleepTime] = useState("");
    const [relaxTime, setRelaxTime] = useState(0);
    const [travelTime, setTravelTime] = useState(0);
    const [eatTime, setEatTime] = useState(0);
    const [workTime, setWorkTime] = useState(24);
    function handleWorkTime(newSleepTime, newRelaxTime, newEatTime, newTravelTime) {
        setWorkTime(24 - newSleepTime - newRelaxTime - newEatTime - newTravelTime);
    }
    function convertTimeToPercents(time) {
        return time * 100 / 24;
    }

    const validateFields = () => {
        const newErrors = {};
        if (isNullOrUndefined(startSleepTime)) newErrors.startSleepTime = "Start sleep time is required";
        if (isNullOrUndefined(endSleepTime)) newErrors.endSleepTime = "End sleep time is required";
        if (relaxTime < 0 || relaxTime > 24) newErrors.relaxTime = "Please enter a valid number between 0 and 24";
        if (eatTime < 0 || eatTime > 24) newErrors.eatTime = "Please enter a valid number between 0 and 24";
        if (travelTime < 0 || travelTime > 24) newErrors.travelTime = "Please enter a valid number between 0 and 24";
        setValidateErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const setTaskConfigObject = (sleepDuration, startSleepTime, endSleepTime, relaxTime, eatTime, travelTime, workTime) => {
        if (!validateFields()) return;

        const taskConfig = {
            userId: parseInt(userId),
            sleepDuration: parseInt(sleepDuration),
            startSleepTime: startSleepTime,
            endSleepTime: endSleepTime,
            relaxTime: parseInt(relaxTime),
            eatTime: parseInt(eatTime),
            travelTime: parseInt(travelTime),
            workTime: parseInt(workTime)
        }
        dispatch(registerTaskConfig(taskConfig))
            .then(response => {
                if (response.taskConfigStatus === true) {
                    if (redirectPage === "Task Manager") {
                        window.location.href = "/client-gui/project";
                    }
                    if (redirectPage === "Schedule Plan") {
                        window.location.href = "/client-gui/schedule";
                    }
                }
            })
            .catch(error => {
                console.log("Task Config registration failed: ", error);
            })
        // window.location.reload();
    }

    return (
        <>
            <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                className="text-2xl font-bold text-gray-800">Task Registration
            </Metric>
            <Grid numItems={12} className="gap-2">
                <Col numColSpan={12}>
                    <Card className="mt-5" style={{ textAlign: "start" }}>
                        <Title className="text-xl">Introduce</Title>
                        <Text>First you need to calculate your work time by your self. Base on your estimate we will optimize your tasks durings your work day.</Text>
                    </Card>
                </Col>
                <Col numColSpan={6}>
                    <Card className="mt-4">
                        <Grid numItems={6}>
                            <Col numColSpan={6}>
                                <Title>How much time do you spend sleeping?</Title>
                            </Col>
                            <Col numColSpan={2}>
                                <Legend
                                    className="mt-4"
                                    categories={['Sleeping Time']}
                                    colors={['indigo']}
                                />
                            </Col>
                            <Col numColSpan={4}>
                                <NumberInput
                                    className="mt-3"
                                    placeholder="Enter your sleep time..."
                                    min={0}
                                    max={24}
                                    value={sleepTime}
                                    onChange={e => {
                                        const newSleepTime = e.target.value;
                                        setSleepTime(newSleepTime)
                                        handleWorkTime(newSleepTime, relaxTime, eatTime, travelTime)
                                    }}
                                    error={formatHourNumber(sleepTime)}
                                    errorMessage="Please enter a valid number between 0 and 24"
                                />
                            </Col>
                            <Col numColSpan={6}>
                                <Title className="mt-4">
                                    What time do you usually sleep?
                                </Title>
                            </Col>
                            <Col numColSpan={3}>
                                <TextInput
                                    className="me-2 mt-3"
                                    style={{ backgroundColor: "white", color: "black" }}
                                    placeholder="Enter your sleep time..."
                                    type="time"
                                    value={startSleepTime}
                                    onChange={e => { setStartSleepTime(e.target.value) }}
                                    error={isNullOrUndefined(startSleepTime)}
                                    errorMessage="Please enter a valid time"
                                />
                            </Col>
                            <Col numColSpan={3}>
                                <TextInput
                                    className="ms-2 mt-3 text-white"
                                    style={{ backgroundColor: "white", color: "black" }}
                                    placeholder="Enter your sleep time..."
                                    type="time"
                                    value={endSleepTime}
                                    onChange={e => { setEndSleepTime(e.target.value) }}
                                    error={isNullOrUndefined(endSleepTime)}
                                    errorMessage="Please enter a valid time"
                                />
                            </Col>
                        </Grid>
                    </Card>
                </Col>
                <Col numColSpan={6}>
                    <Card className="mt-4">
                        <Title>How much time do you spend relaxing, eating, and traveling?</Title>
                        <Grid numItems={6}>
                            <Col numColSpan={2}>
                                <Legend
                                    className="mt-4"
                                    categories={['Relaxing']}
                                    colors={['blue']}
                                />
                            </Col>
                            <Col numColSpan={4}>
                                <NumberInput
                                    className="mt-4"
                                    placeholder="Enter your relax time..."
                                    min={0}
                                    max={24}
                                    value={relaxTime}
                                    onChange={e => {
                                        const newRelaxTime = e.target.value;
                                        setRelaxTime(newRelaxTime)
                                        handleWorkTime(sleepTime, newRelaxTime, eatTime, travelTime)
                                    }}
                                    error={formatHourNumber(relaxTime)}
                                    errorMessage="Please enter a valid number between 0 and 24"
                                />
                            </Col>
                            <Col numColSpan={2}>
                                <Legend
                                    className="mt-2"
                                    categories={['Eating']}
                                    colors={['yellow']}
                                />
                            </Col>
                            <Col numColSpan={4}>
                                <NumberInput
                                    className="mt-2"
                                    placeholder="Enter your eat time..."
                                    min={0}
                                    max={24}
                                    value={eatTime}
                                    onChange={e => {
                                        const newEatTime = e.target.value;
                                        setEatTime(newEatTime)
                                        handleWorkTime(sleepTime, relaxTime, newEatTime, travelTime)
                                    }}
                                    error={formatHourNumber(eatTime)}
                                    errorMessage="Please enter a valid number between 0 and 24"
                                />
                            </Col>
                            <Col numColSpan={2}>
                                <Legend
                                    className="mt-2"
                                    categories={['Traveling']}
                                    colors={['rose']}
                                />
                            </Col>
                            <Col numColSpan={4}>
                                <NumberInput
                                    className="mt-2"
                                    placeholder="Enter your travelling time..."
                                    min={0}
                                    max={24}
                                    value={travelTime}
                                    onChange={e => {
                                        const newTravelTime = e.target.value;
                                        setTravelTime(newTravelTime)
                                        handleWorkTime(sleepTime, relaxTime, eatTime, newTravelTime)
                                    }}
                                    error={formatHourNumber(travelTime)}
                                    errorMessage="Please enter a valid number between 0 and 24"
                                />
                            </Col>
                        </Grid>
                    </Card>
                </Col>
                <Col numColSpan={12}>
                    <Card className="mt-4">
                        <Grid numItems={8}>
                            <Col numColSpan={3}>
                                <Title>Is this amount of time of your work? </Title>
                                <Text>Your work time = 24 - sleepTime - relaxTime - travelTime</Text>
                            </Col>
                            <Col numColSpan={5}>
                                <Title> {workTime} hours</Title>
                                <CategoryBar
                                    values={[convertTimeToPercents(workTime), convertTimeToPercents(relaxTime),
                                    convertTimeToPercents(eatTime), convertTimeToPercents(travelTime), convertTimeToPercents(sleepTime)]}
                                    colors={['emerald', 'blue', 'yellow', 'rose', 'indigo']}
                                    className="mt-4"
                                    showLabels={false}
                                    showAnimation={true}
                                />
                            </Col>
                        </Grid>

                    </Card>
                </Col>

            </Grid>
            <Flex justifyContent="end">
                <Button className="mt-4 me-4"
                    variant="primary" color="red"
                    onClick={() => {
                        console.log("Skip");
                    }
                    }>
                    Skip
                </Button>
                <Button className="mt-4"
                    variant="primary" color="indigo"
                    onClick={() => {
                        setTaskConfigObject(sleepTime, startSleepTime, endSleepTime, relaxTime, eatTime, travelTime, workTime);
                    }
                    }>
                    Register
                </Button>
            </Flex>
        </>
    )
}

const TaskRegistration = (props) => {
    const [userId, setUserId] = useState("1");
    const redirectPage = props.redirectPage;
    const dispatch = useDispatch();

    const taskRegistration = useSelector((state) => state.queryTaskConfig);
    const { loading, error, taskRegistry } = taskRegistration;

    const taskConfig = useCallback(() => {
        dispatch(queryTaskConfig(userId));
    }, [dispatch, userId]);

    const debounceRef = useRef();

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            taskConfig();
        }, 50);
    }, []);

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>Error: {error}</div>
            ) : taskRegistry && redirectToScreen(taskRegistry, redirectPage) === "TM" ? (
                <ProjectList />
            ) : taskRegistry && redirectToScreen(taskRegistry, redirectPage) === "SP" ? (
                <SchedulingTable />
            ) : taskRegistry && redirectToScreen(taskRegistry, redirectPage) === null ? (
                <Template>
                    <ContentArea redirectPage={redirectPage} />
                </Template>
            ) : (
                <></>
            )}
        </>
    )
}

function redirectToScreen(taskRegistry, redirectPage) {
    if (taskRegistry.queryTaskConfig.isTaskConfigExist) {
        if (redirectPage === "Task Manager") {
            return "TM";
        }
        if (redirectPage === "Schedule Plan") {
            return "SP";
        }
    }
    return null;
}

export default TaskRegistration;