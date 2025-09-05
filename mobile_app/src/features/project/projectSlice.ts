import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { get } from "@/src/utils/api";
import type { RootState } from "@/src/store";

interface Task {
	id: number;
	name: string;
}

interface Project {
	id: number;
	name: string;
	tasks: Task[];
}

interface ProjectsState {
	loading: boolean;
	projects: Project[];
	error: string | null;
}

const initialState: ProjectsState = {
	loading: false,
	projects: [],
	error: null,
};

export const fetchProjects = createAsyncThunk<
	Project[],
	void,
	{ state: RootState; rejectValue: string }
>("projects/fetchProjects", async (_, { getState, rejectWithValue }) => {
	try {
		const token = getState().login.token;
		if (!token) throw new Error("No token");

		const projectResponse = (await get("/project/all", {
			headers: { Authorization: `Bearer ${token}` },
		})) as { data: { listAllProjectsByUserId: any[] } };
		const projects = projectResponse.data.listAllProjectsByUserId || [];

		const projectsWithTasks = await Promise.all(
			projects.map(async (project: any) => {
				const taskResponse = (await get(
					`/project/${project.id}/group-tasks`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				)) as { data: { getGroupTasksInProject: any[] } };
				return {
					...project,
					tasks: taskResponse.data.getGroupTasksInProject || [],
				};
			}),
		);

		return projectsWithTasks;
	} catch (error: any) {
		return rejectWithValue(
			error.response && error.response.data.message
				? error.response.data.message
				: error.message,
		);
	}
});

const projectSlice = createSlice({
	name: "projects",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProjects.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchProjects.fulfilled, (state, action) => {
				state.loading = false;
				state.projects = action.payload;
			})
			.addCase(fetchProjects.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export default projectSlice.reducer;
