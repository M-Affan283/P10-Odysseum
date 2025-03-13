import express from "express";
import createItinerary from "../controllers/ItineraryController/createItinerary.js";

const itineraryRouter = express.Router();

itineraryRouter.post("/create", createItinerary);

export default itineraryRouter;
