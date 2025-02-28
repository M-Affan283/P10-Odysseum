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
const updateServicePricing = async (req, res) =>
{
  const { userId, serviceId, pricing } = req.body;

  if (!userId || !serviceId || !pricing) return res.status(400).json({ message: "Please provide a user ID, a service ID and a price" });

  try
  {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const business = await Business.findById(service.businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    if (business.ownerId.toString() !== userId) return res.status(403).json({ message: "You are not authorized to update this service" });

    const validationResponse = validatePricing(pricing);
    if (validationResponse.error) return res.status(400).json({ message: validationResponse.message });

    service.pricing = pricing;
    await service.save();

    return res.status(200).json({ message: "Service pricing updated successfully" });
  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  };
};

/**
 * Update a service payment settings
 */
const updateServicePaymentSettings = async (req, res) =>
{
  const { userId, serviceId, paymentSettings } = req.body;

  if (!userId || !serviceId || !paymentSettings) return res.status(400).json({ message: "Please provide a user ID, a service ID and payment settings" });

  try
  {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const business = await Business.findById(service.businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    if (business.ownerId.toString() !== userId) return res.status(403).json({ message: "You are not authorized to update this service" });

    const validationResponse = validatePaymentSettings(paymentSettings);
    if (validationResponse.error) return res.status(400).json({ message: validationResponse.message });

    service.paymentSettings = paymentSettings;
    await service.save();

    return res.status(200).json({ message: "Service payment settings updated successfully" });
  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  };
};

/**
 * Update a service availability
 */
const updateServiceAvailability = async (req, res) =>
{
  const { userId, serviceId, availability } = req.body;

  if (!userId || !serviceId || !availability) return res.status(400).json({ message: "Please provide a user ID, a service ID and availability information" });

  try
  {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const business = await Business.findById(service.businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    if (business.ownerId.toString() !== userId) return res.status(403).json({ message: "You are not authorized to update this service" });

    const validationResponse = validateAvailability(availability);
    if (validationResponse.error) return res.status(400).json({ message: validationResponse.message });

    service.availability = availability;
    await service.save();

    return res.status(200).json({ message: "Service availability updated successfully" });
  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  };
};

/**
 * Update a service booking settings
 */
const updateServiceBookingSettings = async (req, res) =>
{
  const { userId, serviceId, bookingSettings } = req.body;

  if (!userId || !serviceId || !bookingSettings) return res.status(400).json({ message: "Please provide a user ID, a service ID and booking settings" });

  try
  {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const business = await Business.findById(service.businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    if (business.ownerId.toString() !== userId) return res.status(403).json({ message: "You are not authorized to update this service" });

    const validationResponse = validateBookingSettings(bookingSettings);
    if (validationResponse.error) return res.status(400).json({ message: validationResponse.message });

    service.bookingSettings = bookingSettings;
    await service.save();

    return res.status(200).json({ message: "Service booking settings updated successfully" });
  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  };
};

/**
 * Update a service cancellation policy
 */
const updateServiceCancellationPolicy = async (req, res) =>
{
  const { userId, serviceId, cancellationPolicy } = req.body;

  if (!userId || !serviceId || !cancellationPolicy) return res.status(400).json({ message: "Please provide a user ID, a service ID and a cancellation policy" });

  try
  {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const business = await Business.findById(service.businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    if (business.ownerId.toString() !== userId) return res.status(403).json({ message: "You are not authorized to update this service" });

    const validationResponse = validateCancellationPolicy(cancellationPolicy);
    if (validationResponse.error) return res.status(400).json({ message: validationResponse.message });

    service.cancellationPolicy = cancellationPolicy;
    await service.save();

    return res.status(200).json({ message: "Service cancellation policy updated successfully" });
  }
  catch (error)
  {
    console.log(error);
    return res.status(500).json({ message: error.message });
  };
};


// HELPER VALIDATION FUNCTIONS
const validatePricing = (pricing) => 
{
    if (!pricing) return { message: "Pricing is required", error: true };
    if (!pricing.pricingModel) return { message: "Pricing model is required", error: true };
    if (!pricing.basePrice) return { message: "Base price is required", error: true };
    
    if (!["fixed", "perHour", "perDay", "perPerson"].includes(pricing.pricingModel)) return { message: "Invalid pricing model", error: true };

    if (pricing.basePrice < 0) return { message: "Base price cannot be negative", error: true };

    if (pricing.specialPrices) 
    {
        for (const specialPrice of pricing.specialPrices) {
            if (!specialPrice.name) return { message: "Special price name is required", error: true };
            if (!specialPrice.price) return { message: "Special price is required", error: true };
            if (specialPrice.price < 0) return { message: "Special price cannot be negative", error: true };
            if (!specialPrice.conditions) return { message: "Special price conditions are required", error: true };

            for (const condition of specialPrice.conditions) {
                if (condition.daysOfWeek && condition.daysOfWeek.length > 0) {
                    for (const day of condition.daysOfWeek) {
                        if (!["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(day)) return { message: "Invalid day of week", error: true };
                    }
                }

                if (condition.specificDates && condition.specificDates.length > 0) {
                    for (const date of condition.specificDates) {
                        if (isNaN(Date.parse(date))) return { message: "Invalid date format", error: true };
                    }
                }

                if (condition.minPeople && condition.minPeople < 0) return { message: "Minimum people cannot be negative", error: true };
            }
        }
    }

    // if (pricing.groupPricing && pricing.groupPricing.enabled) 
    // {
    //     for (const tier of pricing.groupPricing.tiers) {
    //         if (!tier.minPeople) return { message: "Minimum people is required in group pricing", error: true };
    //         if (!tier.maxPeople) return { message: "Maximum people is required in group pricing", error: true };
    //         if (!tier.pricePerPerson) return { message: "Price per person is required in group pricing", error: true };
    //         if (tier.minPeople < 0) return { message: "Minimum people cannot be negative", error: true };
    //         if (tier.maxPeople < 0) return { message: "Maximum people cannot be negative", error: true };
    //         if (tier.pricePerPerson < 0) return { message: "Price per person cannot be negative", error: true };
    //     }
    // }

    return {message: "Pricing is valid", error: false};
}


const validatePaymentSettings = (paymentSettings) => 
{
    //expect defaults to be received from frotnend
    if (!paymentSettings) return { message: "Payment settings are required", error: true };

    if (paymentSettings.deposit.required) 
    {
        //only percentage. i removed amount from object
        if (paymentSettings.deposit.percentage < 0) return { message: "Deposit percentage cannot be negative", error: true };
    }

    if (paymentSettings.taxRate < 0 || paymentSettings.taxRate > 100) return { message: "Tax rate must be between 0 and 100", error: true };

    return {message: "Payment settings are valid", error: false};
}


const validateBookingSettings = (bookingSettings) =>
{
    if (!bookingSettings) return { message: "Booking settings are required", error: true };

    if (bookingSettings.minAdvanceBooking < 0) return { message: "Minimum advance booking cannot be negative", error: true };
    if (bookingSettings.maxAdvanceBooking < 0) return { message: "Maximum advance booking cannot be negative", error: true };
    if (bookingSettings.bookingTimeout < 0) return { message: "Booking timeout cannot be negative", error: true };

    // if (bookingSettings.creditCardPolicy && bookingSettings.creditCardPolicy.required)
    // {
    //     if (bookingSettings.creditCardPolicy.depositOnBooking && bookingSettings.creditCardPolicy.depositAmount < 0) return { message: "Deposit amount cannot be negative", error: true };
    // }

    return {message: "Booking settings are valid", error: false};
}

const validateCancellationPolicy = (cancellationPolicy) =>
{
    if (!cancellationPolicy) return { message: "Cancellation policy is required", error: true };

    if (cancellationPolicy.freeCancellationHours < 0) return { message: "Free cancellation hours cannot be negative", error: true };
    if (cancellationPolicy.cancellationFee < 0) return { message: "Cancellation fee cannot be negative", error: true };

    return {message: "Cancellation policy is valid", error: false};
}


const validateAvailability = (availability) =>
  {
      if (!availability) return { message: "Availability is required", error: true };
  
      //validate dates
      for (const date of availability.dates)
      {
          if (!date.date || !date.totalCapacity) return { message: "Date and total capacity are required", error: true };
          if (date.totalCapacity < 0) return { message: "Total capacity cannot be negative", error: true };
      }
  
      if (availability.recurring && !availability.recurringStartDate) return { message: "Recurring start date is required", error: true };
  
      //validate days of week
      for (const day of availability.daysOfWeek)
      {
          if (!day.day || !day.totalCapacity) return { message: "Day and total capacity are required", error: true };
          if (day.totalCapacity < 0) return { message: "Total capacity cannot be negative", error: true };
      }
  
      return {message: "Availability is valid", error: false};
  }

export {
  updateServiceInfo,
  updateServicePricing,
  updateServicePaymentSettings,
  updateServiceAvailability,
  updateServiceBookingSettings,
  updateServiceCancellationPolicy,
};
