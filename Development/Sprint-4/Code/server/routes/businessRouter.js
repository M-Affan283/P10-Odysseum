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
  getBusinessBySearchQuery,
  getBusinessByCategoryAndLocation,
  getBusinessByHeatmapScoreAndLocation,
  getBusinessByLocation,
  getBusinessByUser,
  getBusinessMapData
} from "../controllers/BusinessController/getBusiness.js";
import { updateBusiness, likeBusiness, bookmarBusiness } from "../controllers/BusinessController/updateBusiness.js";
import upload from "../middlewares/multerMiddleware.js";

const businessRouter = express.Router();

businessRouter.post("/create", upload.array("media", 5), createBusiness);
businessRouter.get("/getById", getBusinessById);
businessRouter.get("/getAll", getAllBusinesses);
businessRouter.get("/getByCategory", getBusinessByCategory);
businessRouter.get("/search", getBusinessBySearchQuery);
businessRouter.get("/getByCategoryAndLocation", getBusinessByCategoryAndLocation);
businessRouter.get("/getByHeatmapScoreAndLocation", getBusinessByHeatmapScoreAndLocation);
businessRouter.get("/getByLocation", getBusinessByLocation);
businessRouter.get("/getByUser", getBusinessByUser);
businessRouter.get("/getNearUser", getBusinessNearUser);
businessRouter.get("/getAnalytics", getBusinessAnalytics);
businessRouter.get("/getMapData", getBusinessMapData);
businessRouter.post("/update", updateBusiness);
businessRouter.post("/like", likeBusiness);
businessRouter.post("/bookmark", bookmarBusiness);

export default businessRouter;
