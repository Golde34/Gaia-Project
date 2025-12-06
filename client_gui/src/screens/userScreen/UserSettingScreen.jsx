import { useEffect, useState } from "react";
import { useUpdateUserSettingDispatch } from "../../kernels/utils/write-dialog-api-requests";
import { Button, Card, Col, Flex, Grid, Subtitle, Title } from "@tremor/react";
import { RadioButton } from "../../components/subComponents/RadioButton";

const UserSettingScreen = (props) => {
    const user = props.user;

    const [optimizedTaskConfig, setOptimizedTaskConfig] = useState('1');
    const [privateProfileConfig, setPrivateProfileConfig] = useState('1');
    const [taskSortingAlgorithm, setTaskSortingAlgorithm] = useState('1');
    const [autoOptimizeConfig, setAutoOptimizeConfig] = useState('1');

    const [initialSettings, setInitialSettings] = useState(null);
    const [isChanged, setIsChanged] = useState(false);
    useEffect(() => {
        if (user && user.userSetting) {
            const initial = {
                optimizedTaskConfig: user.userSetting.optimizedTaskConfig?.toString() || '1',
                privateProfileConfig: user.userSetting.privateProfileConfig?.toString() || '1',
                taskSortingAlgorithm: user.userSetting.taskSortingAlgorithm?.toString() || '1',
                autoOptimizeConfig: user.userSetting.autoOptimizeConfig?.toString() || '1',
            };
            setOptimizedTaskConfig(initial.optimizedTaskConfig);
            setPrivateProfileConfig(initial.privateProfileConfig);
            setTaskSortingAlgorithm(initial.taskSortingAlgorithm);
            setAutoOptimizeConfig(initial.autoOptimizeConfig);

            setInitialSettings(initial);
        }
    }, [user]);
    useEffect(() => {
        if (initialSettings) {
            const hasChanged =
                optimizedTaskConfig !== initialSettings.optimizedTaskConfig ||
                privateProfileConfig !== initialSettings.privateProfileConfig ||
                taskSortingAlgorithm !== initialSettings.taskSortingAlgorithm ||
                autoOptimizeConfig !== initialSettings.autoOptimizeConfig;
            setIsChanged(hasChanged);
        }
    }, [optimizedTaskConfig, privateProfileConfig, taskSortingAlgorithm, autoOptimizeConfig, initialSettings]);


    const [userSetting, setUserSetting] = useState({});
    const updateUserSetting = useUpdateUserSettingDispatch();
    const setUserSettingObject = (optimizedTaskConfig, privateProfileConfig, taskSortingAlgorithm, autoOptimizeConfig) => {
        if (!isChanged) {
            return;
        }
        userSetting.optimizedTaskConfig = Number(optimizedTaskConfig);
        userSetting.privateProfileConfig = Number(privateProfileConfig);
        userSetting.taskSortingAlgorithm = Number(taskSortingAlgorithm);
        userSetting.autoOptimizeConfig = Number(autoOptimizeConfig);
        console.log(userSetting);
        updateUserSetting(userSetting);
        window.location.reload();
    }

    return (
        <Card className='max-w-full mx-auto'>
            <Flex justifyContent="center" alignItems="center" className="mb-4">
                <Title className="text-white text-xl font-bold">User Setting</Title>
            </Flex>
            <Grid numItems={1} className="mt-4">
                <Col numColSpan={1}>
                    <Subtitle>Private Profile</Subtitle>
                </Col>
                <Col numColSpan={1}>
                    <div className="grid grid-cols-2 m-1">
                        <RadioButton
                            id="profile-radio-public"
                            value="1"
                            getter={privateProfileConfig}
                            setter={setPrivateProfileConfig}
                            color="blue"
                            label="Public" />
                        <RadioButton
                            id="profile-radio-private"
                            value="0"
                            getter={privateProfileConfig}
                            setter={setPrivateProfileConfig}
                            color="red"
                            label="Private" />
                    </div>
                </Col>

                <Col numColSpan={1}>
                    <Subtitle>Optimize Task Config</Subtitle>
                </Col>
                <div className="grid grid-cols-4 m-1">
                    <RadioButton
                        id="optimize-task-radio-1"
                        value="1"
                        getter={optimizedTaskConfig}
                        setter={setOptimizedTaskConfig}
                        color="indigo"
                        label="Optimize all tasks" />
                    <RadioButton
                        id="optimize-task-radio-2"
                        value="2"
                        getter={optimizedTaskConfig}
                        setter={setOptimizedTaskConfig}
                        color="indigo"
                        label="Optimize registered tasks in day" />
                    <RadioButton
                        id="optimize-task-radio-3"
                        value="3"
                        getter={optimizedTaskConfig}
                        setter={setOptimizedTaskConfig}
                        color="indigo"
                        label="Optimize tasks by type" />
                    <RadioButton
                        id="optimize-task-radio-4"
                        value="4"
                        getter={optimizedTaskConfig}
                        setter={setOptimizedTaskConfig}
                        color="indigo"
                        label="Disable Task Optimization" />
                </div>

                <Col numColSpan={1}>
                    <Subtitle>Task Sorting Algorithm</Subtitle>
                </Col>
                <Col numColSpan={1}>
                    <div className="grid grid-cols-4 m-1">
                        <RadioButton
                            id="tsa-radio-1"
                            value="1"
                            getter={taskSortingAlgorithm}
                            setter={setTaskSortingAlgorithm}
                            color="green"
                            label="Priority" />
                        <RadioButton
                            id="tsa-radio-2"
                            value="2"
                            getter={taskSortingAlgorithm}
                            setter={setTaskSortingAlgorithm}
                            color="green"
                            label="Time" />
                        <RadioButton
                            id="tsa-radio-3"
                            value="3"
                            getter={taskSortingAlgorithm}
                            setter={setTaskSortingAlgorithm}
                            color="green"
                            label="Time and Priority" />
                        <RadioButton
                            id="tsa-radio-4"
                            value="4"
                            getter={taskSortingAlgorithm}
                            setter={setTaskSortingAlgorithm}
                            color="green"
                            label="Tabu Search" />
                    </div>
                </Col>
                <Col numColSpan={1}>
                    <Subtitle>Auto Optimize Config</Subtitle>
                </Col>
                <Col numColSpan={1}>
                    <div className="grid grid-cols-3 m-1">
                        <RadioButton
                            id="apc-radio-1"
                            value="1"
                            getter={autoOptimizeConfig}
                            setter={setAutoOptimizeConfig}
                            color="yellow"
                            label="Optimize when creating task" />
                        <RadioButton
                            id="apc-radio-2"
                            value="2"
                            getter={autoOptimizeConfig}
                            setter={setAutoOptimizeConfig}
                            color="yellow"
                            label="Optimize in fixed time" />
                        <RadioButton
                            id="apc-radio-3"
                            value="3"
                            getter={autoOptimizeConfig}
                            setter={setAutoOptimizeConfig}
                            color="yellow"
                            label="Disable Auto Optimize" />
                    </div>
                </Col>
                <Col numColSpan={1}>
                    <div className="flex justify-end mt-4">
                        <Button
                            className="p-2 rounded-lg mb-4"
                            variant="primary"
                            color="indigo"
                            onClick={() => {
                                setUserSettingObject(optimizedTaskConfig, privateProfileConfig, taskSortingAlgorithm, autoOptimizeConfig);
                            }}
                        > Save Settings</Button>
                    </div></Col>
            </Grid>
        </Card>
    )
}

export default UserSettingScreen;