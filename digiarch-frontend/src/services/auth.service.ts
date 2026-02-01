import api from '../lib/axios';

export interface AuthResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}

export const authService = {
    async login(credentials: any): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async register(data: any): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', data);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getCurrentUser() {
        const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return typeof window !== 'undefined' && !!localStorage.getItem('token');
    }
};
