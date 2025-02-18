/**
 * createService.js
 *
 * Author: Affan
 */

import { Service } from "../../models/Service.js";
import { Business } from "../../models/Business.js";
import { uploadFile } from "../../services/firebaseService.js";

const categories = [
  "Restaurant",
  "Hotel",
  "Shopping",
  "Fitness",
  "Health",
  "Beauty",
  "Education",
  "Entertainment",
  "Services",
  "Other",
];

/**
 * Create a new service offering by a business
 */

export const createService = async (req, res) => {
  const {
    businessId,
    name,
    description,
    category,
    pricing,
    paymentSettings,
    bookingSettings,
    cancellationPolicy,
    availability,
    customDetails,
  } = req.body;
  const files = req.files;

  try
  {
    // parse all objects
    pricing = JSON.parse(pricing);
    paymentSettings = JSON.parse(paymentSettings);
    bookingSettings = JSON.parse(bookingSettings);
    cancellationPolicy = JSON.parse(cancellationPolicy);
    availability = JSON.parse(availability);
    customDetails = JSON.parse(customDetails);

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });

    // Check if category is valid
    if (!categories.includes(category)) return res.status(400).json({ message: "Invalid category" });

     // Run all validation functions
     const validationFunctions = 
     [
        validatePricing(pricing),
        validatePaymentSettings(paymentSettings),
        validateBookingSettings(bookingSettings),
        validateCancellationPolicy(cancellationPolicy),
        validateAvailability(availability)
    ];

    for (const validation of validationFunctions) 
    {
        if (validation.error) return res.status(400).json({ message: validation.message });
    }

    // Upload media files
    const fileURLS = await uploadFile(files, businessId);
    if (fileURLS.status !== 200) return res.status(500).json({ message: fileURLS.message });

    // Create new service
    const service = new Service({
      businessId: businessId,
      name: name,
      description: description,
      mediaUrls: fileURLS.urls,
      category: category,
      pricing: pricing,
      paymentSettings: paymentSettings,
      bookingSettings: bookingSettings,
      cancellationPolicy: cancellationPolicy,
      availability: availability,
      customDetails: customDetails,
    });

    await service.save();

    return res.status(201).json({ message: "Service created successfully", service: service });
}
  catch(error)
  {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }


};



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

    if (pricing.groupPricing && pricing.groupPricing.enabled) 
    {
        for (const tier of pricing.groupPricing.tiers) {
            if (!tier.minPeople) return { message: "Minimum people is required in group pricing", error: true };
            if (!tier.maxPeople) return { message: "Maximum people is required in group pricing", error: true };
            if (!tier.pricePerPerson) return { message: "Price per person is required in group pricing", error: true };
            if (tier.minPeople < 0) return { message: "Minimum people cannot be negative", error: true };
            if (tier.maxPeople < 0) return { message: "Maximum people cannot be negative", error: true };
            if (tier.pricePerPerson < 0) return { message: "Price per person cannot be negative", error: true };
        }
    }

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

    if (availability.totalCapacity < 0) return { message: "Total capacity cannot be negative", error: true };

    return {message: "Availability is valid", error: false};
}