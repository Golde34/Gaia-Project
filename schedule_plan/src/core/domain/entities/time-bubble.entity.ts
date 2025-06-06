import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Tag } from "../enums/enums";

@Table({
    tableName: "time_bubbles",
})
export default class TimeBubblesEntity extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        field: "schedule_calendar_id",
    })
    scheduleCalendarId!: string;

    @Column({
        type: DataType.INTEGER,
        field: "start_hour",
    })
    startHour!: number;

    @Column({
        type: DataType.INTEGER,
        field: "start_minute",
    })
    startMinute!: number;

    @Column({
        type: DataType.INTEGER,
        field: "end_hour",
    })
    endHour!: number;

    @Column({
        type: DataType.INTEGER,
        field: "end_minute",
    })
    endMinute!: number;

    @Column({
        type: DataType.STRING,
        field: "tag",
    })
    tag!: Tag;

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
