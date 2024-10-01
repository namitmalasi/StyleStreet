import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null, // Initial state
  loading: false, // Initial loading state
  checkingAuth: true, // Initial authentication check state

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true }); // Set loading state to true while the request is being made

    // Validate passwords
    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      set({ user: res.data, loading: false }); // Set user and loading state on successful signup
      toast.success("Signup successful!");
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data?.message || "Error occurred during signup"
      ); // Handle errors
    }
  },
  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/signin", { email, password });
      set({ user: res.data, loading: false }); // Set user and loading state on successful signup
      toast.success("Login successful!");
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response?.data?.message || "Error occurred during login"
      ); // Handle errors
    }
  },
  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error occurred during logout"
      );
    }
  },
  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ user: response.data, checkingAuth: false });
    } catch (error) {
      set({ checkingAuth: false, user: null });
    }
  },
}));
