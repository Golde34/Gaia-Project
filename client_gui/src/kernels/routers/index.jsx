import React, { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import Dashboard from '../../views/Dashboard';
import SchedulingTable from '../../views/schedule_plan/SchedulingTable';
import TaskDashboard from '../../views/task_manager/TaskDashboard';
import SignIn from '../../screens/authScreen/Signin';
import GaiaAutoSignin from '../../screens/authScreen/GaiaAutoSignin';
import Microservices from '../../views/microservices_gui/Microservices';
import UserProfile from '../../views/user_gui/UserProfile';
import AuthManagerDashboard from '../../views/auth_service/UserManagerDashboard';
import Calendar from '../../views/schedule_plan/Calendar';
import PrivilegeAndRoleDashboard from '../../views/auth_service/RoleAndPrivilegeDashboard';
import PrivilegeUrlSettings from '../../views/auth_service/PrivilegeUrlSettings';
import GaiaManagerDashboard from '../../views/gaia_management/GaiaManagerDashboard';
import GaiaHealth from '../../views/microservices_gui/GaiaHealth';
import NoteDashboard from '../../views/task_manager/NoteDashboard';
import NoteDetail from '../../screens/noteScreen/NoteDetail';
import TaskIntroduction from '../../views/introduction/TaskIntroduction';
import TaskRegistration from '../../views/task_manager/TaskRegistration';
import TaskDetail from '../../views/task_manager/TaskDetail';
import GitHubCallback from '../context/GithubCallback';
import ProjectDetail from '../../views/task_manager/ProjectDetail';
import Test from "../../views/test/Test";
import Chat from '../../views/chat_hub/Chat';

// Guest is public
// User is protected, only logged in when the Role higher than User
// Admin is protected, only logged in when the Role higher than Admin
// Boss is private, only logged in when the Role is Boss

const routeList = [
    {
        path: '/private/test',
        key: 'test',
        element: <Test />
    },
    {
        path: '/',
        key: 'root',
        element: <Navigate to="/gaia" replace />,
    },
    {
        path: '/gaia',
        key: 'gaia',
        element: <GaiaAutoSignin />,
    },
    {
        path: '/signin',
        key: 'signin',
        element: <SignIn />,
    },
    {
        path: '/signup',
        key: 'signup',
        // element: <SignUp />,
    },
    {
        path: '/dashboard',
        key: 'dashboard',
        element: <Dashboard />,
    },
    {
        path: '/user-task-connector',
        key: 'user-task-connector',
        // element: <TaskIntroduction />,
        element: <TaskRegistration />,
    },
    {
        path: '/project',
        key: 'project',
        element: <TaskRegistration redirectPage="Task Manager"/>,
        // element: <Project />,
    },
    {
        path: '/project/:id',
        key: 'project-id',
        element: <ProjectDetail />,
        // element: <TaskDashboard />,
    },
    {
        path: '/microservices',
        key: 'microservices',
        element: <Microservices />,
    },
    {
        path: '/profile',
        key: 'profile',
        element: <UserProfile />,
    },
    {
        path: '/manager',
        key: 'manager',
        element: <GaiaManagerDashboard />,
    },
    {
        path: '/user-manager',
        key: 'user-manager',
        element: <AuthManagerDashboard />,
    },
    {
        path: '/privilege-role-dashboard',
        key: 'privilege-role-dashboard',
        element: <PrivilegeAndRoleDashboard />,
    },
    {
        path: '/privilege-url-settings',
        key: 'privilege-url-settings',
        element: <PrivilegeUrlSettings />,  
    },
    {
        path: '/schedule',
        key: 'schedule',
        element: <SchedulingTable />,
        // element: <TaskRegistration redirectPage="Schedule Plan" />,
    },
    {
        path: '/calendar',
        key: 'calendar',
        element: <Calendar />,
    },
    {
        path: '/gaia-health',
        key: 'gaia-health',
        element: <GaiaHealth />,
    },
    {
        path: '/note-dashboard',
        key: 'note-dashboard',
        element: <NoteDashboard />,
    },
    {
        path: '/note-detail/:id',
        key: 'note-detail',
        element: <NoteDetail />,
    },
    {
        path: '/chat',
        key: 'chat',
        element: <Chat />,
    },
    {
        path: '/task/detail/:id',
        key: 'task-detail',
        element: <TaskDetail />,
    },
    {
        path: '/github-callback',
        key: 'callback',
        element: <GitHubCallback />,
    }
]

const RenderRouter = (props) => {
    const element = useRoutes(routeList);
    return element;
};
export const localRoutes = routeList;
export default RenderRouter;