import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "schedule_calendars",
})
export default class ScheduleCalendarEntity extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
        allowNull: false,
    })
    id!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
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
        allowNull: true,
    })
    repeatableDays!: number[] | null;

    @Column({
        type: DataType.DATE,
        field: "urgent_date",
        allowNull: true,
    })
    urgentDate!: Date | null;
}