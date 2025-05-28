import { Column, DataType, Table } from "sequelize-typescript";

@Table({
    tableName: "schedule_tasks",
})
export default class ScheduleTaskEntity {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
        allowNull: false,
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "task_id",
    })
    taskId!: string;

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
        type: DataType.DATE,
        allowNull: false,
        field: "start_date",
    })
    startDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: "deadline",
    })
    deadline!: Date;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "duration",
    })
    duration!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "active_status",
    })
    activeStatus!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "preference_level",
    })
    preferenceLevel!: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: "is_synchronized_with_wo",
    })
    isSynchronizedWithWO!: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: "task_order",
    })
    taskOrder!: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
        field: "weight",
    })
    weight!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: "stop_time",
    })
    stopTime!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: "task_batch",
    })
    taskBatch!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "schedule_plan_id",
    })
    schedulePlanId!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: "is_notify",
    })
    isNotify!: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: "create_date",
    })
    createDate!: Date;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "schedule_group_id",
    })
    scheduleGroupId!: string;
}
