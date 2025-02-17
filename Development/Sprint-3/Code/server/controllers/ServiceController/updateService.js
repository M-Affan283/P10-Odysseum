/**
 * updateService.js
 *
 * Author: Affan
 */

import { Service } from "../../models/Service.js";
import { Business } from "../../models/Business.js";
import { User } from "../../models/User.js";

/**
 * Update a service unformation such as name, description
 */

const updateServiceInfo = async (req, res) =>
{
  const { userId, serviceId, name=null, description=null } = req.body;

  if (!userId || !serviceId) return res.status(400).json({ message: "Please provide a user ID and a service ID" });

  try
  {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const business = await Business.findById(service.businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    if (business.ownerId.toString() !== userId) return res.status(403).json({ message: "You are not authorized to update this service" });

    if (name) service.name = name;
    if (description) service.description = description;
    
    await service.save();

    return res.status(200).json({ message: "Service information updated successfully" });
  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  };
};

/**
 * Update a service pricing information
 */
const updateServicePricing = async (req, res) => {};

/**
 * Update a service payment settings
 */
const updateServicePaymentSettings = async (req, res) => {};

/**
 * Update a service availability
 */
const updateServiceAvailability = async (req, res) => {};

/**
 * Update a service booking settings
 */
const updateServiceBookingSettings = async (req, res) => {};

/**
 * Update a service cancellation policy
 */
const updateServiceCancellationPolicy = async (req, res) => {};

export {
  updateServiceInfo,
  updateServicePricing,
  updateServicePaymentSettings,
  updateServiceAvailability,
  updateServiceBookingSettings,
  updateServiceCancellationPolicy,
};
