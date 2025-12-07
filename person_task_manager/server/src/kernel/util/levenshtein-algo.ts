import levenshtein from 'fast-levenshtein';
import { IProjectEntity } from '../../core/domain/entities/project.entity';
import { IGroupTaskEntity } from '../../core/domain/entities/group-task.entity';

export const levenshteinDistanceProject = (input: string, listProjects: (IProjectEntity | null)[]) => {
    let closeProject = null;
    let minDistance = Infinity;
    for (const project of listProjects) {
        if (project !== null) {
            const distance = levenshtein.get(input, project.name);
            if (distance < minDistance) {
                minDistance = distance;
                closeProject = project;
            }
        }
    }
    return closeProject; 
}

export const levenshteinDistanceGroupTasks = (input: string, listGroups: (IGroupTaskEntity | null)[]) => {
    let closeGroup = null;
    let minDistance = Infinity;

    for (const group of listGroups) {
        if (group) {
            const distance = levenshtein.get(input, group.title);
            if (distance < minDistance) {
                minDistance = distance;
                closeGroup = group;
            }
        }
    }
    return closeGroup;
}
