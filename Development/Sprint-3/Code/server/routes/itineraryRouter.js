import express from "express";
import createItinerary from "../controllers/ItineraryController/createItinerary.js";
import createOptimizedItinerary from "../controllers/ItineraryController/createOptimizedItninerary.js";

const itineraryRouter = express.Router();

itineraryRouter.post("/create", createItinerary);
itineraryRouter.post("/createOptimized", createOptimizedItinerary);

export default itineraryRouter;
