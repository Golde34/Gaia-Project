package wo.work_optimization.core.domain.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class TopicConstants {

    @UtilityClass
    public class SchedulePlanCommand {
        public static final String TOPIC = "schedule-plan.optimize-task.topic";

        public static final String OPTIMIZE_TASK = "optimizeTask";
    }

    @UtilityClass
    public class CreateTaskCommand {
        public static final String TOPIC = "task-manager.create-task.topic";

        public static final String CREATE_TASK = "taskManagerCreateTask";
        public static final String GAIA_CREATE_TASK = "gaiaCreateTask";
    }

    @UtilityClass
    public class CreateScheduleTaskCommand {
        public static final String CREATE_TOPIC = "schedule-plan.create-schedule-task.topic";
        public static final String SYNC_TOPIC = "schedule-plan.sync-schedule-task.topic";

        public static final String CREATE_SCHEDULE_TASK = "schedulePlanCreateTask";
        public static final String SYNC_SCHEDULE_TASK = "syncScheduleTask";
    }

    @UtilityClass
    public class OptimizeCommand {
        public static final String TOPIC = "work-optimization.optimize-task.topic";

        public static final String OPTIMIZE_CREATING_TASK = "optimizeCreatingTask";
    }

    @UtilityClass
    public class NotificationCommand {
        public static final String TOPIC = "notify-agent.optimize-task-notify.topic";

        public static final String INIT_OPTIMIZE_TASK_NOTIFY_CMD= "initOptimizeTask";
    }
}
