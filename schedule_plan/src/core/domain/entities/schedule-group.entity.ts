import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from "sequelize-typescript";

@Table({
    tableName: "schedule_groups",
})
export default class ScheduleGroupEntity extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        field: "schedule_plan_id",
    })
    schedulePlanId!: string;

    @Column({
        type: DataType.STRING,
        field: "project_id",
    })
    projectId?: string;

    @Column({
        type: DataType.STRING,
        field: "group_task_id",
    })
    groupTaskId?: string;

    @Column({
        type: DataType.STRING,
        field: "title",
    })
    title?: string;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        field: "priority",
    })
    priority?: string[];

    @Column({
        type: DataType.STRING,
        field: "status",
    })
    status?: string;

    @Column({
        type: DataType.INTEGER,
        field: "start_hour",
    })
    startHour?: number;

    @Column({
        type: DataType.INTEGER,
        field: "start_minute",
    })
    startMinute?: number;

    @Column({
        type: DataType.INTEGER,
        field: "end_hour",
    })
    endHour?: number;

    @Column({
        type: DataType.INTEGER,
        field: "end_minute",
    })
    endMinute?: number;

    @Column({
        type: DataType.INTEGER,
        field: "duration",
    })
    duration?: number;

    @Column({
        type: DataType.INTEGER,
        field: "preference_level",
    })
    preferenceLevel?: number;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        field: "repeat",
    })
    repeat?: number[];

    @Column({
        type: DataType.BOOLEAN,
        field: "is_notify",
    })
    isNotify?: boolean;

    @Column({
        type: DataType.STRING,
        field: "active_status",
    })
    activeStatus?: string;

    @Column({
        type: DataType.BOOLEAN,
        field: "is_failed",
    })
    isFailed?: boolean;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: "created_at",
        defaultValue: DataType.NOW,
    })
    createdAt?: Date;

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: "updated_at",
        defaultValue: DataType.NOW,
    })
    updatedAt?: Date;
}
