/**
 * UpdateBooking.js
 * Author: Affan
 */

import { User } from "../../models/User.js";
import { Booking } from "../../models/Booking.js";
import { Service } from "../../models/Service.js";
import { Business } from "../../models/Business.js";
import moment from "moment";

const updateBookingStatus = async (req, res) => 
{
    const { bookingId, status } = req.body;
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];

    if (!bookingId || !status || !statuses.includes(status)) return res.status(400).json({ message: "Invalid data" });

    try
    {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'no-show') return res.status(400).json({ message: "Booking status cannot be updated" });

        if (status === 'cancelled' || status === 'no-show')
        {
            booking.status = status;
            await booking.save();
            return res.status(200).json({ message: "Booking status updated" });
        }

        if (status === 'confirmed')
        {
            const service = await Service.findById(booking.serviceId);
            if (!service) return res.status(404).json({ message: "Service not found" });

            if (service.capacity < booking.numberOfPeople) return res.status(400).json({ message: "Service capacity exceeded" });

            booking.status = status;
            await booking.save();
            return res.status(200).json({ message: "Booking status updated" });
        }

        return res.status(400).json({ message: "Invalid status" });

    }
    catch (error)
    {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const cancelBooking = async (req, res) => {
    const { bookingId, userId, reason } = req.body;
    
    if (!bookingId || !userId) 
        return res.status(400).json({ message: "Booking ID and User ID are required" });
    
    try 
    {
        // Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) 
            return res.status(404).json({ message: "Booking not found" });
            
        // Verify user owns the booking
        if (booking.userId.toString() !== userId) 
            return res.status(403).json({ message: "Unauthorized" });
            
        // Check if booking can be cancelled
        if (booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'no-show')
            return res.status(400).json({ message: "Booking cannot be cancelled" });
            
        // Get service to check cancellation policy
        const service = await Service.findById(booking.serviceId);
        if (!service) 
            return res.status(404).json({ message: "Service not found" });
            
        // Check if cancellation is allowed by policy
        if (!service.cancellationPolicy.allowCancellation)
            return res.status(400).json({ message: "Cancellation not allowed for this service" });
            
        // Calculate refund amount based on policy
        let refundAmount = 0;
        let cancellationFee = 0;
        
        const currentTime = moment().utc();
        const bookingTime = moment(booking.timeSlot.startTime).utc();
        const hoursUntilBooking = bookingTime.diff(currentTime, 'hours');
        
        // Only calculate refund if payment was made
        if (booking.payment.status === 'deposit_paid' || booking.payment.status === 'fully_paid') {
            if (hoursUntilBooking >= service.cancellationPolicy.freeCancellationHours) {
                // Full refund
                refundAmount = booking.pricing.totalAmount;
            } else {
                // Partial refund with cancellation fee
                cancellationFee = service.cancellationPolicy.cancellationFee || 
                                 (booking.pricing.totalAmount * 0.2); // Default 20% if not set
                refundAmount = booking.pricing.totalAmount - cancellationFee;
            }
        }
        
        // Update the booking
        booking.status = 'cancelled';
        booking.cancellation = {
            cancelled: true,
            cancellationDate: new Date(),
            reason: reason || 'Customer cancelled',
            refundAmount: refundAmount,
            cancellationFee: cancellationFee
        };
        
        await booking.save();
        
        // Update service availability by reducing bookingsMade
        if (service.availability.recurring) {
            const bookingDayOfWeek = moment(booking.bookingDate).format('dddd');
            await Service.findByIdAndUpdate(
                booking.serviceId,
                {
                    $inc: {
                        'availability.daysOfWeek.$[day].bookingsMade': -booking.numberOfPeople
                    }
                },
                {
                    arrayFilters: [{ 'day.day': bookingDayOfWeek }]
                }
            );
        } else {
            await Service.findByIdAndUpdate(
                booking.serviceId,
                {
                    $inc: {
                        'availability.dates.$[date].bookingsMade': -booking.numberOfPeople
                    }
                },
                {
                    arrayFilters: [{ 'date.date': booking.bookingDate }]
                }
            );
        }
        
        return res.status(200).json({ 
            message: "Booking cancelled successfully", 
            refundAmount: refundAmount,
            cancellationFee: cancellationFee
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const rejectBooking = async (req, res) => 
{
    const { bookingId, userId, serviceId } = req.body;
    if (!bookingId || !userId) return res.status(400).json({ message: "Invalid data" });

    try {
        const owner = await User.findById(userId);
        if (!owner) return res.status(404).json({ message: "User not found" });

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const service = await Service.findById(serviceId || booking.serviceId);
        if (!service) return res.status(404).json({ message: "Service not found" });

        const business = await Business.findById(service.businessId);
        if (!business) return res.status(404).json({ message: "Business not found" });

        // Validate authorization
        if (business.ownerId.toString() !== userId) 
            return res.status(403).json({ message: "Unauthorized" });
        
        // Check if booking is already confirmed
        if (booking.status === 'confirmed') 
            return res.status(400).json({ message: "Booking already confirmed. Cannot cancel." });

        // delete booking
        await booking.deleteOne();

        return res.status(200).json({ message: "Booking rejected", booking });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


/**
 * Enhanced approveBooking function that follows a deferred payment approach
 * Only approves the booking and calculates payment requirements
 * Actual payment processing is done separately when user provides payment details
 */
const approveBooking = async (req, res) => {
    const { bookingId, serviceId, userId } = req.body;
    if (!bookingId || !userId) return res.status(400).json({ message: "Invalid data" });

    try {
        // Validate user, booking, service and business
        const owner = await User.findById(userId);
        if (!owner) return res.status(404).json({ message: "User not found" });

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const service = await Service.findById(serviceId || booking.serviceId);
        if (!service) return res.status(404).json({ message: "Service not found" });

        const business = await Business.findById(service.businessId);
        if (!business) return res.status(404).json({ message: "Business not found" });

        // Validate authorization
        if (business.ownerId.toString() !== userId) 
        {
            console.log("Unauthorized access attempt by user:", userId, "business owener is:", business.ownerId.toString());
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        // Check if booking is already confirmed
        if (booking.status === 'confirmed') 
            return res.status(400).json({ message: "Booking already confirmed" });

        // Check if booking was cancelled or completed
        if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'no-show') 
            return res.status(400).json({ message: "Cannot approve a booking with status: " + booking.status });

        // Check service capacity
        if (service.capacity < booking.numberOfPeople) 
            return res.status(400).json({ message: "Service capacity exceeded" });

        // Update booking status
        booking.status = 'confirmed';
        await booking.save();

        // Calculate payment information for client notification
        const paymentInfo = calculatePaymentInfo(booking, service);
        

        // Placeholder for notification system
        /* 
        Notification system implementation:
        
        await notificationService.sendBookingApprovalNotification({
            userId: booking.userId,
            bookingId: booking._id,
            serviceTitle: service.title,
            businessName: business.name,
            startTime: booking.timeSlot.startTime,
            endTime: booking.timeSlot.endTime,
            paymentStatus: booking.payment.status,
            paymentRequired: paymentInfo.paymentRequired,
            remainingBalance: paymentInfo.remainingBalance,
            paymentInstructions: paymentInfo.paymentInstructions
        });
        */
        
        return res.status(200).json({ 
            message: "Booking confirmed", 
            booking: { 
                id: booking._id, 
                status: booking.status,
                paymentStatus: booking.payment.status
            },
            paymentInfo
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Helper function for processing payments
 * This is used by the updatePayment endpoint
 */
const processBookingPayment = async (booking, paymentMethod, paymentDetails, amount = null) => {
    try {
        // Find the service
        const service = await Service.findById(booking.serviceId);
        if (!service)
            throw new Error("Service not found");
            
        // Check if booking is in a valid state for payment update
        if (booking.status === 'cancelled' || booking.status === 'no-show')
            throw new Error("Cannot update payment for cancelled booking");
            
        if (booking.payment.status === 'fully_paid')
            throw new Error("Booking is already fully paid");
            
        // Calculate the already paid amount
        const paidAmount = booking.payment.transactions.reduce((total, transaction) => {
            return total + (transaction.status === 'completed' ? transaction.amount : 0);
        }, 0);
        
        // Calculate remaining balance
        const remainingBalance = booking.pricing.totalAmount - paidAmount;
        
        // Determine payment amount based on context
        let amountToCharge = 0;
        
        // Case: amount specified in request
        if (amount) {
            amountToCharge = amount;
            
            // Validate the payment amount doesn't exceed remaining balance
            if (amountToCharge > remainingBalance)
                throw new Error(`Payment amount exceeds remaining balance of ${remainingBalance}`);
        }
        // Default case: charge remaining balance
        else {
            amountToCharge = remainingBalance;
        }
        
        if (amountToCharge <= 0)
            throw new Error("Invalid payment amount");
            
        // Process the payment
        console.log(`Processing payment of ${amountToCharge} via ${paymentMethod}`);
        const paymentSuccess = await processPayment(paymentMethod, paymentDetails, amountToCharge);
        
        if (!paymentSuccess)
            throw new Error("Payment processing failed");
            
        // Determine transaction type
        const paymentType = paidAmount > 0 ? 'balance_payment' : 
                          (amountToCharge == booking.pricing.totalAmount ? 'full_payment' : 'partial_payment');
        
        // Add the transaction
        const newTransaction = {
            type: paymentType,
            amount: amountToCharge,
            date: new Date(),
            status: 'completed',
            paymentMethod: paymentMethod,
            transactionId: generateTransactionId()
        };
        
        booking.payment.transactions.push(newTransaction);
        
        // Update payment status
        const newTotalPaid = paidAmount + amountToCharge;
        
        if (newTotalPaid >= booking.pricing.totalAmount) {
            booking.payment.status = 'fully_paid';
        } else if (booking.payment.status === 'pending') {
            booking.payment.status = 'deposit_paid'; // Use this even for partial non-deposit payments
        }
        
        await booking.save();
        
        // Calculate remaining balance after this payment
        const newRemainingBalance = booking.pricing.totalAmount - newTotalPaid;
        
        return {
            success: true,
            amountPaid: amountToCharge,
            remainingBalance: newRemainingBalance,
            paymentStatus: booking.payment.status
        };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            error: error.message
        };
    }
};

const generateTransactionId = () => {
    // This is a simple implementation - in a real application,
    // you might use a more sophisticated method. like stripe.transaction.create() etc
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
};

/**
 * API endpoint for updating payment
 * To be called from the frontend after user enters payment details
 */
const updatePayment = async (req, res) => {
    const { bookingId, paymentMethod, paymentDetails, amount } = req.body;
    
    if (!bookingId || !paymentMethod || !paymentDetails)
        return res.status(400).json({ message: "Missing required payment information" });
        
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
            
        const result = await processBookingPayment(booking, paymentMethod, paymentDetails, amount);
        
        if (!result.success)
            return res.status(400).json({ message: result.error });
            
        return res.status(200).json({ 
            message: "Payment updated successfully", 
            amountPaid: result.amountPaid,
            remainingBalance: result.remainingBalance,
            paymentStatus: result.paymentStatus
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const processRefund = async (req, res) => {
    const { bookingId, adminId } = req.body;
    
    if (!bookingId || !adminId)
        return res.status(400).json({ message: "Booking ID and Admin ID are required" });
        
    try {
        // Verify admin permissions (business owner or admin)
        const admin = await User.findById(adminId);
        if (!admin)
            return res.status(404).json({ message: "Admin not found" });
            
        // Find the booking with populated user information
        const booking = await Booking.findById(bookingId).populate('userId');
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
            
        // Get service information
        const service = await Service.findById(booking.serviceId);
        if (!service)
            return res.status(404).json({ message: "Service not found" });
            
        // Verify admin is business owner
        const business = await Business.findById(service.businessId);
        if (!business || business.ownerId.toString() !== adminId)
            return res.status(403).json({ message: "Unauthorized - only business owner can process refunds" });
            
        // Check if booking is cancelled
        if (booking.status !== 'cancelled')
            return res.status(400).json({ message: "Only cancelled bookings can be refunded" });
            
        // Check if there's anything to refund
        if (booking.payment.status === 'pending' || booking.payment.status === 'refunded')
            return res.status(400).json({ message: "No payment to refund" });
            
        // Get the original payment transactions to reference for refund
        const successfulPayments = booking.payment.transactions.filter(
            transaction => transaction.status === 'completed' && 
                          ['deposit', 'full_payment', 'partial_payment', 'balance_payment'].includes(transaction.type)
        );
        
        if (successfulPayments.length === 0)
            return res.status(400).json({ message: "No successful payments found to refund" });
            
        // Determine refund amount based on cancellation policy
        const refundAmount = booking.cancellation.refundAmount;
        
        if (!refundAmount || refundAmount <= 0)
            return res.status(400).json({ message: "No refund amount specified in cancellation" });
            
        // Find the most recent transaction for refunding
        const latestTransaction = successfulPayments.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        )[0];
        
        // In a real system, you would retrieve the payment details by reference
        // Most payment processors use a transaction ID or payment method token for refunds
        const transactionId = latestTransaction.transactionId;
        const paymentMethod = latestTransaction.paymentMethod;
        
        if (!transactionId)
            return res.status(400).json({ message: "Cannot process refund - missing transaction reference" });
            
        // Process the refund with the payment processor
        // In a real app, this would call your payment provider's API
        const refundResult = await processExternalRefund(
            transactionId,
            paymentMethod,
            refundAmount,
            booking.userId // The user object with payment details
        );
        
        if (!refundResult.success)
            return res.status(400).json({ message: `Refund processing failed: ${refundResult.error}` });
            
        // Add the refund transaction
        booking.payment.transactions.push({
            type: 'refund',
            amount: -refundAmount, // Negative amount for refund
            date: new Date(),
            status: 'completed',
            paymentMethod: paymentMethod,
            transactionId: refundResult.refundId || generateTransactionId()
        });
        
        // Update payment status
        booking.payment.status = 'refunded';
        booking.cancellation.refundProcessed = true;
        booking.cancellation.refundDate = new Date();
        booking.cancellation.refundedBy = adminId;
        
        await booking.save();
        
        // In a real application, you would also send a notification to the user
        
        return res.status(200).json({ 
            message: "Refund processed successfully", 
            refundAmount: refundAmount,
            refundId: refundResult.refundId
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
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

// Placeholder for external refund processing function
// In a real application, this would integrate with a payment gateway
const processExternalRefund = async (transactionId, paymentMethod, amount, user) => {
    // This is a placeholder function - in a real application,
    // you would integrate with a payment processor like Stripe, PayPal, etc.
    console.log(`Processing refund of ${amount} for transaction ${transactionId} via ${paymentMethod}`);
    
    // For a real implementation with Stripe, it might look like:
    // const refund = await stripe.refunds.create({
    //     payment_intent: transactionId,
    //     amount: amount * 100 // Convert to cents
    // });
    
    // For now, simulate success
    return {
        success: true,
        refundId: 'refund_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10)
    };
};


/**
 * Helper function to calculate payment information for a booking
 * Used to determine what payment details to show to the user
 */
const calculatePaymentInfo = (booking, service) => {
    // Initialize payment info
    const paymentInfo = {
        paymentRequired: false,
        acceptOnlinePayment: service.paymentSettings.acceptOnlinePayment,
        remainingBalance: 0,
        paymentInstructions: ""
    };
    
    // If online payment is not accepted, set default instructions
    if (!service.paymentSettings.acceptOnlinePayment) {
        paymentInfo.paymentInstructions = "Please pay at the venue";
        return paymentInfo;
    }
    
    // Calculate the already paid amount
    const paidAmount = booking.payment.transactions.reduce((total, transaction) => {
        return total + (transaction.status === 'completed' ? transaction.amount : 0);
    }, 0);
    
    // Calculate remaining balance
    const remainingBalance = booking.pricing.totalAmount - paidAmount;
    paymentInfo.remainingBalance = remainingBalance;
    
    // Determine if payment is required
    if (remainingBalance > 0) {
        paymentInfo.paymentRequired = true;
        
        // Set payment instructions based on business payment settings
        if (service.bookingSettings.requiresApproval) {
            if (booking.payment.status === 'pending') {
                paymentInfo.paymentInstructions = "Your booking has been approved. Please complete full payment to confirm your reservation.";
            } else if (booking.payment.status === 'deposit_paid') {
                paymentInfo.paymentInstructions = "Your booking has been approved. Please pay the remaining balance.";
            }
        }
    } else {
        paymentInfo.paymentInstructions = "Your booking is fully paid and confirmed.";
    }
    
    return paymentInfo;
};



export {
    updateBookingStatus,
    cancelBooking,
    approveBooking,
    rejectBooking,
    updatePayment,
    processRefund,
    // Expose the helper functions if needed by other modules
    processBookingPayment,
    calculatePaymentInfo
};