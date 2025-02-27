class CommitValidation {
    constructor() {}

    validateGithubCommitCreation(commit: any, githubLoginName: string): boolean {
        if (!commit.commit || !commit.commit.committer) {
            return false;
        }
        if (commit.commit.committer.name !== githubLoginName) {
            return false;
        }
        return true;
    }
}

export const commitValidation = new CommitValidation();