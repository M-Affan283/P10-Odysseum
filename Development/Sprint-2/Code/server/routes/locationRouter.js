import express from "express";
import { getAllLocations,searchLocations, getLocationById } from "../controllers/LocationController/getLocation.js";
import { addLocation } from "../controllers/LocationController/addLocation.js";

const locationRouter = express.Router();

locationRouter.post("/addLocation", addLocation);
locationRouter.get("/getAllLocations", getAllLocations);
locationRouter.get("/search", searchLocations);
locationRouter.get("/getById", getLocationById);

export default locationRouter;