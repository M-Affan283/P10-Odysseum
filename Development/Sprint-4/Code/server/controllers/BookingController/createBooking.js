/**
 * createBooking.js
 * Author: Affan
 */

import { User } from "../../models/User.js";
import { Service } from "../../models/Service.js";
import { Booking } from "../../models/Booking.js";
import { getServiceAvailabilityHelper } from "../../utils/reservationSysUtility.js";
import moment from "moment";

export const createBooking = async (req, res) => {
  let {
    userId,
    serviceId,
    numberOfPeople,
    timeSlot,
    bookingDate,
    hotelBooking,
  } = req.body;

  if (!userId) return res.status(400).json({ message: "User ID is required" });
  if (!serviceId)
    return res.status(400).json({ message: "Service ID is required" });
  if (!numberOfPeople)
    return res.status(400).json({ message: "Number of people is required" });
  if (!bookingDate)
    return res.status(400).json({ message: "Booking date is required" });

  const isHotelBooking = hotelBooking && hotelBooking.isHotel;

  if (isHotelBooking) {
    // Validate hotel booking specific fields
    if (!hotelBooking.numberOfNights)
      return res
        .status(400)
        .json({ message: "Number of nights is required for hotel bookings" });
    if (!hotelBooking.checkOutDate)
      return res
        .status(400)
        .json({ message: "Check-out date is required for hotel bookings" });
    if (!timeSlot || !timeSlot.startTime || !timeSlot.endTime)
      return res
        .status(400)
        .json({ message: "Check-in and check-out times are required" });
  } else {
    // Regular booking validation
    if (!timeSlot || !timeSlot.startTime || !timeSlot.endTime)
      return res.status(400).json({ message: "Time slot is required" });
  }

  console.log(timeSlot.startTime, timeSlot.endTime);

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Check if the service category is Hotel to validate the booking approach
    const serviceIsHotel = service.category === "Hotel";
    if (serviceIsHotel !== isHotelBooking) {
      return res.status(400).json({
        message: serviceIsHotel
          ? "This service requires hotel booking information"
          : "Hotel booking information provided for non-hotel service",
      });
    }

    // 3. Check service availability
    const availabilityCheck = await getServiceAvailabilityHelper(
      serviceId,
      bookingDate
    );

    if (!availabilityCheck.availability.isAvailable)
      return res
        .status(400)
        .json({ message: "Service is not available for the requested date" });
    if (availabilityCheck.error)
      return res
        .status(500)
        .json({ message: "Could not verify service availability" });

    // 4. Validate capacity
    if (availabilityCheck.remainingSpots < numberOfPeople) {
      return res.status(400).json({
        success: false,
        message: "Not enough capacity for the requested number of people",
      });
    }

    //validate time slots
    //get the yyyy=mm-dd part of the bboking date
    bookingDate = moment(bookingDate).format("YYYY-MM-DD");

    let startTime, endTime;
    if (isHotelBooking) {
      // For hotel bookings, use check-in date with startTime and checkout date with endTime
      let checkInDate = moment(bookingDate).format("YYYY-MM-DD");
      let checkOutDate = moment(hotelBooking.checkOutDate).format("YYYY-MM-DD");

      startTime = moment(`${checkInDate}T${timeSlot.startTime}`).utc();
      endTime = moment(`${checkOutDate}T${timeSlot.endTime}`).utc();
    } else {
      // For regular bookings, use same day for start and end
      startTime = moment(`${bookingDate}T${timeSlot.startTime}`).utc();
      endTime = moment(`${bookingDate}T${timeSlot.endTime}`).utc();
    }

    let currTime = moment().utc();

    if (
      startTime.isBefore(
        currTime.clone().add(service.bookingSettings.minAdvanceBooking, "hours")
      )
    )
      return res
        .status(400)
        .json({
          message: `Booking must be made at least ${service.bookingSettings.minAdvanceBooking} hours in advance`,
        });

    if (
      startTime.isAfter(
        currTime.clone().add(service.bookingSettings.maxAdvanceBooking, "days")
      )
    )
      return res
        .status(400)
        .json({
          message: `Booking must be made at most ${service.bookingSettings.maxAdvanceBooking} days in advance`,
        });

    if (endTime.isBefore(startTime))
      return res
        .status(400)
        .json({ message: "End time should be after start time" });

    // Calculate pricing based on service type and booking details
    const pricing = calculateBookingPrice(
      service,
      numberOfPeople,
      bookingDate,
      timeSlot,
      isHotelBooking,
      hotelBooking
    );

    // 6. Determine booking status based on approval requirements
    const requiresApproval = service.bookingSettings.requiresApproval;
    const initialStatus = requiresApproval ? "pending" : "confirmed";

    const paymentMethod = service.paymentSettings.acceptOnlinePayment
      ? req.body.paymentMethod
      : null;
    const paymentDetails = service.paymentSettings.acceptOnlinePayment
      ? req.body.paymentDetails
      : null;

    // 7. Determine payment requirements and process payment
    const { paymentStatus, transactions, remainingBalance } =
      await handlePayment(
        service,
        pricing,
        paymentMethod,
        paymentDetails,
        requiresApproval
      );

    if (paymentStatus === "failed") {
      return res
        .status(400)
        .json({ message: "Payment processing failed. Booking cancelled." });
    }

    // 8. Create the booking object
    let bookingData = {
      userId,
      serviceId,
      bookingDate: moment(bookingDate).toDate(),
      numberOfPeople,
      status: initialStatus,
      pricing,
      payment: {
        status: paymentStatus,
        transactions: transactions,
      },
    };

    // Handle time slots differently based on booking type
    if (isHotelBooking) {
      // For hotel bookings, include check-in/check-out dates and number of nights
    //   bookingData.hotelBooking = {
    //     isHotel: true,
    //     numberOfNights: parseInt(hotelBooking.numberOfNights),
    //     checkInDate: moment(`${bookingDate}T${timeSlot.startTime}`).toDate(),
    //     checkOutDate: moment(hotelBooking.checkOutDate).toDate(),
    //   };

      // console.log("End time: ", endTime)
      // return res.status(400).json({ message: "Temp end here" });

      bookingData.timeSlot = {
        startTime: startTime.toDate(),
        endTime: endTime.toDate(),
      };
    } else {
      // For regular bookings, just use the timeSlot
      bookingData.timeSlot = {
        startTime: moment(`${bookingDate}T${timeSlot.startTime}`).toDate(),
        endTime: moment(`${bookingDate}T${timeSlot.endTime}`).toDate(),
      };
    }

    console.log(JSON.stringify(bookingData, null, 2));
    // 9. Create the booking
    const booking = await Booking.create(bookingData);

    // 10. Update service availability
    if (service.availability.recurring) {
      // For hotel bookings, we need to update capacity for each day of the stay
      if (isHotelBooking) {
        const numberOfNights = parseInt(hotelBooking.numberOfNights);
        const checkInDate = moment(bookingDate);

        // Update each day of the stay
        for (let i = 0; i < numberOfNights; i++) {
          const currentDate = checkInDate.clone().add(i, "days");
          const dayOfWeek = currentDate.format("dddd");

          await Service.findByIdAndUpdate(
            serviceId,
            {
              $inc: {
                "availability.daysOfWeek.$[day].bookingsMade": numberOfPeople,
              },
            },
            {
              arrayFilters: [{ "day.day": dayOfWeek }],
            }
          );
        }
      } else {
        // Regular booking - update just the booking day
        const bookingDayOfWeek = moment(bookingDate).format("dddd");
        await Service.findByIdAndUpdate(
          serviceId,
          {
            $inc: {
              "availability.daysOfWeek.$[day].bookingsMade": numberOfPeople,
            },
          },
          {
            arrayFilters: [{ "day.day": bookingDayOfWeek }],
          }
        );
      }
    } else {
      // For specific dates availability
      if (isHotelBooking) {
        const numberOfNights = parseInt(hotelBooking.numberOfNights);
        const checkInDate = moment(bookingDate);

        // Update each day of the stay
        for (let i = 0; i < numberOfNights; i++) {
          const currentDate = checkInDate
            .clone()
            .add(i, "days")
            .format("YYYY-MM-DD");

          await Service.findByIdAndUpdate(
            serviceId,
            {
              $inc: {
                "availability.dates.$[date].bookingsMade": numberOfPeople,
              },
            },
            {
              arrayFilters: [{ "date.date": currentDate }],
            }
          );
        }
      } else {
        // Regular booking - update just the booking day
        await Service.findByIdAndUpdate(
          serviceId,
          {
            $inc: {
              "availability.dates.$[date].bookingsMade": numberOfPeople,
            },
          },
          {
            arrayFilters: [{ "date.date": bookingDate }],
          }
        );
      }
    }

    // 11. Set booking timeout if configured
    if (
      service.bookingSettings.bookingTimeout > 0 &&
      paymentStatus === "pending"
    ) {
      // Set a timeout to cancel the booking if payment is not completed
      // This would typically be implemented with a job scheduler like Bull or Agenda
      // For simplicity, just logging it here
      console.log(
        `Booking ${booking._id} will be cancelled after ${service.bookingSettings.bookingTimeout} minutes if payment is not completed`
      );

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
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Helper function to handle payment based on service settings
const handlePayment = async (
  service,
  pricing,
  paymentMethod,
  paymentDetails,
  requiresApproval
) => {
  const paymentSettings = service.paymentSettings;
  let paymentStatus = "pending";
  let transactions = [];
  let remainingBalance = pricing.totalAmount;

  // Case 1: Cash on site (online payment not accepted)
  if (!paymentSettings.acceptOnlinePayment)
    return { paymentStatus, transactions, remainingBalance };

  // Validate payment details for online payments
  if (!paymentMethod || !paymentDetails)
    throw new Error(
      "Payment method and details are required for online payment"
    );

  try {
    // Case 2: Booking requires approval (no immediate payment unless deposit)
    if (requiresApproval) {
      // Case 2a: Deposit is enabled with approval (shouldnt go here ideally)
      if (paymentSettings.deposit.enabled && pricing.depositAmount > 0) {
        const depositSuccess = await processPayment(
          paymentMethod,
          paymentDetails,
          pricing.depositAmount
        );

        if (depositSuccess) {
          paymentStatus = "deposit_paid";
          transactions.push({
            type: "deposit",
            amount: pricing.depositAmount,
            date: new Date(),
            status: "completed",
            paymentMethod: paymentMethod,
            transactionId: generateTransactionId(),
          });
          remainingBalance = pricing.totalAmount - pricing.depositAmount;
        } else {
          paymentStatus = "failed";
          transactions.push({
            type: "deposit",
            amount: pricing.depositAmount,
            date: new Date(),
            status: "failed",
            paymentMethod: paymentMethod,
          });
        }
      }
      // Case 2b: No deposit, payment after approval
      // Default behavior: return pending status
    }
    // Case 3: Instant booking (no approval required)
    else {
      // Case 3a: Deposit payment for instant booking
      if (paymentSettings.deposit.enabled && pricing.depositAmount > 0) {
        const depositSuccess = await processPayment(
          paymentMethod,
          paymentDetails,
          pricing.depositAmount
        );

        if (depositSuccess) {
          paymentStatus = "deposit_paid";
          transactions.push({
            type: "deposit",
            amount: pricing.depositAmount,
            date: new Date(),
            status: "completed",
            paymentMethod: paymentMethod,
            transactionId: generateTransactionId(),
          });
          remainingBalance = pricing.totalAmount - pricing.depositAmount;
        } else {
          throw new Error("Deposit payment processing failed");
        }
      }
      // Case 3b: Full payment for instant booking (no deposit)
      else {
        const paymentSuccess = await processPayment(
          paymentMethod,
          paymentDetails,
          pricing.totalAmount
        );

        if (paymentSuccess) {
          paymentStatus = "fully_paid";
          transactions.push({
            type: "full_payment",
            amount: pricing.totalAmount,
            date: new Date(),
            status: "completed",
            paymentMethod: paymentMethod,
            transactionId: generateTransactionId(),
          });
          remainingBalance = 0;
        } else {
          throw new Error("Full payment processing failed");
        }
      }
    }
  } catch (error) {
    // Log the error but don't throw it
    console.error("Payment processing error:", error);
    paymentStatus = "failed";
    transactions.push({
      type: "error",
      date: new Date(),
      status: "failed",
      error: error.message,
      paymentMethod: paymentMethod,
    });
  }

  return { paymentStatus, transactions, remainingBalance };
};

// Helper function to calculate booking price
const calculateBookingPrice = (
  service,
  numberOfPeople,
  bookingDate,
  timeSlot,
  isHotelBooking,
  hotelBooking
) => {
  const { pricing, paymentSettings } = service;
  let basePrice = pricing.basePrice;

  // Check for special prices
  let specialPrice = null;
  if (pricing.specialPrices && pricing.specialPrices.length > 0) {
    const bookingDay = moment(bookingDate).format("dddd");
    const specialPriceMatch = pricing.specialPrices.find((sp) => {
      return (
        !sp.conditions.daysOfWeek ||
        sp.conditions.daysOfWeek.includes(bookingDay) ||
        !sp.conditions.specificDates ||
        sp.conditions.specificDates.some((date) =>
          moment(date).isSame(bookingDate, "day")
        ) ||
        !sp.conditions.minPeople ||
        numberOfPeople >= sp.conditions.minPeople
      );
    });

    if (specialPriceMatch) {
      specialPrice = {
        applied: true,
        name: specialPriceMatch.name,
        price: specialPriceMatch.price,
      };
      basePrice = specialPriceMatch.price;
    }
  }

  // Calculate total based on pricing model
  let totalBeforeTax = basePrice;
  switch (pricing.pricingModel) {
    case "perPerson":
      totalBeforeTax *= numberOfPeople;
      break;
    case "perHour":
      if (isHotelBooking) {
        // For hotels with per hour pricing, calculate based on nights
        const numberOfNights = parseInt(hotelBooking.numberOfNights);
        // Assuming 24 hours per night for simplicity
        totalBeforeTax = basePrice * (numberOfNights * 24);
      } else {
        const durationInHours = moment(timeSlot.endTime).diff(
          moment(timeSlot.startTime),
          "hours",
          true
        );
        totalBeforeTax = basePrice * Math.ceil(durationInHours); // Round up to nearest hour
      }
      break;
    case "perDay":
      if (isHotelBooking) {
        // For hotels, days is same as nights
        const numberOfNights = parseInt(hotelBooking.numberOfNights);
        totalBeforeTax = basePrice * numberOfNights;
      } else {
        const durationInDays = moment(timeSlot.endTime).diff(
          moment(timeSlot.startTime),
          "days",
          true
        );
        totalBeforeTax = basePrice * Math.ceil(durationInDays); // Round up to nearest day
      }
      break;
    case "fixed":
      if (isHotelBooking) {
        // For fixed price hotels, still multiply by nights
        const numberOfNights = parseInt(hotelBooking.numberOfNights);
        totalBeforeTax = basePrice * numberOfNights;
      } else {
        totalBeforeTax = basePrice; // Fixed price regardless of duration or people
      }
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
    totalAmount: totalBeforeTax + taxAmount,
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
  // you might use a more sophisticated method. like stripe.transaction.create() etc
  return (
    "txn_" + Date.now() + "_" + Math.random().toString(36).substring(2, 15)
  );
};
