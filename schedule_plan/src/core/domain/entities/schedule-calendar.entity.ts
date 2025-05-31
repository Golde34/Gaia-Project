import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "schedule_calendars",
})
export default class ScheduleCalendarEntity extends Model {
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
        type: DataType.BOOLEAN,
        field: "repeatable",
        defaultValue: false,
    })
    repeatable!: boolean;

    @Column({
        type: DataType.ARRAY(DataType.INTEGER),
        field: "repeatable_days",
    })
    repeatableDays?: number[] | null;

    @Column({
        type: DataType.DATE,
        field: "urgent_date",
    })
    urgentDate?: Date | null;

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