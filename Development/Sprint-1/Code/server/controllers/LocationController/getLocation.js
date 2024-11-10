// File: controllers/getLocation.js

//author: Luqman, Shahrez, Affan

// import mongoose from "mongoose";
// // import { Location } from "./models/Location.js";
// import dotenv from 'dotenv';

// // Initializing dotenv file
// dotenv.config({ path: '../../config.env' });

// const environment = process.argv[2] || 'remote';
// const MONGO_URI = environment === 'local' ? process.env.MONGODB_URI_LOCAL : process.env.MONGODB_URI_REMOTE;
// const PORT = process.env.PORT || 8000;
// const app = (await import('../../app.js')).default;

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
// // Connecting to MongoDB
// mongoose.connect(MONGO_URI)
//     .then(() => {
//         console.log("\nConnected to MongoDB");
//         addLocations();
//     })
//     .catch((error) => {
//         console.log("Could not connect");
//     });
// searchLocations({ query: { searchParam: "Chitral, KPK" } }, { status: (code) => { return { json: (data) => console.log(data) } } });