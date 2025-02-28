/**
 * Service Booking Router
 */

import express from "express";
import { createBooking } from "../controllers/BookingController/createBooking.js";
import { deleteBooking } from "../controllers/BookingController/deleteBooking.js";
import { getBookingById, getBookingStatus, getBookingsByService, getBookingsByUser } from "../controllers/BookingController/getBooking.js";
import { updateBookingStatus, cancelBooking, approveBooking, markAsCompleted, markAsConfirmed, markAsNoShow, updatePayment, processRefund } from "../controllers/BookingController/updateBooking.js";

const bookingRouter = express.Router()

bookingRouter.post("/create", createBooking);
bookingRouter.delete("/delete", deleteBooking);
bookingRouter.get("/getById", getBookingById);
bookingRouter.get("/getByUser", getBookingsByUser);
bookingRouter.get("/getByService", getBookingsByService);
bookingRouter.get("/getStatus", getBookingStatus);
bookingRouter.post("/updateStatus", updateBookingStatus);
bookingRouter.post("/cancel", cancelBooking);
bookingRouter.post("/approve", approveBooking);
bookingRouter.post("/updatePayment", updatePayment);
bookingRouter.post("/refund", processRefund);
bookingRouter.post("/noShow", markAsNoShow);
bookingRouter.post("/confirm", markAsConfirmed);
bookingRouter.post("/complete", markAsCompleted);


export default bookingRouter;