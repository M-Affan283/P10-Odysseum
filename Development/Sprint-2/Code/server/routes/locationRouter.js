import express from "express";
import { getAllLocations,searchLocations, getLocationById } from "../controllers/LocationController/getLocation.js";
import { addLocation } from "../controllers/LocationController/addLocation.js";

const locationRouter = express.Router();

locationRouter.post("/add", addLocation);
locationRouter.get("/getAll", getAllLocations);
locationRouter.get("/search", searchLocations);
locationRouter.get("/getById", getLocationById);

export default locationRouter;