import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "schedule_tasks",
})
export default class ScheduleTaskEntity extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        field: "task_id",
    })
    taskId!: string;

    @Column({
        type: DataType.STRING,
        field: "title",
    })
    title!: string;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        field: "priority",
    })
    priority!: string[];

    @Column({
        type: DataType.STRING,
        field: "status",
    })
    status!: string;

    @Column({
        type: DataType.DATE,
        field: "start_date",
    })
    startDate!: Date;

    @Column({
        type: DataType.DATE,
        field: "deadline",
    })
    deadline!: Date;

    @Column({
        type: DataType.INTEGER,
        field: "duration",
    })
    duration!: number;

    @Column({
        type: DataType.STRING,
        field: "active_status",
    })
    activeStatus!: string;

    @Column({
        type: DataType.INTEGER,
        field: "preference_level",
    })
    preferenceLevel!: number;

    @Column({
        type: DataType.BOOLEAN,
        field: "is_synchronized_with_wo",
    })
    isSynchronizedWithWO?: boolean;

    @Column({
        type: DataType.INTEGER,
        field: "task_order",
    })
    taskOrder!: number;

    @Column({
        type: DataType.FLOAT,
        field: "weight",
    })
    weight!: number;

    @Column({
        type: DataType.INTEGER,
        field: "stop_time",
    })
    stopTime!: number;

    @Column({
        type: DataType.INTEGER,
        field: "task_batch",
    })
    taskBatch!: number;

    @Column({
        type: DataType.STRING,
        field: "schedule_plan_id",
    })
    schedulePlanId!: string;

    @Column({
        type: DataType.STRING,
        field: "repeat",
    })
    repeat!: string;

    @Column({
        type: DataType.BOOLEAN,
        field: "is_notify",
    })
    isNotify!: boolean;

   @Column({
        type: DataType.DATE,
        field: "created_at",
        defaultValue: DataType.NOW,
    })
    createdAt?: Date;

    @Column({
        type: DataType.DATE,
        field: "updated_at",
        defaultValue: DataType.NOW,
    })
    updatedAt?: Date; 

    @Column({
        type: DataType.STRING,
        field: "schedule_group_id",
    })
    scheduleGroupId!: string;
}
