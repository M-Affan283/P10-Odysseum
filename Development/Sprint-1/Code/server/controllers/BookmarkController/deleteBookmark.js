//  Author: Haroon Khawaja

import mongoose from "mongoose";
import { User } from "../../models/User";

// Deleting a specific bookmark
export const deleteBookmark = async (req, res) => {
    try {
        const { userId, bookmarkId } = req.params;
        
        // Find if user exissts
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        // Get specific bookmark
        const bookmark = user.bookmarks.id(bookmarkId);
        if (!bookmark) return res.status(404).json({ message: "Bookmark not found" });

        // Removing the bookmark
        bookmark.remove(); 
        await user.save();
        
        res.status(200).json({ message: "Bookmark deleted successfully" });

    } catch (error) {
        res.status(500).json({ 
            message: "Error deleting bookmark", 
            error: error.message,
        });
    }
};