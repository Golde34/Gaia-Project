import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Metric, Text, Badge } from "@tremor/react";
import { getTimeBubbleConfig } from "../../api/store/actions/schedule_plan/schedule-calendar.action";
import { queryTaskConfig } from "../../api/store/actions/onboarding/task-registration.actions";

const FinishOnboarding = ({ onNext, onSkip, onPrevious }) => {
    const dispatch = useDispatch();
    const [status, setStatus] = useState({
        timeBubble: null,
        taskConfig: null,
        task: null,
        schedulePlan: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get time bubble config
    const timeBubbleConfigList = useSelector(state => state.getTimeBubbleConfig);
    const { config: timeBubbleConfig, loading: loadingBubble, error: errorBubble } = timeBubbleConfigList;

    // Get task config
    const taskConfigState = useSelector(state => state.queryTaskConfig);
    const { loading: loadingTask, error: errorTask, data: taskConfigData } = taskConfigState;

    const fetchStatus = useCallback(() => {
        setLoading(true);
        setError(null);
        dispatch(getTimeBubbleConfig());
        dispatch(queryTaskConfig());
    }, [dispatch]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    useEffect(() => {
        // Check time bubble config
        let timeBubbleStatus = null;
        if (errorBubble) {
            timeBubbleStatus = { ok: false, message: "Failed to fetch Time Bubble info." };
        } else if (!timeBubbleConfig || !Array.isArray(timeBubbleConfig.data) || timeBubbleConfig.data.length === 0) {
            timeBubbleStatus = { ok: false, message: "No Time Bubble found. Cannot use Generate Daily Calendar feature." };
        } else {
            const draftBubble = timeBubbleConfig.data.find(b => b.status === "DRAFT");
            if (draftBubble) {
                timeBubbleStatus = { ok: false, message: "Time Bubble is in DRAFT status. Configuration not completed." };
            } else {
                timeBubbleStatus = { ok: true, message: "Time Bubble is created and completed." };
            }
        }

        // Check task config
        let taskConfigStatus = null;
        let taskStatus = null;
        let schedulePlanStatus = null;
        if (errorTask) {
            taskConfigStatus = { ok: false, message: "Failed to fetch Task Config info." };
        } else if (!taskConfigData || !taskConfigData.data) {
            taskConfigStatus = { ok: false, message: "Task Config not registered. Cannot use work optimization feature." };
        } else {
            const { isTaskConfigExisted, isTaskExisted, isScheduleExisted } = taskConfigData.data;
            taskConfigStatus = isTaskConfigExisted ? { ok: true, message: "Task Config registered." } : { ok: false, message: "Task Config not registered. Cannot use work optimization feature." };
            taskStatus = isTaskExisted ? { ok: true, message: "Task exists." } : { ok: false, message: "No Task found. Cannot use Project feature." };
            schedulePlanStatus = isScheduleExisted ? { ok: true, message: "Schedule Plan exists." } : { ok: false, message: "No Schedule Plan found. Cannot use Schedule feature." };
        }

        setStatus({
            timeBubble: timeBubbleStatus,
            taskConfig: taskConfigStatus,
            task: taskStatus,
            schedulePlan: schedulePlanStatus
        });
        setLoading(false);
    }, [timeBubbleConfig, errorBubble, taskConfigData, errorTask]);

    return (
        <Card className="p-6 max-w-xl mx-auto mt-10">
            <Metric className="mb-4">Finish Onboarding</Metric>
            {loading ? (
                <Text>Checking status...</Text>
            ) : (
                <div className="space-y-4">
                    <div>
                        <Text className="font-semibold">Time Bubble Check:</Text>
                        <Badge color={status.timeBubble?.ok ? "green" : "red"} className="ml-2">{status.timeBubble?.message}</Badge>
                    </div>
                    <div>
                        <Text className="font-semibold">Task Config Check:</Text>
                        <Badge color={status.taskConfig?.ok ? "green" : "red"} className="ml-2">{status.taskConfig?.message}</Badge>
                    </div>
                    <div>
                        <Text className="font-semibold">Task Check:</Text>
                        <Badge color={status.task?.ok ? "green" : "red"} className="ml-2">{status.task?.message}</Badge>
                    </div>
                    <div>
                        <Text className="font-semibold">Schedule Plan Check:</Text>
                        <Badge color={status.schedulePlan?.ok ? "green" : "red"} className="ml-2">{status.schedulePlan?.message}</Badge>
                    </div>
                </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={onPrevious}>Back</Button>
                <Button variant="light" onClick={onSkip}>Skip</Button>
                <Button variant="primary" onClick={onNext}>Continue</Button>
            </div>
        </Card>
    );
};

export default FinishOnboarding;