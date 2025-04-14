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
let tempUser = {
  _id: "672f358fb3e56fac046d76a5",
  firstName: "Muhammad Affan",
  lastName: "Naved",
  email: "maffan@outlook.com",
  username: "affantest",
  profilePicture:
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  bio: "I like to travel ",
  role: "user",
  following: [],
  followers: [],
  posts: [
    {
      _id: "6730787a070ca3617028ad30",
      creatorId: "672f358fb3e56fac046d76a5",
      caption: "Hi this is a caption",
      mediaUrls: [
        "https://firebasestorage.googleapis.com/v0/b/odysseumstorage.appspot.com/o/672f358fb3e56fac046d76a5%2F5a4c5f16-b526-48e9-a8b8-56150d33febc_43784.jpg?alt=media&token=e8d4c066-06db-4a62-8d5a-de9703f61433",
      ],
      likes: [],
    },
    {
      _id: "67307bbe0fe5cfaf17cbe7c4",
      creatorId: "672f358fb3e56fac046d76a5",
      caption: "Second post",
      mediaUrls: [
        "https://firebasestorage.googleapis.com/v0/b/odysseumstorage.appspot.com/o/672f358fb3e56fac046d76a5%2Ff59e94b0-f6ee-4b31-9eec-18fe905368fa_37042.jpg?alt=media&token=659018b2-3a81-43ef-9edb-610b68c4a4c7",
      ],
      likes: [],
    },
    {
      _id: "67307bbe0fe5cfaf17cbe7c2",
      creatorId: "672f358fb3e56fac046d76a5",
      caption: "Second post",
      mediaUrls: [
        "https://firebasestorage.googleapis.com/v0/b/odysseumstorage.appspot.com/o/672f358fb3e56fac046d76a5%2Ff59e94b0-f6ee-4b31-9eec-18fe905368fa_37042.jpg?alt=media&token=659018b2-3a81-43ef-9edb-610b68c4a4c7",
      ],
      likes: [],
    },
    {
      _id: "67307bbe0fe5cfaf171be7c4",
      creatorId: "672f358fb3e56fac046d76a5",
      caption: "Second post",
      mediaUrls: [
        "https://firebasestorage.googleapis.com/v0/b/odysseumstorage.appspot.com/o/672f358fb3e56fac046d76a5%2Ff59e94b0-f6ee-4b31-9eec-18fe905368fa_37042.jpg?alt=media&token=659018b2-3a81-43ef-9edb-610b68c4a4c7",
      ],
      likes: [],
    },
  ],
  bookmarks: [
    {
      _id: "67310369aa977e99fcc2c31e",
      name: "Chitral, KPK",
    },
  ],
};

// Creating Zustand store for user management
const useUserStore = create(
  persist(
    (set) => ({
      // Initial state - Using tempUser for development purposes
      user: tempUser,
      isLoggedIn: true, // Set to true for testing, should be false in production

      // Actions
      setUser: (user) => set({ user: user, isLoggedIn: true }),

      logout: async () => {
        set({ user: null, isLoggedIn: false }); // Make sure to also set user to null
        await AsyncStorage.removeItem("user-storage"); // Remove user from storage
        deleteAccessToken(); // Remove token from secure storage
      },
    }),
    {
      name: "user-storage", // Key for persistence
      storage: createJSONStorage(() => AsyncStorage), // Storage medium
    }
  )
);

export default useUserStore;
