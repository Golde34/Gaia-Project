import { ulid } from "ulid";
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
            _id: ulid(),
            name: scheduleGroup.title,
            status: scheduleGroup.status,
            color: "indigo",
            owwnerId: ownerId,
            activeStatus: ActiveStatus.active,
        })

    },

    mapGroupTask(scheduleGroup: any, projectId: string): IGroupTaskEntity {
        return new GroupTaskEntity({
            _id: ulid(),
            title: scheduleGroup.title,
            priority: scheduleGroup.priority,
            status: scheduleGroup.status,
            activeStatus: ActiveStatus.active,
            createdAt: new Date(),
            updatedAt: new Date(),
            projectId: projectId
        })
    },

    mapTask(scheduleTask: any, groupTaskId: string): ITaskEntity {
        return new TaskEntity({
            _id: ulid(),
            title: scheduleTask.title,
            priority: scheduleTask.priority,
            status: scheduleTask.status,
            startDate: scheduleTask.startDate,
            deadline: scheduleTask.deadline,
            duration: scheduleTask.duration,
            groupTaskId: groupTaskId,
            createdAt: new Date(),
            updatedAt: new Date(),
            activeStatus: ActiveStatus.active,
        }) 
    }
}
