/*
    Author: Haroon Khawaja
*/
import { Itinerary } from "../../models/Itinerary.js";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../utils/constants.js";

const createItinerary = async (req, res) => {
    console.log(JSON.stringify(req.body, null, 2))

    const { destinations } = req.body
    try {
        if (!destinations || !Array.isArray(destinations) || destinations.length < 2) {
            return res.status(400).json({ 
                message: ERROR_MESSAGES.INVALID_ITINERARY
            })
        }
        
        // Creating a new itinerary instance and saving to database
        const newItinerary = await Itinerary.create({ destinations });
        res.status(201).json({
            message: SUCCESS_MESSAGES.ITINERARY_CREATED,
            newItinerary,
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};
export default createItinerary;