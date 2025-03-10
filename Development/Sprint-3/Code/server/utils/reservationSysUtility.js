/**
 * Utility functions to use in Reservation System (Service and Booking)
 */

import { Service } from "../models/Service.js";
import moment from "moment";

/**
 * Get service availability for a specific date
 * @param {String} serviceId - Service ID
 * @param {String} date - Date to check availability
 * @returns {Object} Availability info
 */
export const getServiceAvailabilityHelper = async (serviceId, date) =>
{
    try
    {
        const service = await Service.findById(serviceId);
        if (!service) return { message: "Service not found", error: true };

        // Setup vars
        //if no date then use current date (meaning check if service is available now)
        const requestedDate = date ? moment.utc(date).startOf('day') : moment().startOf('day');
        const availability = {
            serviceId: serviceId,
            serviceName: service.name,
            isAvailable: false,
            requestedDate: requestedDate.format('YYYY-MM-DD'),
            nextAvailableDate: null,
            availabilityStatus: "",
            remainingSpots: 0,
            upcomingDates: [],
            isRecurring: service.availability.recurring,
            availableDays: service.availability.daysOfWeek,
            recurringStartDate: service.availability.recurringStartDate 
                    ? moment.utc(service.availability.recurringStartDate).format('YYYY-MM-DD') 
                    : null
        };
        

        // Handle non-recurring services 
        if(!service.availability.recurring)
        {
            // console.log('requestedDate:', requestedDate.toISOString())
            const availableDates = service.availability.dates || [];

            // Filter and sort future dates with their capacities
            const futureAvailableDates = availableDates
                .filter(d => moment.utc(d.date).startOf('day').isSameOrAfter(requestedDate, 'day'))
                .sort((a, b) => moment.utc(a.date).diff(moment.utc(b.date)));

            // Format upcoming dates with capacity info
            availability.upcomingDates = futureAvailableDates.slice(0, 5).map(d => ({
                date: moment.utc(d.date).format('YYYY-MM-DD'),
                remainingSpots: d.totalCapacity - d.bookingsMade
            }));

            if (futureAvailableDates.length > 0) {
                const nextDate = futureAvailableDates[0];
                availability.nextAvailableDate = moment.utc(nextDate.date).format('YYYY-MM-DD');
                
                // Check if requested date matches next available
                if (moment.utc(nextDate.date).startOf('day').isSame(requestedDate, 'day')) {
                    availability.isAvailable = true;
                    availability.remainingSpots = nextDate.totalCapacity - nextDate.bookingsMade;
                }
            }
        }
        // Handle recurring services
        else 
        {
            // Check if requested date is after recurring start date
            if (service.availability.recurringStartDate && requestedDate.isBefore(moment.utc(service.availability.recurringStartDate).startOf('day')))
            {
                availability.availabilityStatus = `Service starts on ${moment.utc(service.availability.recurringStartDate).format('YYYY-MM-DD')}`;
                return { availability, error: false };
            }

            // Find the day configuration for requested date
            const requestedDay = requestedDate.format('dddd');
            const dayConfig = service.availability.daysOfWeek.find(d => d.day === requestedDay);

            if (dayConfig) 
            {
                availability.isAvailable = true;
                availability.remainingSpots = dayConfig.totalCapacity - dayConfig.bookingsMade;
            }

            // Get next 5 available dates with their capacities
            availability.upcomingDates = getNextAvailableDates(
                requestedDate,
                service.availability.daysOfWeek,
                5
            );

            // Set next available date
            if (!availability.isAvailable && availability.upcomingDates.length > 0) 
            {
                availability.nextAvailableDate = availability.upcomingDates[0].date;
            }
        }

        availability.availabilityStatus = getAvailabilityStatus(
            availability.isAvailable,
            availability.remainingSpots,
            availability.nextAvailableDate
        );

        return { availability, error: false };
    
    }
    catch(error)
    {
        console.log(error);
        throw error;
    }
}

/**
* Get next n available dates
* @param {moment} startDate - Starting date
* @param {Array} daysOfWeek - Array of available days
* @param {Number} count - Number of dates to return
* @returns {Array} Array of available dates
*/
const getNextAvailableDates = (startDate, daysOfWeek, count) => {
    const dates = [];
    let currentDate = startDate.clone();
    
    while (dates.length < count) {
        const dayConfig = daysOfWeek.find(d => d.day === currentDate.format('dddd'));
        if (dayConfig) {
            dates.push({
                date: currentDate.format('YYYY-MM-DD'),
                remainingSpots: dayConfig.totalCapacity - dayConfig.bookingsMade
            });
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
        if (remainingSpots <= 0) return 'Fully Booked';
        if (remainingSpots <= 3) return `Limited Availability - ${remainingSpots} spots left`;
        return `Available - ${remainingSpots} spots left`;
    }
    
    return nextDate ? `Next Available on ${nextDate}` : 'Currently Unavailable';
};