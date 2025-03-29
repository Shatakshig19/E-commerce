import {create} from "zustand";
import {toast} from "react-hot-toast";  // for notifications
import axios from "../lib/axios.js";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });

        if (password !== confirmPassword) {
            set({ loading: false })
            return toast.error("Password doesn't match");
        }

        try {
            const res = await axios.post("/auth/signup", { name, email, password });
            console.log(name, email, password);
            
            set({ user: res.data, loading: false });
        } catch (error) {
            set({ loading: false })
            toast.error(error.response.data.message || "An error occurred")
            console.log(error);
            
        }
    },

    login: async (email, password) => {
        set({ loading: true });
        console.log("In Store", email, password);
        
        

        try {
            const res = await axios.post("/auth/login", { email, password });
            console.log(res);
            
            set({ user: res.data, loading: false });
            
            
        } catch (error) {
            set({ loading: false })
            toast.error(error.response.data.message || "An error occurred during login")
            console.log(error.message);
            
        }
    },

    logout: async () => {
        try {
            await axios.post("/auth/logout");
            set({ user: null });
            console.log("Logged out");
           
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred during logout")
            console.log(error.message);
            
        }
        
    },

    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const response = await axios.get("/auth/profile");
            set({ user: response.data, checkingAuth: false });
        } catch (error) {
            console.log("profile", error.message);
            
            set({ checkingAuth: false, user: null });
        }
    },

    refreshToken: async () => {
        //Prevent multiple simultaneous refresh requests
        if (get().checkAuth) return;

        set({ checkingAuth: true });
        try {
            const res = await axios.get("/auth/refresh-token");
            set({ checkingAuth: false });
            return res.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            throw error;
        }
    },

}));

// Axios interceptor for toke refresh

let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                //If a refresh is already in progress, wait for it to complete

                if (refreshPromise) {
                    await refreshPromise;
                    return axios(originalRequest);
                }

                //Start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest);

            } catch (refreshError) {
                // if refresh fails redirect to login or handle as needed

                useUserStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
)
