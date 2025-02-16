import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "user_commits",
})
export default class UserCommitEntity extends Model {
    @Column({
        type: DataType.STRING(36),
        primaryKey: true,
        field: "id",
    })
    id!: string;

    @Column({
        type: DataType.BIGINT,
        field: "user_id",
    })
    userId!: number;

    @Column({
        type: DataType.STRING(500),
        field: "github_url",
    })
    githubUrl?: string;

    @Column({
        type: DataType.STRING(100),
        field: "github_sha",
    })
    githubSha?: string;

    @Column({
        type: DataType.STRING(255),
        field: "github_access_token",
    })
    githubAccessToken?: string;

    @Column({
        type: DataType.STRING(100),
        field: "github_login_name",
    })
    githubLoginName?: string;

    @Column({
        type: DataType.BOOLEAN,
        field: "user_consent",
    })
    userConsent!: boolean;

    @Column({
        type: DataType.STRING(100),
        field: "user_state",
    })
    userState!: string;
}

