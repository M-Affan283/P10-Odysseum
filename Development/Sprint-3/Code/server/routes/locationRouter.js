import express from "express";
import { getAllLocations,searchLocations, getLocationById, getPopularLocations } from "../controllers/LocationController/getLocation.js";
import { addLocation } from "../controllers/LocationController/addLocation.js";
import { deleteLocation } from "../controllers/LocationController/deleteLocation.js";

const locationRouter = express.Router();

locationRouter.post("/add", addLocation);
locationRouter.get("/getAll", getAllLocations);
locationRouter.get("/search", searchLocations);
locationRouter.get("/getById", getLocationById);
locationRouter.get("/getPopular", getPopularLocations);
locationRouter.delete("/delete", deleteLocation);

export default locationRouter;