import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "schedule_day_bubbles", 
})
export default class ScheduleDayBubbleEntity extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
    })
    id?: string;

    @Column({
        type: DataType.BIGINT,
        field: "user_id",
    })
    userId?: number;

    @Column({
        type: 'time without time zone',
        field: "start_time",
    }) 
    startTime?: string; // "HH:mm:ss" format

    @Column({
        type: 'time without time zone',
        field: "end_time",
    })
    endTime?: string; // "HH:mm:ss" format

    @Column({
        type: DataType.UUID,
        field: "primary_task_id",
    })
    primaryTaskId?: string;

    @Column({
        type: DataType.UUID,
        field: "backup_task_id",
    })
    backupTaskId?: string;

    @Column({
        type: DataType.UUID,
        field: "primary_task_title",
    })
    primaryTaskTitle?: string;

    @Column({
        type: DataType.UUID,
        field: "backup_task_title",
    })
    backupTaskTitle?: string;

    @Column({
        type: DataType.UUID,
        field: "tag"
    })
    tag?: string;

    @Column({
        type: DataType.INTEGER,
        field: "week_day",
    })
    weekDay?: number;

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