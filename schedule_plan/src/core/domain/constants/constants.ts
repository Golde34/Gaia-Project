export class InternalCacheConstants {
    public static readonly CACHE_PREFIX = "schedule-plan.";
    public static readonly CACHE_POSTFIX = ".cache";

    public static SCHEDULE_PLAN = `schedule-plan-info.`;
    public static SCHEDULE_GROUP_LIST = `schedule-group-list.`;
}

export class CacheConstants {
    public static readonly CACHE_PREFIX = "schedule-plan.";
    public static readonly CACHE_POSTFIX = ".cache";

    public static SCHEDULE_TASK_BY_BATCH = `schedule-task-by-batch.`;
}

export const dayOfWeekMap = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

export const buildRedisCacheKey = (identifier: string): string => {
    return `${CacheConstants.CACHE_PREFIX}${identifier}${CacheConstants.CACHE_POSTFIX}`;
}