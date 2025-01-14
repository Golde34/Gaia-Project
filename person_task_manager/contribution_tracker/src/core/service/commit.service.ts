import CacheSingleton from "../../infrastructure/cache/cache-singleton";
import { KafkaConfig } from "../../infrastructure/kafka/kafka-config";
import { ICommitEntity } from "../domain/entities/commit.entity";

class CommitService {
    constructor(
        public kafkaConfig = new KafkaConfig(),
        public commitCache = CacheSingleton.getInstance().getCache(),
    ) { }

    async getUserCommits(userId: number): Promise<ICommitEntity[] | null> {
        return null;
    } 

    async getProjectCommits(userId: number, projectId: string): Promise<ICommitEntity[] | null> {
        return null;
    }

    async createCommit(commitObject: any): Promise<ICommitEntity | null> {
        return null;
    }
} 

export const commitService = new CommitService();