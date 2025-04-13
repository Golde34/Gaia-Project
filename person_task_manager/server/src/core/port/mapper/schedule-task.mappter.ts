import { ProjectEntity } from "../../../infrastructure/database/model-repository/project.model";
import { IProjectEntity } from "../../domain/entities/project.entity";
import { ActiveStatus } from "../../domain/enums/enums";
import { IGroupTaskEntity } from "../../domain/entities/group-task.entity";
import { GroupTaskEntity } from "../../../infrastructure/database/model-repository/group-task.model";
import { TaskEntity } from "../../../infrastructure/database/model-repository/task.model";
import { ITaskEntity } from "../../domain/entities/task.entity";

export const scheduleTaskMapper = {
    mapProject(scheduleGroup: any, ownerId: number): IProjectEntity {
        return new ProjectEntity({
            name: scheduleGroup.title,
            status: scheduleGroup.status,
            color: "indigo",
            ownerId: ownerId,
            activeStatus: ActiveStatus.active,
        })

    },

    mapGroupTask(scheduleGroup: any, projectId: string): IGroupTaskEntity {
        return new GroupTaskEntity({
            title: scheduleGroup.title,
            priority: scheduleGroup.priority,
            status: scheduleGroup.status,
            activeStatus: ActiveStatus.active,
            createdAt: new Date(),
            updatedAt: new Date(),
            projectId: projectId
        })
    },

    mapTask(scheduleTask: any, userId: number): ITaskEntity {
        return new TaskEntity({
            title: scheduleTask.title,
            priority: scheduleTask.priority,
            status: scheduleTask.status,
            startDate: scheduleTask.startDate,
            deadline: scheduleTask.deadline,
            duration: scheduleTask.duration,
            createdAt: new Date(),
            updatedAt: new Date(),
            activeStatus: ActiveStatus.active,
            userId: userId, 
        }) 
    }
}
