import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ActiveStatus } from "../enums/enums";

@Table({
    tableName: "schedule_plans",
})
export default class SchedulePlanEntity extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
    })
    id!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "user_id",
    })
    userId!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: "start_date",
    })
    startDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: "end_date",
    })
    endDate!: Date;

    @Column({
        type: DataType.STRING,
        field: "active_status",
        defaultValue: ActiveStatus.active,
    })
    activeStatus!: ActiveStatus; 

    @Column({
        type: DataType.INTEGER,
        field: "active_task_batch",
    })
    activeTaskBatch!: number;

    @Column({
        type: DataType.BOOLEAN,
        field: "is_task_batch_active",
    })
    isTaskBatchActive!: boolean;

    @Column({
        type: DataType.STRING,
        field: "user_tag_time",
    })
    userTagTime!: string;
}