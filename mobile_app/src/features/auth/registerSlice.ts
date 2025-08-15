import { RegisterPayload, RegisterState } from "@/src/entities/authTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/src/utils/api";

export const register = createAsyncThunk<
	RegisterPayload,
	{
		name: string;
		username: string;
		email: string;
		password: string;
		matchingPassword: string;
		isUsing2FA: boolean;
		isBoss: boolean;
	},
	{ rejectValue: string }
>(
	"register/registerUser",
	async (
		{
			name,
			username,
			email,
			password,
			matchingPassword,
			isUsing2FA = false,
			isBoss = false,
		},
		{ rejectWithValue }
	) => {
		try {
            const response = await api.post(
                "/user/create-user",
                {
                    name,
                    username,
                    email,
                    password,
                    matchingPassword,
                    isUsing2FA,
                    isBoss,
                }
            );
            const data = response.data as { status: string };
			return {
				status: data.status,
			};
		} catch (error: any) {
			return rejectWithValue(
				error.response && error.response.data.message
					? error.response.data.message
					: error.message
			);
		}
	}
);

// Initial state
const initialState: RegisterState = {
	loading: false,
	status: "idle",
};

const registerSlice = createSlice({
	name: "register",
	initialState,
	reducers: {
		resetStatus(state) {
			state.status = "idle";
		},
	},
	extraReducers: (builder) => {
		// Register
		builder
			.addCase(register.pending, (state) => {
				state.loading = true;
				state.status = "loading";
			})
			.addCase(register.fulfilled, (state, action) => {
				state.loading = false;
				state.status = action.payload.status;
			})
			.addCase(register.rejected, (state, action) => {
				state.loading = false;
				state.status = action.payload as string; // Assuming payload is a string error message
			});
	},
});

export const { resetStatus } = registerSlice.actions;
export default registerSlice.reducer;
