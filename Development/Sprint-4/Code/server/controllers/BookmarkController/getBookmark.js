
import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js";
import { Business } from "../../models/Business.js";

/**
 * Get the location bookmarks of the user
 */
const getUserLocationBookmarks = async (req, res) =>
{
    const { searchParam="", page=1, userId} = req.query;
    const limit = 10;

    try
    {
        const user = await User.findById(userId);

        if(!user) return res.status(404).json({error: "User not found"});

        const skip = (page - 1) * limit;
        
        const bookmarks = await Location.find({_id: { $in: user.bookmarks }, name: { $regex: searchParam, $options: 'i' }}).skip(skip).limit(limit).select('_id name imageUrl');
        const totalBookmarks = user.bookmarks.length;
        
        return res.status(200).json({
            message: "Bookmarks found",
            bookmarks: bookmarks,
            currentPage: Number(page),
            totalPages: Math.ceil(totalBookmarks / limit)
        });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: "Server error"});
    }
}

/**
 * Get the business bookmarks of the user
*/
const getUserBusinessBookmarks = async (req, res) =>
{
    const { searchParam="", page=1, userId} = req.query;
    const limit = 10;

    try
    {
        const user = await User.findById(userId);

        if(!user) return res.status(404).json({error: "User not found"});

        const skip = (page - 1) * limit;
        
        const bookmarks = await Business.find({_id: { $in: user.businessBookmarks }, name: { $regex: searchParam, $options: 'i' }}).skip(skip).limit(limit).select('_id name mediaUrls');
        const totalBookmarks = user.businessBookmarks.length;
        
        return res.status(200).json({
            message: "Bookmarks found",
            bookmarks: bookmarks,
            currentPage: Number(page),
            totalPages: Math.ceil(totalBookmarks / limit)
        });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: "Server error"});
    }

}

export { getUserLocationBookmarks, getUserBusinessBookmarks };