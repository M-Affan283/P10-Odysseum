/*

Filename: addLocation.js

This file contains the controller function for adding a new location. It creates a new location in the database. The user can then view the location on their feed.

Author: Affan


*/

import { Location } from "../../models/Location.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../utils/constants.js";

export const addLocation = async (req, res) => {
    const { name, description, latitude, longitude } = req.body;

    try 
    {

        // Check if the location already exists
        const existingLocation = await Location.findOne({ name: name });

        if (existingLocation) return res.status(400).json({ message: ERROR_MESSAGES.LOCATION_ALREADY_EXISTS });

        const location = await Location.create({
            name: name,
            description: description,
            coordinates: {
                type: "Point",
                coordinates: [longitude, latitude],
            },
        });

        res.status(201).json({
            message: SUCCESS_MESSAGES.LOCATION_ADDED,
            location,
        });
    }
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
}   