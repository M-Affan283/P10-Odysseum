/**
 * Filename: updateBusiness.js
 * Author: Affan
*/

import { Business } from "../../models/Business.js";
import { User } from "../../models/User.js";
import { Location } from "../../models/Location.js";

const categories = ["Restaurant", "Hotel", "Shopping", "Fitness", "Health", "Beauty", "Education", "Entertainment", "Services", "Other"];

const updateBusiness = async (req, res) =>
{
    const { userId, businessId, name, category, address, description, website, contactInfo, operatingHours, locationId, longitude, latitude } = req.body;

    if (!businessId) return res.status(400).json({ message: "Business ID is required" });

    try
    {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const business = await Business.findById(businessId);
        if (!business) return res.status(404).json({ message: "Business not found" });

        if (business.ownerId.toString() !== userId) return res.status(401).json({ message: "Unauthorized" });

        if (name) business.name = name;
        if (address) business.address = address;
        if (description) business.description = description;
        if (website) business.website = website;
        
        if (category)
        {
            if (!categories.includes(category)) return res.status(400).json({ message: "Invalid category" });
            business.category = category
        }

        if (contactInfo)
        {
            const { phone, email } = contactInfo;
            if (phone) business.contactInfo.phone = phone;
            if (email) business.contactInfo.email = email;
        }

        if (operatingHours)
        {
            for (let day in operatingHours)
            {
                const { open, close } = operatingHours[day];
                if (open) business.operatingHours[day].open = open;
                if (close) business.operatingHours[day].close = close;
            }
        }

        if (locationId)
        {
            const location = await Location.findById(locationId);
            if (!location) return res.status(404).json({ message: "Location not found" });

            business.locationId = locationId;
        }

        if (longitude && latitude)
        {
            business.coordinates = {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        }

        await business.save();

        return res.status(200).json({ message: "Business updated successfully", business: business });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const bookmarBusiness = async (req, res) => {}
const likeBusiness = async (req, res) => {}

export { updateBusiness, bookmarBusiness, likeBusiness };