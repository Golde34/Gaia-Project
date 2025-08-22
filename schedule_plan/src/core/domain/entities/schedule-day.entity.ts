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
    id!: string;

    @Column({
        type: DataType. STRING,
        field: "user_id",
    })
    userId!: string;

    @Column({
        type: DataType.STRING,
        field: "schedule_plan_id",
    })
    schedulePlanId!: string;

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
        type: DataType.UUID,
        field: "schedule_task_id",
    })
    taskId: string | null = null;

    @if (!Array.isArray(scheduleTasks)) return undefined;

  const allTagged = scheduleTasks.every(
    (task) => task?.tag != null && String(task.tag).trim() !== ""
  );

  return allTagged ? scheduleTasks : undefined;Column({
        type: DataType.UUID,
        field: "task_title",
    })
    taskTitle?: string;

    @Column({
        type: DataType.DATE,
        field: "created_at",
    }) 
    createdAt!: Date;

    @Column({
        type: DataType.DATE,
        field: "updated_at",
    })
    updatedAt!: Date;
}