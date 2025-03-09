/**
 * getService.js
 *
 * Author: Affan
 */

import { Service } from "../../models/Service.js";
import { getServiceAvailabilityHelper } from "../../utils/reservationSysUtility.js";

/**
 * Get a service by ID
 */
const getServiceById = async (req, res) =>
{
  const { serviceId } = req.query;

  if (!serviceId) return res.status(400).json({ message: "Service ID is required" });

  try
  {
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    return res.status(200).json({ service: service });
  }
  catch (error)
  {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get all services of a business
 */
const getServicesByBusiness = async (req, res) =>
{
  const { businessId, page = 1 } = req.query;

  if (!businessId) return res.status(400).json({ message: "Business ID is required" });
  let limit = 6;

  try
  {
    let skip = (page - 1) * limit;

    const services = await Service.find({ businessId: businessId }).skip(skip).limit(Number(limit));
    if (!services) return res.status(200).json({ message: "No services found", services: [] });

    const totalServices = await Service.countDocuments({ businessId: businessId });

    return res.status(200).json({
      message: "Services found",
      services: services,
      currentPage: Number(page),
      totalPages: Math.ceil(totalServices / limit),
    });

  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get all services of a category
 */
const getServicesByCategory = async (req, res) =>
{
  const { category, page = 1 } = req.query;

  if (!category) return res.status(400).json({ message: "Category is required" });
  let limit = 6;

  try
  {
    let skip = (page - 1) * limit;

    const services = await Service.find({ category: category }).skip(skip).limit(Number(limit));
    if (!services) return res.status(200).json({ message: "No services found", services: [] });

    const totalServices = await Service.countDocuments({ category: category });

    return res.status(200).json({
      message: "Services found",
      services: services,
      currentPage: Number(page),
      totalPages: Math.ceil(totalServices / limit),
    });

  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get service availability.
 * Will check if a service is available at a certain time and date.
 * Will also return if the service is available for booking.
 * Will return the next available time
 * Will return the next available date
 */
const getServiceAvailability = async (req, res) =>
{
  // Expect data to be of JS Date type. So it will be a string in the format "YYYY-MM-DDTHH:MM:SSZ". expect iso string
  let { serviceId, date } = req.query;

  if (!serviceId) return res.status(400).json({ message: "Service ID is required" });

  try
  {
    const availabilityRes = await getServiceAvailabilityHelper(serviceId, date);
    if (availabilityRes.error) return res.status(404).json({ message: availabilityRes.message });

    return res.status(200).json({ availability: availabilityRes.availability });

  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get service availability helper
 * @param {String} serviceId - Service ID
 * @param {String} date - Requested date
 * @returns {Object} Availability info
*/


export {
  getServiceById,
  getServicesByBusiness,
  getServicesByCategory,
  getServiceAvailability,
};
