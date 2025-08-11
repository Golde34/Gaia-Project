import { Column, DataType, Index, Model, Table } from "sequelize-typescript";
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
        type: DataType.INTEGER,
        field: "user_id",
    })
    userId!: number;

    @Column({
        type: DataType.INTEGER,
        field: "day_of_week",
    })
    dayOfWeek!: number;

    @Column({
        type: DataType.STRING,
        field: "day_of_week_str",
    })
    dayOfWeekStr!: string;

    @Column({
        type: 'time without time zone',
        field: "start_time",
    })
    startTime!: string; // "HH:mm:ss" format

    @Column({
        type: 'time without time zone',
        field: "end_time",
    })
    endTime!: string; // "HH:mm:ss" format

    @Column({
        type: DataType.STRING,
        field: "tag",
    })
    tag!: Tag;
    
    @Column({
        type: DataType.STRING,
        field: "status",
        allowNull: true,
    })
    status?: string;

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
