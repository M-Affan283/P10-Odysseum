/**
 * deleteService.js
 * 
 * Author: Affan
 */

import { Service } from "../../models/Service.js";
import { Business } from "../../models/Business.js";
import { User } from "../../models/User.js";
import { deleteFiles } from "../../services/firebaseService.js";

/**
 * Delete a service offering by a business
 */
export const deleteService = async (req, res) =>
{
    const { serviceId, userId } = req.query;

    if (!serviceId || !userId) return res.status(400).json({ message: "Missing required fields" });

    try
    {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: "Service not found" });
        
        const business = await Business.findById(service.businessId);
        if (!business) return res.status(404).json({ message: "Business not found" });

        // Check if the user is the owner of the business
        if (business.ownerId.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

        const deletedFilesResponse = await deleteFiles(service.mediaUrls);

        if (deletedFilesResponse.status !== 200) return res.status(500).json({ message: "Error deleting files" });

        await service.deleteOne();

        return res.status(200).json({ message: "Service deleted" });
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}