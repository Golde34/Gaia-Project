import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Metric, Text, Badge, Subtitle } from "@tremor/react";
import { getTimeBubbleConfig } from "../../api/store/actions/schedule_plan/schedule-calendar.action";
import { queryTaskConfig } from "../../api/store/actions/onboarding/task-registration.actions";

const FinishOnboarding = ({ onNext, onSkip, onPrevious }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState({
    timeBubble: { ok: false, notReadyMessage: null },
    taskConfig: { ok: false, notReadyMessage: null },
    work: { ok: false, notReadyMessage: null }, // gộp Task + Schedule
  });
  const [loading, setLoading] = useState(true);

  const timeBubbleConfigList = useSelector((state) => state.getTimeBubbleConfig);
  const { config: timeBubbleConfig, loading: loadingBubble, error: errorBubble } = timeBubbleConfigList;

  const taskConfigState = useSelector((state) => state.queryTaskConfig);
  const { loading: loadingTask, error: errorTask, taskRegistry: taskConfigData } = taskConfigState;

  const didFetch = useRef(false);
  const fetchStatus = useCallback(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    setLoading(true);
    dispatch(getTimeBubbleConfig());
    dispatch(queryTaskConfig());
  }, [dispatch]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    // ---- TimeBubble ----
    let timeBubble = { ok: false, notReadyMessage: null };
    if (errorBubble) {
      timeBubble.notReadyMessage = "Failed to fetch Time Bubble info.";
    } else if (!timeBubbleConfig?.data?.timeBubbleConfig?.[0]) {
      timeBubble.notReadyMessage = "No Time Bubble found.";
    } else {
      const draft = timeBubbleConfig.data.timeBubbleConfig[0]?.find?.((b) => b?.status === "DRAFT");
      if (draft) {
        timeBubble.notReadyMessage = "Time Bubble is in DRAFT.";
      } else {
        timeBubble = { ok: true, notReadyMessage: null };
      }
    }

    // ---- TaskConfig + Work ----
    let taskConfig = { ok: false, notReadyMessage: null };
    let work = { ok: false, notReadyMessage: null };

    if (errorTask) {
      taskConfig.notReadyMessage = "Failed to fetch Task Config.";
      work.notReadyMessage = "Cannot verify Tasks & Schedule.";
    } else if (!taskConfigData) {
      taskConfig.notReadyMessage = "Task Config not registered.";
      work.notReadyMessage = "Tasks & Schedule are unavailable.";
    } else {
      const { queryTaskConfig: qc, isTaskExisted, isScheduleExisted } = taskConfigData || {};
      const hasTaskConfig = !!qc?.isTaskConfigExist;

      taskConfig = hasTaskConfig
        ? { ok: true, notReadyMessage: null }
        : { ok: false, notReadyMessage: "Task Config not registered." };

      // gộp: chỉ ok khi cả task & schedule đều tồn tại
      if (isTaskExisted && isScheduleExisted) {
        work = { ok: true, notReadyMessage: null };
      } else {
        work = {
          ok: false,
          notReadyMessage: !isTaskExisted
            ? "No Task found."
            : "No Schedule Plan found.",
        };
      }
    }

    setStatus({ timeBubble, taskConfig, work });

    if (!loadingBubble && !loadingTask) setLoading(false);
  }, [timeBubbleConfig, errorBubble, taskConfigData, errorTask, loadingBubble, loadingTask]);

  const getFriendlyMessage = (s) => {
    if (s.timeBubble.ok && s.taskConfig.ok && s.work.ok) return "🎉 There you go, all setup is done!";
    const okCount = [s.timeBubble, s.taskConfig, s.work].filter((x) => x.ok).length;
    if (okCount >= 2) return "👍 You are almost done! Just a few more steps.";
    if (okCount >= 1) return "👌 That's okay, you can configure the rest later!";
    return "Let's get started with your setup!";
  };

  return (
    <>
      {loading ? (
        <Text>Checking status...</Text>
      ) : (
        <>
          <Metric className="mb-4 text-3xl">{getFriendlyMessage(status)}</Metric>

          <Card className="p-6 max-w-xl mx-auto mt-10">
            <div className="space-y-6">
              {/* Time Bubble */}
              <div>
                <Subtitle className="mt-2">
                  {status.timeBubble.ok
                    ? "🕒 Daily schedule with AI"
                    : "AI Calendar is not ready yet."}
                </Subtitle>
                <Badge
                  color={status.timeBubble.ok ? "green" : "yellow"}
                  className="mt-2 text-base px-4 py-2 rounded-full"
                >
                  {status.timeBubble.ok ? "Ready! 🎉" : "Not Ready 😢"}
                </Badge>
                {!status.timeBubble.ok && status.timeBubble.notReadyMessage && (
                  <Text className="mt-2">{status.timeBubble.notReadyMessage}</Text>
                )}
              </div>

              {/* Task Config */}
              <div>
                <Subtitle className="mt-2">
                  {status.taskConfig.ok
                    ? "⚡ Working efficiently with Optimize algorithm"
                    : "AI Work Optimization is not ready yet."}
                </Subtitle>
                <Badge
                  color={status.taskConfig.ok ? "green" : "yellow"}
                  className="mt-2 text-base px-4 py-2 rounded-full"
                >
                  {status.taskConfig.ok ? "Ready! 🚀" : "Not Ready 😢"}
                </Badge>
                {!status.taskConfig.ok && status.taskConfig.notReadyMessage && (
                  <Text className="mt-2">{status.taskConfig.notReadyMessage}</Text>
                )}
              </div>

              {/* Work (Tasks + Schedule) */}
              <div>
                <Subtitle className="mt-2">
                  {status.work.ok
                    ? "📋 Tasks Management & Schedule are ready"
                    : "Tasks Management & Schedule setup is not ready yet."}
                </Subtitle>
                <Badge
                  color={status.work.ok ? "green" : "yellow"}
                  className="mt-2 text-base px-4 py-2 rounded-full"
                >
                  {status.work.ok ? "Ready! 🛠 Project & Schedule" : "Not Ready 😢"}
                </Badge>
                {!status.work.ok && status.work.notReadyMessage && (
                  <Text className="mt-2">{status.work.notReadyMessage}</Text>
                )}
              </div>
            </div>
          </Card>

          <div className="mt-6 flex justify-center gap-2">
            <Button variant="secondary" onClick={onPrevious}>Back</Button>
            <Button variant="light" onClick={onSkip}>Skip</Button>
            <Button variant="primary" onClick={onNext}>Continue</Button>
          </div>
        </>
      )}
    </>
  );
};

export default FinishOnboarding;
