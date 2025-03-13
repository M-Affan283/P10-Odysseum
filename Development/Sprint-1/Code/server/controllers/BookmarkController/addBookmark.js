//  Author: Haroon Khawaja

import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js"

// Adds or removes a bookmark from the user's bookmarks
export const bookmarkLocation = async (req, res) => {

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

        // Check if location is already bookmarked. otehrwise add it to bookmarks
        if(user.bookmarks.includes(locationId))
        {
            console.log("Removing bookmark...");
            user.bookmarks = user.bookmarks.filter(bookmark => bookmark != locationId);

        }
        else
        {
            console.log("Adding bookmark...");
            user.bookmarks.push(locationId);
        }

        await user.save();
        
        //get _id, name and image
        let userBookmarks = await Location.find({_id: { $in: user.bookmarks }}).select('_id name imageUrl');

        //send bookmarks back to user to update in local storage
        return res.status(200).json({ message: "Bookmarks updated successfully", bookmarks: userBookmarks });


    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: "Error adding bookmark"});
    }
};