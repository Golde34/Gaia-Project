import { ProjectCommitEntity } from "../../core/domain/entities/project-commit.entity";
import Repository from "../database/repository";

export class ProjectCommitRepository extends Repository {
    private static instance: ProjectCommitRepository;

    public static getInstance(): ProjectCommitRepository {
        if (!ProjectCommitRepository.instance) {
            ProjectCommitRepository.instance = new ProjectCommitRepository();
        }
        return ProjectCommitRepository.instance;
    }

    constructor() {
        super('project_commit');
    }

    async resetSyncedTime(): Promise<void> {
        const query = `UPDATE ${this.tableName} SET last_time_synced = ?, updated_at = ?, user_synced = ?, user_number_synced = ? where last_time_synced < ?`;
        const [result] = await this.pool.query(query, [new Date(), new Date(), false, 0, new Date()]);
        console.log("Reset synced time result: ", result);
    }
}
