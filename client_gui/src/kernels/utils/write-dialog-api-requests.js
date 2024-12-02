import { useDispatch } from 'react-redux';
import { createGroupTask } from '../../api/store/actions/task_manager/group-task.actions';
import { createProject } from '../../api/store/actions/task_manager/project.actions';
import { createTask, generateTaskFromScratch } from '../../api/store/actions/task_manager/task.actions';
import { updateUser, updateUserSetting } from '../../api/store/actions/auth_service/user.actions';
import { createRole } from '../../api/store/actions/auth_service/role.actions';
import { registerTaskConfig } from '../../api/store/actions/work_optimization/task-registration.actions';
import { createNote } from '../../api/store/actions/task_manager/note.actions';
import { optimizeTaskByUserId } from '../../api/store/actions/work_optimization/optimize-task.actions';

export const useCreateGroupTaskDispatch = () => {
    const dispatch = useDispatch();

    const createGroupTaskDispatch = (groupTask) => {
        dispatch(createGroupTask(groupTask));
    }

    return createGroupTaskDispatch;
};

export const useCreateProjectDispatch = () => {
    const dispatch = useDispatch();

    const createProjectDispatch = (project) => {
        dispatch(createProject(project));
    }

    return createProjectDispatch;
}

export const useCreateTaskDispatch = () => {
    const dispatch = useDispatch();

    const createTaskDispatch = (task) => {
        dispatch(createTask(task));
    }

    return createTaskDispatch;
}

export const useGenerateTaskFromScratchDispatch = () => {
    const dispatch = useDispatch();

    const generateTaskFromScratchDispatch = (task) => {
        dispatch(generateTaskFromScratch(task));
    }

    return generateTaskFromScratchDispatch;
}

export const useUpdateUserDispatch = () => {
    const dispatch = useDispatch();

    const updateUserDispatch = (user) => {
        dispatch(updateUser(user));
    }

    return updateUserDispatch;
}

export const useCreateRoleDispatch = () => {
    const dispatch = useDispatch();

    const createRoleDispatch = (role) => {
        dispatch(createRole(role));
    }

    return createRoleDispatch;
}

export const useCreateTaskRegistrationDispatch = () => {
    const dispatch = useDispatch();
    
    const registerTaskConfigDispatch = (taskConfig) => {
        dispatch(registerTaskConfig(taskConfig));
    }
    
    return registerTaskConfigDispatch;
}

export const useCreateNoteDispatch = () => {
    const dispatch = useDispatch();

    const createNoteDispatch = (note) => {
        dispatch(createNote(note));
    }

    return createNoteDispatch;
}

export const useUpdateUserSettingDispatch = () => {
    const dispatch = useDispatch();

    const updateUserSettingDispatch = (user) => {
        dispatch(updateUserSetting(user));
    }

    return updateUserSettingDispatch;
}