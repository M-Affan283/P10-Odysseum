/**
 * createBooking.js
 * Author: Affan
*/

import { User } from "../../models/User.js";
import { Service } from "../../models/Service.js";
import { Booking } from "../../models/Booking.js";
import { getServiceAvailabilityHelper } from "../../utils/reservationSysUtility.js";
import moment from "moment";

export const createBooking = async (req, res) =>
{
    let { userId, serviceId, numberOfPeople, timeSlot, bookingDate } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID is required" });
    if (!serviceId) return res.status(400).json({ message: "Service ID is required" });
    if (!numberOfPeople) return res.status(400).json({ message: "Number of people is required" });
    if (!timeSlot) return res.status(400).json({ message: "Time slot is required" });
    if (!bookingDate) return res.status(400).json({ message: "Booking date is required" });

    try
    {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: "Service not found" });

        //validate time slots
        timeSlot = JSON.parse(timeSlot);
        let startTime = moment(timeSlot.startTime).utc();
        let endTime = moment(timeSlot.endTime).utc();
        let currTime = moment().utc();
        
        if(startTime.isBefore(currTime.clone().add(service.bookingSettings.minAdvanceBooking, 'hours'))) return res.status(400).json({ message: `Booking must be made at least ${service.bookingSettings.minAdvanceBooking} hours in advance` });

        if(startTime.isAfter(currTime.clone().add(service.bookingSettings.maxAdvanceBooking, 'days'))) return res.status(400).json({ message: `Booking must be made at most ${service.bookingSettings.maxAdvanceBooking} days in advance` });
        
        if(endTime.isBefore(startTime)) return res.status(400).json({ message: "End time should be after start time" });


        // 3. Check service availability
        const availabilityCheck = await getServiceAvailabilityHelper(serviceId, moment(bookingDate).utc())

        if (!availabilityCheck.isAvailable)
        {
            return res.status(400).json({
                success: false,
                message: "Service is not available for the requested date"
            });
        }

        // 4. Validate capacity
        if (availabilityCheck.remainingSpots < numberOfPeople)
        {
            return res.status(400).json({
                success: false,
                message: "Not enough capacity for the requested number of people"
            });
        }

        const pricing = calculateBookingPrice(service, numberOfPeople, bookingDate, timeSlot);

        // 6. Determine booking status based on approval requirements
        const requiresApproval = service.bookingSettings.requiresApproval;
        const initialStatus = requiresApproval ? 'pending' : 'confirmed';

        const paymentMethod = service.paymentSettings.acceptOnlinePayment ? req.body.paymentMethod : null;
        const paymentDetails = service.paymentSettings.acceptOnlinePayment ? req.body.paymentDetails : null;

        // 7. Determine payment requirements and process payment
        const { paymentStatus, transactions } = await handlePayment(
            service, 
            pricing, 
            paymentMethod, 
            paymentDetails,
            requiresApproval
        );
        
        // 8. Create the booking object
        const bookingData = {
            userId,
            serviceId,
            bookingDate: moment(bookingDate).toDate(),
            numberOfPeople,
            timeSlot: {
                startTime: moment(timeSlot.startTime).toDate(),
                endTime: moment(timeSlot.endTime).toDate()
            },
            status: initialStatus,
            pricing,
            payment: {
                status: paymentStatus,
                transactions: transactions
            }
        };

        // 9. Create the booking
        const booking = await Booking.create(bookingData);

        // 10. Update service availability
        if (service.availability.recurring) 
        {
            // Update bookingsMade for the specific day of week
            const bookingDayOfWeek = moment(bookingDate).format('dddd');
            await Service.findByIdAndUpdate(
                serviceId,
                {
                    $inc: {
                        'availability.daysOfWeek.$[day].bookingsMade': numberOfPeople
                    }
                },
                {
                    arrayFilters: [{ 'day.day': bookingDayOfWeek }]
                }
            );
        } 
        else 
        {
            // Update bookingsMade for the specific date
            await Service.findByIdAndUpdate(
                serviceId,
                {
                    $inc: {
                        'availability.dates.$[date].bookingsMade': numberOfPeople
                    }
                },
                {
                    arrayFilters: [{ 'date.date': bookingDate }]
                }
            );
        }

        // 11. Set booking timeout if configured
        if (service.bookingSettings.bookingTimeout > 0 && paymentStatus === 'pending')
        {
            // Set a timeout to cancel the booking if payment is not completed
            // This would typically be implemented with a job scheduler like Bull or Agenda
            // For simplicity, just logging it here
            console.log(`Booking ${booking._id} will be cancelled after ${service.bookingSettings.bookingTimeout} minutes if payment is not completed`);
            
            // In a real implementation, you would schedule a job:
            // scheduleJob(`cancelBooking_${booking._id}`, 
            //     new Date(Date.now() + service.bookingSettings.bookingTimeout * 60000),
            //     async () => { 
            //         const currentBooking = await Booking.findById(booking._id);
            //         if (currentBooking && currentBooking.payment.status === 'pending') {
            //             await Booking.findByIdAndUpdate(booking._id, { 
            //                 status: 'cancelled',
            //                 'cancellation.cancelled': true,
            //                 'cancellation.cancellationDate': new Date(),
            //                 'cancellation.reason': 'Payment timeout'
            //             });
            //         }
            //     }
            // );
        }

        return res.status(201).json({ success: true, data: booking }); 

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Helper function to handle payment based on service settings
const handlePayment = async (service, pricing, paymentMethod, paymentDetails, requiresApproval) => {
    const paymentSettings = service.paymentSettings;
    let paymentStatus = 'pending';
    let transactions = [];
    
    // Case 1: Online payment not accepted (cash on site)
    if (!paymentSettings.acceptOnlinePayment) return { paymentStatus, transactions };
    
    // Case 2: Online payment accepted but no payment details provided
    if (paymentSettings.acceptOnlinePayment && (!paymentMethod || !paymentDetails))
    {
        if (requiresApproval) 
        {
            // For approval required, payment can happen after approval
            return { paymentStatus, transactions };
        } 
        else 
        {
            // For instant booking, payment is required
            throw new Error("Payment details are required for instant booking with online payment");
        }
    }

    
    // Case 4: Handle different payment scenarios
    if (paymentSettings.acceptOnlinePayment && paymentMethod && paymentDetails) 
    {
        // Scenario A: Instant booking with full payment
        if (!requiresApproval && !paymentSettings.deposit.enabled) 
        {
            // Process full payment
            const paymentSuccess = await processPayment(
                paymentMethod, 
                paymentDetails, 
                pricing.totalAmount
            );
            
            if (paymentSuccess)
            {
                paymentStatus = 'fully_paid';
                transactions.push({
                    type: 'full_payment',
                    amount: pricing.totalAmount,
                    date: new Date(),
                    status: 'completed',
                    paymentMethod: paymentMethod,
                    transactionId: generateTransactionId()
                });
            } 
            else 
            {
                throw new Error("Full payment processing failed");
            }
        }
        
        // Scenario B: Deposit payment (with or without approval)
        else if (paymentSettings.deposit.enabled && pricing.depositAmount > 0) 
        {
            // Process deposit payment
            const depositPaymentSuccess = await processPayment(
                paymentMethod, 
                paymentDetails, 
                pricing.depositAmount
            );
            
            if (depositPaymentSuccess)
            {
                paymentStatus = 'deposit_paid';
                transactions.push({
                    type: 'deposit',
                    amount: pricing.depositAmount,
                    date: new Date(),
                    status: 'completed',
                    paymentMethod: paymentMethod,
                    transactionId: generateTransactionId()
                });
            } 
            else
            {
                throw new Error("Deposit payment processing failed");
            }
        }
    }
    
    return { paymentStatus, transactions };
};

// Helper function to calculate booking price
const calculateBookingPrice = (service, numberOfPeople, bookingDate, timeSlot) => {
    const { pricing, paymentSettings } = service;
    let basePrice = pricing.basePrice;
    
    // Check for special prices
    let specialPrice = null;
    if (pricing.specialPrices && pricing.specialPrices.length > 0) 
    {
        const bookingDay = moment(bookingDate).format('dddd');
        const specialPriceMatch = pricing.specialPrices.find(sp => {
            return (
                (!sp.conditions.daysOfWeek || sp.conditions.daysOfWeek.includes(bookingDay)) &&
                (!sp.conditions.specificDates || sp.conditions.specificDates.some(date => 
                    moment(date).isSame(bookingDate, 'day'))) &&
                (!sp.conditions.minPeople || numberOfPeople >= sp.conditions.minPeople)
            );
        });
        
        if (specialPriceMatch)
        {
            specialPrice = {
                applied: true,
                name: specialPriceMatch.name,
                price: specialPriceMatch.price
            };
            basePrice = specialPriceMatch.price;
        }
    }

    // Calculate total based on pricing model
    let totalBeforeTax = basePrice;
    switch (pricing.pricingModel) {
        case 'perPerson':
            totalBeforeTax *= numberOfPeople;
            break;
        case 'perHour':
            const durationInHours = moment(timeSlot.endTime).diff(moment(timeSlot.startTime), 'hours', true);
            totalBeforeTax = basePrice * Math.ceil(durationInHours); // Round up to nearest hour
            break;
        case 'perDay':
            const durationInDays = moment(timeSlot.endTime).diff(moment(timeSlot.startTime), 'days', true);
            totalBeforeTax = basePrice * Math.ceil(durationInDays); // Round up to nearest day
            break;
        case 'fixed':
            totalBeforeTax = basePrice; // Fixed price regardless of duration or people
            break;
    }

    // Calculate tax
    const taxAmount = (totalBeforeTax * paymentSettings.taxRate) / 100;
    
    // Calculate deposit if enabled
    const depositAmount = paymentSettings.deposit.enabled 
        ? (totalBeforeTax * paymentSettings.deposit.percentage) / 100 
        : 0;

    return {
        basePrice: totalBeforeTax,
        specialPrice: specialPrice || { applied: false },
        taxAmount,
        depositAmount,
        totalAmount: totalBeforeTax + taxAmount
    };
};

// Placeholder for payment processing function
// In a real application, this would integrate with a payment gateway
const processPayment = async (paymentMethod, paymentDetails, amount) => {
    // This is a placeholder function - in a real application,
    // you would integrate with a payment processor like Stripe, PayPal, etc.
    console.log(`Processing payment of ${amount} via ${paymentMethod}`);
    
    // For now, assume all payments succeed
    return true;
};

// Helper function to generate transaction IDs
const generateTransactionId = () => {
    // This is a simple implementation - in a real application,
    // you might use a more sophisticated method
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
};