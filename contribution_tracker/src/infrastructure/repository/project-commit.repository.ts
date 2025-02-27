import { Op } from "sequelize";
import ProjectCommitEntity from "../../core/domain/entities/project-commit.entity";

export class ProjectCommitRepository {
    async resetSyncedTime(): Promise<void> {
        try {
            const affectedRows = await ProjectCommitEntity.update(
                { lastTimeSynced: new Date(), userSynced: false, userNumberSynced: 0 },
                { where: { lastTimeSynced: { [Op.lt]: new Date() } } }
            )
            console.log('Reset synced time affected rows: ', affectedRows);
        } catch (error) {
            throw new Error('Failed to reset synced time');
        }
    }

    async findByUserCommitId(userCommitId: number): Promise<ProjectCommitEntity[]> {
        try {
            return await ProjectCommitEntity.findAll({ where: { userCommitId } });
        } catch (error) {
            throw new Error('Failed to find project commit by user commit id');
        }
    }

    async findByUserCommitIdAndId(userCommitId: number, id: string): Promise<ProjectCommitEntity[]> {
        try {
            return await ProjectCommitEntity.findAll({ where: { userCommitId, id } });
        } catch (error) {
            throw new Error('Failed to find project commit by user commit id and id');
        }
    }

    async findById(id: string): Promise<ProjectCommitEntity | null> {
        try {
            return await ProjectCommitEntity.findByPk(id);
        } catch (error) {
            throw new Error('Failed to find project commit by id');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await ProjectCommitEntity.destroy({ where: { id } });
        } catch (error) {
            throw new Error('Failed to delete project commit');
        }
    }

    async findBatch(limit: number, order: 'DESC' | 'ASC'): Promise<ProjectCommitEntity[]> {
        try {
            return await ProjectCommitEntity.findAll({
                limit,
                order: [['last_time_synced', order]]
            });
        } catch (error) {
            throw new Error('Failed to find project commit by batch');
        }
    }

    async update(id: string, data: Partial<ProjectCommitEntity>): Promise<void> {
        try {
            await ProjectCommitEntity.update(data, { where: { id } });
            await ProjectCommitEntity.save();
        } catch (error) {
            throw new Error('Failed to update project commit');
        }
    }

    async updateTotalCommit(projectId: string, totalCommit: number): Promise<ProjectCommitEntity | null> {
        try {
            const project = await ProjectCommitEntity.findByPk(projectId);
            if (!project) {
                throw new Error("User not found");
            }
            await project.increment('total_project_commits', { by: totalCommit });
            await project.reload();
            return project;
        } catch (error) {
            console.error("Error updating user total commit:", error);
            throw new Error("Failed to update user total commit");
        }
    }

    async updateTotalCommitWithProjectId(userId: number, projectId: string, totalCommit: number): Promise<ProjectCommitEntity | null> {
        try {
            const project = await ProjectCommitEntity.findOne({ where: { userId: userId, projectId: projectId } });
            if (!project) {
                throw new Error("User not found");
            }
            await project.increment('total_project_commits', { by: totalCommit });
            await project.reload();
            return project;
        } catch (error) {
            console.error("Error updating user total commit:", error);
            throw new Error("Failed to update user total commit");
        }
    }
}