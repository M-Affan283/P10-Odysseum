/**
 * deleteBooking.js
 * Author: Affan
*/

import { User } from "../../models/User.js";
import { Service } from "../../models/Service.js";
import { Booking } from "../../models/Booking.js";

export const deleteBooking = async (req, res) =>
{
    const { bookingId, serviceId, userId } = req.query;

    if (!bookingId || !serviceId || !userId) return res.status(400).json({ message: "Missing required fields" });

    try
    {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: "Service not found" });

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.userId.toString() !== userId || booking.serviceId.toString() !== serviceId) return res.status(403).json({ message: "Unauthorized" });

        await booking.deleteOne();

        return res.status(200).json({ message: "Booking deleted" });
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};