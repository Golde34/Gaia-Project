// Existed Status Variable
export const EXISTED = true;
export const NOT_EXISTED = false;

export const EXISTED_MESSAGE = "%s is existed";
export const NOT_EXISTED_MESSAGE = "%s is not existed";

export const EMPTY_SENTENCE = "This task has no sentence";

export class InternalCacheConstants {
    public static readonly CACHE_PREFIX = "task-manager.";
    public static readonly CACHE_POSTFIX = ".cache";

    public static TASK_TABLE = `task-table.`;
    public static NOTE_LIST = `note-list.`;
    public static TASK_COMPLETED = `task-completed.`;
}
