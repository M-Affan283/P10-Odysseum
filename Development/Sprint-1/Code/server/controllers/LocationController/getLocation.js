// File: controllers/getLocation.js

//author: Luqman, Shahrez, Affan

import { Location } from "../../models/Location.js";
import { ERROR_MESSAGES } from "../../utils/constants.js";

/**
 * Search for locations by name or description.
 * @param {Object} req - Request object containing the search parameters.
 * @param {Object} res - Response object.
 */

export const searchLocations = async (req, res) => {
    const { searchParam = "", limit = 5, lastId } = req.query;

    if (!searchParam) return res.status(400).json({ error: ERROR_MESSAGES.NO_SEARCH_PARAM });

    try {
        const searchQuery = {
            name: { $regex: searchParam, $options: 'i' },
        };

        if (lastId) searchQuery._id = { $gt: lastId }; //if lastid is not given that means it is the first page

        let locations = await Location.find(searchQuery).limit(Number(limit)).sort({ _id: 1 }).exec();
        console.log(locations);
        const hasMore = locations.length === Number(limit);

        // change locations to send only name. once user clicks on the location, then we can fetch the location details
        locations = locations.map(location => {
            return {
                _id: location._id,
                name: location.name,
            };
        });


        return res.status(200).json({
            locations,
            pagination: {
                hasMore,
                lastId: locations.length > 0 ? locations[locations.length - 1]._id : null,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: ERROR_MESSAGES.SERVER_ERROR });
    }
};