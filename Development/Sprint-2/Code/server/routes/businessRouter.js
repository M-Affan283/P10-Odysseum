/**
 * File: businessRouter.js
 * Author: Affan
 */

import express from "express";
import { createBusiness } from "../controllers/BusinessController/createBusiness.js";
import {
  getBusinessById,
  getAllBusinesses,
  getBusinessNearUser,
  getBusinessAnalytics,
  getBusinessByCategory,
  getBusinessByCategoryAndLocation,
  getBusinessByHeatmapScoreAndLocation,
  getBusinessByLocation,
  getBusinessByUser,
} from "../controllers/BusinessController/getBusiness.js";

const businessRouter = express.Router();

businessRouter.post("/create", createBusiness);
businessRouter.get("/getById", getBusinessById);
businessRouter.get("/getAll", getAllBusinesses);
businessRouter.get("/getByCategory", getBusinessByCategory);
businessRouter.get("/getByCategoryAndLocation", getBusinessByCategoryAndLocation);
businessRouter.get("/getByHeatmapScoreAndLocation", getBusinessByHeatmapScoreAndLocation);
businessRouter.get("/getByLocation", getBusinessByLocation);
businessRouter.get("/getByUser", getBusinessByUser);
businessRouter.get("/getNearUser", getBusinessNearUser);
businessRouter.get("/getAnalytics", getBusinessAnalytics);

export default businessRouter;
