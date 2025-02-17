/**
 * getService.js
 *
 * Author: Affan
 */

import { Service } from "../../models/Service.js";
import { Business } from "../../models/Business.js";
import { User } from "../../models/User.js";
import moment from "moment";

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

    return res.status(200).json({ service });
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
  // Expect data to be of JS Date type. So it will be a string in the format "YYYY-MM-DDTHH:MM:SSZ"
  const { serviceId, date } = req.query;

  if (!serviceId) return res.status(400).json({ message: "Service ID is required" });

  try
  {
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Setup vars
    const requestedDate = date ? moment(date) : moment(); //if no date then use current date (meaning check if service is available now)
    const availability = {
      serviceId: serviceId,
      serviceName: service.name,
      isAvailable: false,
      nextAvailableDate: null,
      // nextAvailableTime: null,
      availabilityStatus: "",
      remainingSpots: 0,
      upcomingDates: [],
      isRecurring: service.availability.recurring,
      availableDays: service.availability.daysOfWeek,
    };

    // Calculate remaining spots
    const remainingSpots = service.availability.totalCapacity ? 
                          service.availability.totalCapacity - service.availability.bookingsMade 
                          : null;

    availability.remainingSpots = remainingSpots;

    // If no remaining spots then return fully booked
    if (remainingSpots !== null && remainingSpots <= 0) 
    {
      availability.availabilityStatus = 'Fully Booked';
      return res.status(200).json(availability);
    }

    // Handle non-recurring services 
    if(!service.availability.recurring)
    {

      const availableDates = service.availability.dates || []; // Get available dates for the service
      const futureAvailableDates = availableDates.filter(d => moment(d).isSameOrAfter(requestedDate, 'day')).sort(); // Get future available dates that are after the requested date

      availability.upcomingDates = futureAvailableDates.slice(0, 5); // Show only 5 upcoming dates

      if (futureAvailableDates.length > 0)
      {
        availability.nextAvailableDate = futureAvailableDates[0]; // Get the next available date
        availability.isAvailable = moment(requestedDate).isSame(futureAvailableDates[0], 'day'); // Check if the requested date is the next available date
      }
      else
      {
        availability.availabilityStatus = 'Not Available';
      }
    }
    // Handle recurring services
    else 
    {
      const nextAvailableDay = findNextAvailableDay(requestedDate,service.availability.daysOfWeek); // Find the next available day based on the service's days of week

      if (nextAvailableDay) // if there is an available day
      {
          availability.nextAvailableDate = nextAvailableDay.format('YYYY-MM-DD');
          availability.isAvailable = requestedDate.isSame(nextAvailableDay, 'day'); // Check if the requested date is the next available date

          // Get next 5 available dates
          availability.upcomingDates = getNextAvailableDates(requestedDate,service.availability.daysOfWeek, 5);
      }
    }

    availability.availabilityStatus = getAvailabilityStatus(
      availability.isAvailable,
      remainingSpots,
      availability.nextAvailableDate
    );

    return res.status(200).json(availability);
   
  }
  catch(error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Find the next available day based on service's days of week
 * @param {moment} startDate - Starting date to check from
 * @param {Array} availableDays - Array of available days
 * @returns {moment|null} Next available date
 */
const findNextAvailableDay = (startDate, availableDays) =>
{
  if (!availableDays || availableDays.length === 0) return null;

  let currentDate = startDate.clone();
  const daysChecked = 0;
  const MAX_DAYS_TO_CHECK = 30;

  while (daysChecked < MAX_DAYS_TO_CHECK) {
      if (availableDays.includes(currentDate.format('dddd')))
      {
          return currentDate;
      }
      currentDate.add(1, 'day');
  }

  return null;
};

/**
* Get next n available dates
* @param {moment} startDate - Starting date
* @param {Array} availableDays - Array of available days
* @param {Number} count - Number of dates to return
* @returns {Array} Array of available dates
*/
const getNextAvailableDates = (startDate, availableDays, count) => {
  const dates = [];
  let currentDate = startDate.clone();
  
  while (dates.length < count) {
      if (availableDays.includes(currentDate.format('dddd')))
      {
          dates.push(currentDate.format('YYYY-MM-DD'));
      }
      currentDate.add(1, 'day');
  }

  return dates;
};

/**
* Get availability status message
* @param {Boolean} isAvailable - Is service available on requested date
* @param {Number} remainingSpots - Number of remaining spots
* @param {String} nextDate - Next available date
* @returns {String} Status message
*/
const getAvailabilityStatus = (isAvailable, remainingSpots, nextDate) => {
  if (isAvailable)
  {
      if (remainingSpots === null) return 'Available';
      if (remainingSpots <= 3) return `Limited Availability - ${remainingSpots} spots left`;
      return `Available - ${remainingSpots} spots left`;
  }
  
  return nextDate ? `Next Available on ${nextDate}` : 'Currently Unavailable';
};

export {
  getServiceById,
  getServicesByBusiness,
  getServicesByCategory,
  getServiceAvailability,
};
