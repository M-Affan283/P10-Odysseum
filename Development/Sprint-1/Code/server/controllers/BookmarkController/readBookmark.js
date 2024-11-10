//  Author: Haroon Khawaja

import mongoose from "mongoose";
import { User } from "../../models/User";

// Reading all the bookmarks of a user
export const getBookmarks = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find if user exists
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // returning the user's bookmarks array
        res.status(200).json(user.bookmarks);
        
    } catch (error) {
        res.status(500).json({
            message: "Error fetching bookmarks",
            error: error.message 
        });
    }
};