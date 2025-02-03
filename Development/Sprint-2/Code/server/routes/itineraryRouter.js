import express from "express";
import createItinerary from "../controllers/ItineraryController/createItinerary.js";
// import deleteItinerary from "../controllers/ItineraryController/deleteItinerary.js";
// import updateItinerary from "../controllers/ItineraryController/updateItinerary.js";
// import { getAllItineraries, getItineraryById } from "../controllers/ItineraryController/getItinerary.js";

const itineraryRouter = express.Router();

itineraryRouter.post("/create", createItinerary);
// itineraryRouter.put("/update/:id", updateItinerary);
// itineraryRouter.delete("/delete/:id", deleteItinerary);
// itineraryRouter.get("/getAll", getAllItineraries);
// itineraryRouter.get("/getById/:id", getItineraryById);

export default itineraryRouter;
