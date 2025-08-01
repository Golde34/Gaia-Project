import { combineReducers } from "redux";
import {
    userSigninReducer,
    gaiaSigninReducer,
    bossSigninReducer,
    getChatHubJwtReducer,
    userSignupReducer,
    userSignoutReducer,
} from './auth_service/auth.reducer'

import {
    projectCreateReducer, projectDeleteReducer, projectDetailReducer,
    projectListReducer, projectUpdateReducer
} from './task_manager/project.reducers'
import {
    groupTaskCreateReducer, groupTaskDeleteReducer, groupTaskDetailReducer,
    groupTaskListReducer, groupTaskUpdateReducer
} from './task_manager/group-task.reducers'
import {
    doneTasksReducer,
    moveTaskReducer, taskCompletedReducer, taskCreateReducer, taskDeleteReducer, taskDetailReducer,
    taskListReducer, taskTableReducer, taskUpdateReducer, topTaskReducer
} from './task_manager/task.reducers'
import {
    subTaskCreateReducer, subTaskDeleteReducer, subTaskDetailReducer,
    subTaskListReducer, subTaskUpdateReducer
} from './task_manager/sub-task.reducers'
import {
    commentCreateReducer, commentDeleteReducer, commentDetailReducer,
    commentListReducer, commentUpdateReducer
} from './task_manager/comment.reducers'
import { microserviceListReducer, screenListReducer } from "./middleware_loader/microservices.reducer";
import { getAllLLMModelsReducer, updateUserModelReducer, userDetailReducer, userListReducer, userSettingUpdateReducer, userUpdateReducer } from "./auth_service/user.reducer";
import { roleCreateReducer, roleListReducer } from "./auth_service/role.reducer";
import { privilegeListReducer } from "./auth_service/privilege.reducer";
import { queryTaskConfigReducer, registerTaskConfigReducer } from "./onboarding/task-registration.reducers";
import {
    noteCreateReducer, noteDeleteReducer, noteDetailReducer,
    noteListReducer, noteLockReducer, noteUnlockReducer, noteUpdateReducer
} from "./task_manager/note.reducers";
import { optimizeTaskByUserReducer } from "./onboarding/optimize-task.reducers";
import { activeTaskBatchReducer, chooseTaskBatchReducer, scheduleTaskListReducer, taskBatchListReducer } from "./schedule_plan/schedule-task.reducers";
import { getUserGithubInfoReducer } from "./contribution_tracker/user-commit.reducer";
import { getProjectAndRepoRequestReducer } from "./contribution_tracker/project-commit.reducer";
import { compareCommitsReducer, getProjectContributionReducer, getUserContributionsReducer } from "./contribution_tracker/contribution.reducer";
import { createScheduleGroupReducer, scheduleGroupListReducer } from "./schedule_plan/schedule-group.reducers";
import { getNotificationJwt } from "../actions/auth_service/auth.actions";
import { getDailyCalendarReducer } from "./schedule_plan/schedule-calendar.reducers";
import { chatHistoryReducer } from "./chat_hub/messages.reducer";

export const reducer = combineReducers({
    // auth service
    userSignup: userSignupReducer,
    gaiaSignin: gaiaSigninReducer,
    bossSignin: bossSigninReducer,
    userSignin: userSigninReducer,
    userSignout: userSignoutReducer,
    userList: userListReducer,
    userUpdate: userUpdateReducer,
    userDetail: userDetailReducer,
    roleList: roleListReducer,
    roleCreate: roleCreateReducer,
    privilegeList: privilegeListReducer,
    userSettingUpdate: userSettingUpdateReducer,
    userGithubInfo: getUserGithubInfoReducer,
    llmModels: getAllLLMModelsReducer,
    userModelUpdate: updateUserModelReducer,
    userChatHubJwt: getChatHubJwtReducer,
    notificationJwt: getNotificationJwt,
    // task manager
    projectList: projectListReducer,
    projectDetail: projectDetailReducer,
    projectCreate: projectCreateReducer,
    projectUpdate: projectUpdateReducer,
    projectDelete: projectDeleteReducer,
    projectsAndRepos: getProjectAndRepoRequestReducer,
    groupTaskList: groupTaskListReducer,
    groupTaskDetail: groupTaskDetailReducer,
    groupTaskCreate: groupTaskCreateReducer,
    groupTaskUpdate: groupTaskUpdateReducer,
    groupTaskDelete: groupTaskDeleteReducer,
    groupTaskUpdateName: groupTaskUpdateReducer,
    taskList: taskListReducer,
    taskDetail: taskDetailReducer,
    taskCreate: taskCreateReducer,
    taskUpdate: taskUpdateReducer,
    taskDelete: taskDeleteReducer,
    taskCompleted: taskCompletedReducer,
    movedTask: moveTaskReducer,
    topTask: topTaskReducer,
    doneTasks: doneTasksReducer,
    taskTable: taskTableReducer,
    subTaskList: subTaskListReducer,
    subTaskDetail: subTaskDetailReducer,
    subTaskCreate: subTaskCreateReducer,
    subTaskUpdate: subTaskUpdateReducer,
    subTaskDelete: subTaskDeleteReducer,
    commentList: commentListReducer,
    commentDetail: commentDetailReducer,
    commentCreate: commentCreateReducer,
    commentUpdate: commentUpdateReducer,
    commentDelete: commentDeleteReducer,
    noteList: noteListReducer,
    noteCreate: noteCreateReducer,
    noteUpdate: noteUpdateReducer,
    noteLock: noteLockReducer,
    noteUnlock: noteUnlockReducer,
    noteDetail: noteDetailReducer,
    noteDelete: noteDeleteReducer,
    // schedule task
    scheduleTaskList: scheduleTaskListReducer,
    taskBatchList: taskBatchListReducer,
    chooseTaskBatch: chooseTaskBatchReducer,
    createScheduleGroup: createScheduleGroupReducer,
    scheduleGroupList: scheduleGroupListReducer,
    activeTaskBatch: activeTaskBatchReducer,
    getDailyCalendar: getDailyCalendarReducer,
    // middleware loader
    microserviceList: microserviceListReducer,
    screenList: screenListReducer,
    // work optimization 
    registerTaskConfig: registerTaskConfigReducer,
    queryTaskConfig: queryTaskConfigReducer,
    optimizeTaskByUser: optimizeTaskByUserReducer,
    // contribution tracker
    userContributions: getUserContributionsReducer,
    compareCommits: compareCommitsReducer,
    projectContributions: getProjectContributionReducer,
    // chat hub
    chatHistory: chatHistoryReducer,
})