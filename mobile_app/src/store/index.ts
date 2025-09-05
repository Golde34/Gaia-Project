import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "../features/auth/loginSlice";
import registerReducer from "../features/auth/registerSlice";
import counterReducer from "../features/counter/counterSlice";
import projectReducer from "../features/project/projectSlice";

export const store = configureStore({
	reducer: {
		counter: counterReducer,
		login: loginReducer,
		register: registerReducer,
		projects: projectReducer,
	},
});

// Types for later use in hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
