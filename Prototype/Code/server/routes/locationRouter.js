import express from "express";
import { searchLocations } from "../controllers/LocationController/getLocation.js";

const locationRouter = express.Router();

locationRouter.get("/search", searchLocations);

export default locationRouter;