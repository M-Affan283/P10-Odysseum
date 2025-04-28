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
    let {
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

    if (!businessId) return res.status(400).json({ message: "Business ID is required" });
    if (!name || !description || !category) return res.status(400).json({ message: "Service information is required" });
    if (!pricing || !paymentSettings || !bookingSettings || !cancellationPolicy || !availability) return res.status(400).json({ message: "Service settings are required" });

    // try
    // {
    //     pricing = JSON.parse(pricing);
    //     paymentSettings = JSON.parse(paymentSettings);
    //     bookingSettings = JSON.parse(bookingSettings);
    //     cancellationPolicy = JSON.parse(cancellationPolicy);
    //     availability = JSON.parse(availability);
    //     console.log(validatePricing(pricing), " \n", validatePaymentSettings(paymentSettings), " \n", validateBookingSettings(bookingSettings), " \n", validateCancellationPolicy(cancellationPolicy), " \n", validateAvailability(availability));
    // }
    // catch (error)
    // {
    //     return res.status(500).json({ message: "Internal server error" });
    // }


    // return res.status(200).json({ message: "Service created successfully" });

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
        const fileURLS = await uploadFile(files, business.ownerId);
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

    if (pricing.specialPrices && pricing.specialPrices.length > 0) 
    {
        for (const specialPrice of pricing.specialPrices) {
            if (!specialPrice.name) return { message: "Special price name is required", error: true };
            if (!specialPrice.price) return { message: "Special price is required", error: true };
            if (specialPrice.price <= 0) return { message: "Special price cannot be negative", error: true };
            if (!specialPrice.conditions) return { message: "Special price conditions are required", error: true };

            if (specialPrice.conditions.daysOfWeek && specialPrice.conditions.daysOfWeek.length > 0)
            {
                for (const day of specialPrice.conditions.daysOfWeek)
                {
                    if (!["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(day)) return { message: "Invalid day of week", error: true };
                }
            }

            if (specialPrice.conditions.specificDates && specialPrice.conditions.specificDates.length > 0)
            {
                for (const date of specialPrice.conditions.specificDates)
                {
                    if (!Date.parse(date)) return { message: "Invalid date format", error: true };
                }
            }

            if (!specialPrice.conditions.minPeople) return { message: "Minimum people is required in special pricing", error: true };
            
        }
    }

    return {message: "Pricing is valid", error: false};
}


const validatePaymentSettings = (paymentSettings) => 
{
    //expect defaults to be received from frotnend
    if (!paymentSettings) return { message: "Payment settings are required", error: true };

    if (paymentSettings.deposit.enabled) 
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


const validateAvailability = (availability) => {
    if (!availability) return { message: "Availability is required", error: true };
  
    // If availability is not recurring, validate dates
    if (!availability.recurring) 
    {
      // Validate that availability.dates exists and is not empty
      if (!availability.dates || availability.dates.length === 0) return { message: "Dates are required for availability", error: true };
  
      // Validate individual dates
      for (const date of availability.dates) 
      {
        if (!date.date || !Date.parse(date.date)) return { message: "Invalid date format", error: true };
        if (!date.totalCapacity) return { message: "Total capacity is required", error: true };
        if (date.totalCapacity < 0) return { message: "Total capacity cannot be negative", error: true };
      }
    } 
    else 
    {
      // If availability is recurring, validate recurring-related fields
      if (!availability.recurringStartDate) return { message: "Recurring start date is required", error: true };
      
      if (!Date.parse(availability.recurringStartDate)) return { message: "Invalid recurring start date", error: true };
      
      if (!availability.daysOfWeek || availability.daysOfWeek.length === 0) return { message: "Days of week are required for recurring availability", error: true };
      
  
      // Validate individual days of the week
      for (const day of availability.daysOfWeek) 
    {
        if (!day.day || !day.totalCapacity) return { message: "Day and total capacity are required", error: true };
        if (day.totalCapacity < 0) return { message: "Total capacity cannot be negative", error: true };
      }
    }
  
    return { message: "Availability is valid", error: false };
  };
  