import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "commits",
})
export default class CommitEntity extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
    })
    id!: string;

    @Column({
        type: DataType.STRING(3000),
        field: "content",
    })
    content!: string;

    @Column({
        type: DataType.DATE,
        field: "commit_time"
    })
    commitTime!: Date;

    @Column({
        type: DataType.BIGINT,
        field: "user_id"
    }) 
    userId!: number;

    @Column({
        type: DataType.STRING(50),
        field: "project_id"
    })
    projectId?: string;

    @Column({
        type: DataType.STRING(20),
        field: "type"
    })
    type!: string;

    @Column({
        type: DataType.STRING(50),
        field: "task_id"
    })
    taskId!: string;

    @Column({
        type: DataType.STRING(50),
        field: "sub_task_id"
    })
    subTaskId!: string;

    @Column({
        type: DataType.STRING(50),
        field: "schedule_task_id"
    })
    scheduleTaskId!: string;

    @Column({
        type: DataType.STRING(100),
        field: "github_commit_id"
    })
    githubCommitId!: string;

    @Column({
        type: DataType.STRING(100),
        field: "commit_author"
    })
    commitAuthor!: string;

    @Column({
        type: DataType.STRING(500),
        field: "committer_name"
    })
    committerName!: string;

    @Column({
        type: DataType.STRING(200),
        field: "committer_email"
    })
    committerEmail!: string;

    @Column({
        type: DataType.DATE,
        field: "github_commit_date"
    })
    githubCommitDate!: Date;

    @Column({
        type: DataType.STRING(3000),
        field: "commit_message"
    })
    commitMessage!: string;

    @Column({
        type: DataType.STRING(1000),
        field: "commit_url"
    })
    commitUrl!: string;
}
