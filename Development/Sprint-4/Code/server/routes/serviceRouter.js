/**
 * Business Service Router
 */

import express from "express";
import upload from "../middleware/multerMiddleware.js";
import { createService } from "../controllers/ServiceController/createService.js";
import { deleteService } from "../controllers/ServiceController/deleteService.js";
import {
  getServiceById,
  getServicesByBusiness,
  getServicesByCategory,
  getServiceAvailability,
} from "../controllers/ServiceController/getService.js";
import {
  updateServiceInfo,
  updateServicePricing,
  updateServicePaymentSettings,
  updateServiceAvailability,
  updateServiceBookingSettings,
  updateServiceCancellationPolicy,
} from "../controllers/ServiceController/updateService.js";

const serviceRouter = express.Router();

serviceRouter.post("/create", upload.array("media", 3), createService);
serviceRouter.delete("/delete", deleteService);
serviceRouter.get("/getById", getServiceById);
serviceRouter.get("/getByBusiness", getServicesByBusiness);
serviceRouter.get("/getByCategory", getServicesByCategory);
serviceRouter.get("/getAvailability", getServiceAvailability);
serviceRouter.post("/updateInfo", updateServiceInfo);
serviceRouter.post("/updatePricing", updateServicePricing);
serviceRouter.post("/updatePaymentSettings", updateServicePaymentSettings);
serviceRouter.post("/updateAvailability", updateServiceAvailability);
serviceRouter.post("/updateBookingSettings", updateServiceBookingSettings);
serviceRouter.post("/updateCancellationPolicy", updateServiceCancellationPolicy);

export default serviceRouter;
