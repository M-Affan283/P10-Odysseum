/**
 * File: createBusiness.js
 * Author: Affan
*/

import { Business } from "../../models/Business.js";
import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js";



const categories = ["Restaurant", "Hotel", "Shopping", "Fitness", "Health", "Beauty", "Education", "Entertainment", "Services", "Other"];
/**
 * Create a new business
*/
export const createBusiness = async (req, res) =>
{
    const { name, category, description, imageUrls, contactInfo, operatingHours, locationId, creatorId, longitude, latitude } = req.body;

    if (!name) return res.status(400).json({ message: "Business name is required" });
    if (!category) return res.status(400).json({ message: "Business category is required" });
    if (!locationId) return res.status(400).json({ message: "Location ID is required" });
    if (!coordinates) return res.status(400).json({ message: "Coordinates are required" });

    try
    {
        const creator = await User.findById(creatorId);
        if (!creator) return res.status(404).json({ message: "User not found" });

        const location = await Location.findById(locationId);
        if (!location) return res.status(404).json({ message: "Location not found" });

        if (categories.indexOf(category) === -1) return res.status(400).json({ message: "Invalid category" });

        const business = new Business({
            name,
            category,
            description,
            imageUrls,
            contactInfo,
            operatingHours,
            locationId,
            creatorId,
            coordinates: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        });

        await business.save();

        res.status(201).json({ 
            message: "Business added successfully",
            business: business
        });

    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}