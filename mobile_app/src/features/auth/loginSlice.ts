import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { LoginPayload, LoginState } from "../../entities/authTypes";
import { get, post } from "../../utils/api";

export const login = createAsyncThunk<
    LoginPayload,
    { username: string; password: string },
    { rejectValue: string }
>("login/loginUser", async ({ username, password }, { rejectWithValue }) => {
    try {
        const response = await post("/auth/sign-in", { username, password }) as { data: { message: any } };
        const message = response.data.message;

        await SecureStore.setItemAsync("token", message.accessToken);
        await SecureStore.setItemAsync("username", message.username);
        if (message.refreshToken) {
            await SecureStore.setItemAsync("refreshToken", message.refreshToken);
        }

        return {
            user: {
                name: message.name,
                username: message.username,
                email: message.email,
                lastLogin: message.lastLogin,
                bossType: message.bossType,
                role: message.role,
            },
            accessToken: message.accessToken,
            refreshToken: message.refreshToken || null,
        };
    } catch (error: any) {
        return rejectWithValue(
            error.response && error.response.data.message
                ? error.response.data.message
                : error.message
        );
    }
});

export const logout = createAsyncThunk("login/logoutUser", async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("username");
    await SecureStore.deleteItemAsync("refreshToken");
});

export const restoreSession = createAsyncThunk<
    LoginPayload,
    void,
    { rejectValue: string }
>("login/restoreSession", async () => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No token");
    const username = await SecureStore.getItemAsync("username");
    if (!username) throw new Error("No username");

    const response = await get("/user/get-user", {
        params: { username },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }) as { data: { message: any } };
    const message = response.data?.message;

    return {
        user: {
            name: message.name,
            username: message.username,
            email: message.email,
            lastLogin: message.lastLogin,
            bossType: message.bossType,
            role: message.role,
        },
        accessToken: message.accessToken,
        refreshToken: message.refreshToken || null,
    };
});

// Initial state
const initialState: LoginState = {
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error: null,
};

const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken || null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(restoreSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(restoreSession.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken || null;
            })
            .addCase(restoreSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    },
});

export default loginSlice.reducer;
