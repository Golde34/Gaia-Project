import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "schedule_calendar_histories",
})
export default class ScheduleCalendarHistoryEntity extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
    })
    id!: string;

    @Column({
        type: DataType.INTEGER,
        field: "user_id",
    })
    userId!: number;

    @Column({
        type: DataType.STRING,
        field: "schedule_calendar_id",
    })
    scheduleCalendarId!: string;

    @Column({
        type: DataType.DATE,
        field: "start_date",
    })
    startDate?: Date;

    @Column({
        type: DataType.DATE,
        field: "end_date",
    })
    endDate?: Date | null;

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