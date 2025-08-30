export interface LoginPayload {
    user: User;
    accessToken: string;
    refreshToken?: string;
}

export interface LoginState {
    user: User | null;
    token: string | null;
    refreshToken?: string | null;
    loading: boolean;
    error: string | null;
}

export interface User {
    name: string;
    username: string;
    email: string;
    lastLogin: string;
    bossType: string;
    role: string;
}

export interface RegisterState {
    loading: boolean;
    status: string | null;
}

export interface RegisterPayload {
    status: string;
}