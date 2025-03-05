import { ProjectEntity } from "../../infrastructure/database/model-repository/project.model";
import { IProjectEntity } from "../domain/entities/project.entity";

export const projectValidation = {
    async checkExistedProjectById(projectId: string): Promise<IProjectEntity | null> {
        try {
            return await ProjectEntity.findOne({ _id: projectId }) 
        } catch (error: any) {
            console.log(error.message.toString());
            return null;
        }
    },

    async checkExistedProjectByName(projectName: string): Promise<boolean> {
        try {
            const existedProject = await ProjectEntity.findOne({ projectName: projectName }) != null
            return existedProject;
        } catch (error: any) {
            console.log(error.message.toString());
            return false;
        }
    },

    async checkOwnerProject(projectId: string, userId: string): Promise<boolean> {
        try {
            const existedProject = await ProjectEntity.findOne({ _id: projectId, owner: userId }) != null 
            return existedProject;
        } catch (error: any) {
            console.log(error.message.toString());
            return false;
        }
    }
}