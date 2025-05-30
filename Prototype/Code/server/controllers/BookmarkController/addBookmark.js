//  Author: Haroon Khawaja

import mongoose from "mongoose";
import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js"
// Adding a new bookmark
export const addBookmark = async (req, res) => {
    try {
        // NO URLS OR TAGS RIGHT NOW
        // const { userId } = req.params;
        // const { title, url, tags} = req.body;
        
        const { userId, title } = req.body;
        const url = "none";
        const tags = "none";

        // Find if user exists
        const user = await User.findById(userId);
        if (!user) return res.statis(404).json({ message: "User not found"});
        
        // Creating a new bookmark
        const newBookmark = { title };
        user.bookmarks.push(newBookmark);
        await user.save();

        res.status(201).json({ 
            message: "Bookmark created successfully",
            bookmark: newBookmark,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating bookmark",
            error: error.message,
        });
    }
};