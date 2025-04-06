package wo.work_optimization.core.domain.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class TopicConstants {

    @UtilityClass
    public class SchedulePlanCommand {
        public static final String TOPIC = "schedule-plan.optimize-task.topic";

        public static final String OPTIMIZE_SCHEDULE_TASK = "optimizeScheduleTask";
    }

    @UtilityClass
    public class HandleTaskCommand {
        public static final String TOPIC = "task-manager.handle-task.topic";

        public static final String CREATE_TASK = "createTask";
        public static final String GAIA_CREATE_TASK = "gaiaCreateTask";
        public static final String UPDATE_TASK = "updateTask";
        public static final String DELETE_TASK = "deleteTask";
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

        public static final String OPTIMIZE_TASK = "optimizeTask";
    }
}
