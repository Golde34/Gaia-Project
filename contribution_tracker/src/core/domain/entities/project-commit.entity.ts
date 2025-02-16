import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "project_commits",
})
export default class ProjectCommitEntity extends Model {
    @Column({
        type: DataType.STRING(36),
        primaryKey: true,
        field: "id",
    })
    id!: string;

    @Column({
        type: DataType.STRING(100),
        field: "project_id",
    })
    projectId!: string;

    @Column({
        type: DataType.STRING(255),
        field: "project_name",
    })
    projectName?: string;

    @Column({
        type: DataType.STRING(255),
        field: "github_repo",
    })
    githubRepo!: string;

    @Column({
        type: DataType.STRING(500),
        field: "github_repo_url",
    })
    githubRepoUrl!: string;

    @Column({
        type: DataType.BIGINT,
        field: "user_commit_id",
    })
    userCommitId?: number;

    @Column({
        type: DataType.BOOLEAN,
        field: "user_synced",
    })
    userSynced!: boolean;

    @Column({
        type: DataType.INTEGER,
        field: "user_number_synced",
    })
    userNumberSynced!: number;

    @Column({
        type: DataType.DATE,
        field: "first_time_synced",
    })
    firstTimeSynced?: Date;

    @Column({
        type: DataType.DATE,
        field: "last_time_synced",
    })
    lastTimeSynced?: Date;

    @Column({
        type: DataType.DATE,
        field: "created_at",
    })
    createdAt?: Date;

    @Column({
        type: DataType.DATE,
        field: "updated_at",
    })
    updatedAt?: Date;
}
