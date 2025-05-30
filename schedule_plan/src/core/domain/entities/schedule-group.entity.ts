import { Column, DataType, Model, Table } from "sequelize-typescript";

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
        allowNull: false,
        field: "schedule_plan_id",
    })
    schedulePlanId!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "project_id",
    })
    projectId!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "group_task_id",
    })
    groupTaskId!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "title",
    })
    title!: string;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: false,
        field: "priority",
    })
    priority!: string[];

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "status",
    })
    status!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "start_hour",
    })
    startHour!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "start_minute",
    })
    startMinute!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "end_hour",
    })
    endHour!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "end_minute",
    })
    endMinute!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "duration",
    })
    duration!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "preference_level",
    })
    preferenceLevel!: number;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: true,
        field: "repeat",
    })
    repeat!: string[];

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: "is_notify",
    })
    isNotify!: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "active_status",
    })
    activeStatus!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: "is_failed",
    })
    isFailed!: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: "create_date",
    })
    createDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: "update_date",
    })
    updateDate!: Date | null;
}
