/*

File: userStore.js

This file contains the user store context which is used to store the user data and provide it to the components that need it.

Author: Affan & Shahrez

*/

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { deleteAccessToken } from "../utils/tokenUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

//test async sotrage
// Creating Zustand store for user management
const useUserStore = create(
  persist(
    (set) => ({
      // Initial state
      user: null, // user is an object with properties: _id, firstName, lastName, email, username, role
      isLoggedIn: false,

      // Actions
      setUser: (user) => set({ user: user, isLoggedIn: true }),

      logout: async () => {
        set({ user: null, isLoggedIn: false });
        await AsyncStorage.removeItem("user-storage"); // Remove user from storage
        deleteAccessToken(); // Remove token from secure storage
      },
    }),
    {
      name: "user-storage", // Key for persistence
      storage: createJSONStorage(()=>AsyncStorage), // Storage medium
    }
  )
);

export default useUserStore;