/**
 * geteBooking.js
 * Author: Affan
 */


import { Booking } from "../../models/Booking.js";

const getBookingById = async (req, res) =>
{
    const { bookingId } = req.query;
    try
    {
        const booking = await Booking.findById(bookingId).populate("userId serviceId");
        if (!booking)
        {
            return res.status(404).json({ message: "Booking not found" });
        }
        return res.status(200).json({ booking });
    }
    catch (error)
    {
        return res.status(500).json({ message: error.message });
    }
};

const getBookingsByUser = async (req, res) =>
{
  const { userId, page = 1 } = req.query;

  let limit=10;

  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try
  {
    let skip = (page - 1) * limit;

    const bookings = await Booking.find({ userId: userId }).skip(skip).limit(Number(limit)).populate("serviceId");
    if (!bookings) return res.status(200).json({ message: "No bookings found", bookings: [] });

    const totalBookings = await Booking.countDocuments({ userId: userId });

    return res.status(200).json({
      message: "Bookings found",
      bookings: bookings,
      currentPage: Number(page),
      totalPages: Math.ceil(totalBookings / limit),
    });
  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

//for business owners to get bookings for their services
const getBookingsByService = async (req, res) =>
{
  const { serviceId, page = 1 } = req.query;
  let limit=10;

  if (!serviceId) return res.status(400).json({ message: "Service ID is required" });

  try
  {
    let skip = (page - 1) * limit;

    const bookings = await Booking.find({ serviceId: serviceId }).skip(skip).limit(Number(limit)).populate("userId");
    if (!bookings) return res.status(200).json({ message: "No bookings found", bookings: [] });

    const totalBookings = await Booking.countDocuments({ serviceId: serviceId });

    return res.status(200).json({
      message: "Bookings found",
      bookings: bookings,
      currentPage: Number(page),
      totalPages: Math.ceil(totalBookings / limit),
    });
  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }

};

const getBookingStatus = async (req, res) =>
{
    const { bookingId } = req.query;
    try
    {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        return res.status(200).json({ status: booking.status });
    }
    catch (error)
    {
        return res.status(500).json({ message: error.message });
    }
};


export {
  getBookingById,
  getBookingsByUser,
  getBookingsByService,
  getBookingStatus,
};
