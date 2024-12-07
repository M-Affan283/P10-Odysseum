//  Author: Haroon Khawaja

import mongoose from "mongoose";
import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js"
// Adding a new bookmark
export const addBookmark = async (req, res) => {

    const { userId, locationId } = req.body;
    console.log("userId: ", userId);
    try
    {
        // Find if user exists
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found"});

        // Find if location exists
        const location = await Location.findById(locationId);
        if (!location) return res.status(404).json({ message: "Location not found"});

        // Creating a new bookmark
        // const newBookmark = { id: locationId, name: location.name };
        user.bookmarks.push(location._id);
        await user.save();

        res.status(201).json({ 
            message: "Bookmark created successfully",
            // bookmark: newBookmark
        });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: "Error adding bookmark"});
    }

    // try {
    //     // NO URLS OR TAGS RIGHT NOW
    //     // const { userId } = req.params;
    //     // const { title, url, tags} = req.body;
        
    //     const { userId, title } = req.body;
    //     const url = "none";
    //     const tags = "none";

    //     // Find if user exists
    //     const user = await User.findById(userId);
    //     if (!user) return res.statis(404).json({ message: "User not found"});
        
    //     // Creating a new bookmark
    //     const newBookmark = { title };
    //     user.bookmarks.push(newBookmark);
    //     await user.save();

    //     res.status(201).json({ 
    //         message: "Bookmark created successfully",
    //         bookmark: newBookmark,
    //     });

    // } catch (error) {
    //     res.status(500).json({
    //         message: "Error creating bookmark",
    //         error: error.message,
    //     });
    // }
};