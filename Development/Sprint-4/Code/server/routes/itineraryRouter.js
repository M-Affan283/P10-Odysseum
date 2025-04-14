import express from "express";
import createItinerary from "../controllers/ItineraryController/createItinerary.js";
import createOptimizedItinerary from "../controllers/ItineraryController/createOptimizedItninerary.js";
import getTemplates from "../controllers/ItineraryController/getTemplates.js";

const itineraryRouter = express.Router();

itineraryRouter.post("/create", createItinerary);
itineraryRouter.post("/createOptimized", createOptimizedItinerary);
itineraryRouter.get("/getTemplates", getTemplates);

export default itineraryRouter;
 