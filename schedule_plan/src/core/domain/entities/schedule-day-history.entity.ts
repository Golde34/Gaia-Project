import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "schedule_day_history",
})
export default class ScheduleDayHistoryEntity extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        field: "user_id",
    })
    userId!: string;

    @Column({
        type: DataType.JSONB,
        field: "schedule_snapshot",
    })
    scheduleSnapshot!: Array<{
        startTime: string; endTime: string; tag: string;
        task_id: string | null; task_title?: string; 
    }>

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
}