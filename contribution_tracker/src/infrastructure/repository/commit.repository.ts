import CommitEntity from "../../core/domain/entities/commit.entity";

export class CommitRepository {
    async deleteAllCommitsByProjectId(projectId: string): Promise<void> {
        try {
            await CommitEntity.destroy({ where: { projectId: projectId } });
        } catch (error) {
            throw new Error('Failed to delete all commits by project id');
        }
    }
}