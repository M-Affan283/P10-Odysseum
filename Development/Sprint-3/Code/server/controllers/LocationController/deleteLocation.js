/*
    File: deleteLocation.js

    Author: Affan
*/

import { Location } from "../../models/Location.js";
import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";

/**
 * Deletes a location from the database
 */
export const deleteLocation = async (req,res) =>
{
    const { locationId, userId } = req.query;

    if(!locationId) return res.status(400).json({error: ERROR_MESSAGES.NO_LOCATION_ID});
    if(!userId) return res.status(400).json({error: ERROR_MESSAGES.NO_USER_ID});

    try
    {
        const location = await Location.findById(locationId);
        if(!location) return res.status(404).json({error: "Location not found"});
        
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

        //Authorization check. If not creator or admin, return unauthorized
        if(user.role !== 'admin') return res.status(401).json({error: ERROR_MESSAGES.UNAUTHORIZED});

        await location.deleteOne();

        return res.status(200).json({message: "Location deleted successfully"});

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }
}