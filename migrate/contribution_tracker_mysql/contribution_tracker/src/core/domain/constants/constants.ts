// Existed Status Variable
export const EXISTED = true;
export const NOT_EXISTED = false;

export const EXISTED_MESSAGE = "%s is existed";
export const NOT_EXISTED_MESSAGE = "%s is not existed";

export const EMPTY_SENTENCE = "This task has no sentence";

export class InternalCacheConstants {
    public static readonly CACHE_PREFIX = "contribution-tracker.";
    public static readonly CACHE_POSTFIX = ".cache";

    public static USER_INFO_CACHE_KEY = "user-info";
    public static GITHUB_REPOS_CACHE_KEY = "github-repos";
}
