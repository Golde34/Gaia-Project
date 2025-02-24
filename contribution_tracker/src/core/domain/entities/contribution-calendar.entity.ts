import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Col } from "sequelize/types/utils";

@Table({
    tableName: "contribution_calendar",
})
export default class ContributionCalendarEntity extends Model {
    @Column({
        type: DataType.UUID,
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
        type: DataType.STRING(100),
        field: "project_id",
    })
    projectId!: string;

    @Column({
        type: DataType.DATE,
        field: "date",
    })
    date!: Date;

    @Column({
        type: DataType.INTEGER,
        field: "commit_count",
    })
    commitCount!: number;

    @Column({
        type: DataType.INTEGER,
        field: "total_user_commits",
    })

    @Column({
        type: DataType.INTEGER,
        field: "total_project_commits",
    })

    @Column({
        type: DataType.INTEGER,
        field: "level",
    })
    level!: number;

    @Column({
        type: DataType.DATE,
        field: "created_at",
    })
    createdAt!: Date;

    @Column({
        type: DataType.DATE,
        field: "updated_at",
    }) 
    updatedAt?: Date;
}