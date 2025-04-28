import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from "react-native-heroicons/solid";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import LottieView from "lottie-react-native";
import useUserStore from "../context/userStore";
import Toast from "react-native-toast-message";

const getQueryBooking = async ({ bookingId }) => {
  try {
    const res = await axiosInstance.get(
      `/booking/getById?bookingId=${bookingId}`
    );
    // console.log(res.data)
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const tempBooking = {
  serviceId: {
    name: "Premium Spa Treatment",
    description: "Full body relaxation massage",
  },
  bookingDate: new Date(),
  status: "confirmed",
  numberOfPeople: 2,
  timeSlot: {
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
  },
  pricing: {
    basePrice: 150,
    specialPrice: {
      applied: true,
      name: "Weekend Special",
      price: 120,
    },
    taxAmount: 15,
    totalAmount: 135,
  },
  payment: {
    status: "deposit_paid",
  },
  cancellationPolicy: {
    allowCancellation: true,
    freeCancellationHours: 24,
  },
};

const UserBookingProfileScreen = ({ bookingId }) => {
  const [cancelReasonModalVisible, setCancelReasonModalVisible] =
    React.useState(false);
  const [transactionModalVisible, setTransactionModalVisible] =
    React.useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const [paymentLoading, setPaymentLoading] = React.useState(false);

  // Payment form states
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCVC, setCardCVC] = React.useState("");
  const [cardName, setCardName] = React.useState("");

  const user = useUserStore((state) => state.user);

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getQueryBooking({ bookingId }),
    enabled: true,
  });

  const booking = data?.booking || tempBooking; // Use tempBooking for testing
  // const booking = tempBooking

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500";
      case "pending":
        return "bg-amber-500";
      case "cancelled":
        return "bg-rose-500";
      default:
        return "bg-slate-500";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-900/30";
      case "pending":
        return "bg-amber-900/30";
      case "cancelled":
        return "bg-rose-900/30";
      default:
        return "bg-slate-900/30";
    }
  };

  const handleCancelBooking = () => {
    if (!cancelReason.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please provide a reason for cancellation.",
      });
      return;
    }

    setCancelLoading(true);

    axiosInstance
      .post("/booking/cancel", {
        bookingId: bookingId,
        userId: user._id,
        reason: cancelReason,
      })
      .then((res) => {
        // console.log(res.data)

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Booking cancelled successfully.",
          position: "top",
          visibilityTime: 2000,
        });
        setCancelReasonModalVisible(false);
        setCancelReason("");
        setCancelLoading(false);
        refetch();
      })
      .catch((err) => {
        console.log(err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: err.response?.data?.message || "Something went wrong.",
          position: "top",
          visibilityTime: 2000,
        });

        setCancelReasonModalVisible(false);
        setCancelLoading(false);
      });
  };

  // Calculate remaining balance to pay
  const calculateRemainingBalance = () => {
    if (!booking?.payment) return 0;

    const totalAmount = booking.pricing.totalAmount;
    let paidAmount = 0;

    if (
      booking.payment.transactions &&
      booking.payment.transactions.length > 0
    ) {
      paidAmount = booking.payment.transactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);
    }

    return totalAmount - paidAmount;
  };

  // Format card number with spaces
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const formatted =
      cleaned.length > 0 ? cleaned.match(/.{1,4}/g).join(" ") : "";
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };

  // Format expiry date (MM/YY)
  const formatExpiry = (text) => {
    const cleaned = text.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  // Handle payment submission
  const handleSubmitPayment = () => {
    // Validate inputs
    if (cardNumber.replace(/\s+/g, "").length < 16) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid card number.",
      });
      return;
    }

    if (cardExpiry.length < 5) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid expiry date (MM/YY).",
      });
      return;
    }

    if (cardCVC.length < 3) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid CVC.",
      });
      return;
    }

    if (!cardName.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter the cardholder name.",
      });
      return;
    }

    setPaymentLoading(true);

    // Call payment API
    axiosInstance
      .post("/booking/updatePayment", {
        bookingId: bookingId,
        userId: user._id,
        paymentMethod: "credit_card",
        amount: calculateRemainingBalance(),
        paymentDetails: {
          cardNumber: cardNumber.replace(/\s+/g, ""),
          cardExpiry: cardExpiry,
          cardCVC: cardCVC,
          cardName: cardName,
        },
        // // In a real app, you'd use a secure payment processor and not send card details directly
        // // These would typically be tokenized by a payment provider like Stripe
        // cardDetails: {
        //   // Send tokenized data instead in production
        //   last4: cardNumber.slice(-4),
        // },
      })
      .then((res) => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Payment completed successfully!",
        });
        setPaymentModalVisible(false);
        setPaymentLoading(false);

        // Reset form
        setCardNumber("");
        setCardExpiry("");
        setCardCVC("");
        setCardName("");

        refetch();
      })
      .catch((err) => {
        console.log(err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            err.response?.data?.message || "Payment failed. Please try again.",
        });
        setPaymentLoading(false);
      });
  };

  if (isFetching) {
    return (
      <View className="bg-[#070f1b] flex-1 justify-center items-center">
        <LottieView
          source={require("../../assets/animations/Loading1.json")}
          style={{
            width: 150,
            height: 150,
          }}
          autoPlay
          loop
        />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-[#070f1b] flex-1 justify-center items-center">
        <Text className="text-white font-dsbold text-lg mb-4">Error</Text>
        <Text className="text-gray-400 mb-4">
          Unable to fetch booking details.
        </Text>
        <Text className="text-gray-400 mb-4">{error.message}</Text>

        <TouchableOpacity
          className="bg-gray-700 rounded-xl p-4"
          onPress={() => {
            refetch();
          }}
        >
          <Text className="text-white font-dsbold">Retry</Text>
        </TouchableOpacity>

        <LottieView
          source={require("../../assets/animations/FetchError.json")}
          style={{
            width: 150,
            height: 150,
          }}
          autoPlay
          loop
        />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      <View className="flex-row items-center mt-4 px-5 gap-x-6">
        <TouchableOpacity
          className="bg-gray-800/50 p-2 rounded-full"
          onPress={() => router.back()}
        >
          <ChevronLeftIcon size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text className="font-dsregular text-gray-400 text-base">
            Booking
          </Text>
          <Text className="font-dsbold text-white text-2xl mt-1">
            {booking?.serviceId.name}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 mt-5" showsVerticalScrollIndicator={false}>
        <View className="py-2 px-5">
          {/* Status Card */}
          <View
            className={`${getStatusBgColor(
              booking.status
            )} rounded-2xl p-4 mb-6 border border-gray-700`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-x-3">
                <View
                  className={`${getStatusColor(
                    booking.status
                  )} p-2 rounded-full`}
                >
                  {booking.status === "confirmed" ? (
                    <CheckCircleIcon color="white" size={20} />
                  ) : booking.status === "pending" ? (
                    <ClockIcon color="white" size={20} />
                  ) : (
                    <XCircleIcon color="white" size={20} />
                  )}
                </View>
                <View>
                  <Text className="text-white font-dsbold text-lg capitalize">
                    {booking.status}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {booking.status === "confirmed"
                      ? "Your booking is confirmed"
                      : booking.status === "pending"
                      ? "Awaiting confirmation"
                      : "This booking has been cancelled"}
                  </Text>
                </View>
              </View>
              <View className="bg-gray-800/70 px-3 py-1 rounded-lg">
                <Text className="text-white font-medium">
                  # {bookingId?.slice(-6) || "123456"}
                </Text>
              </View>
            </View>
          </View>

          {/* Booking Details */}
          <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
            <Text className="text-white font-dsbold text-lg mb-4">
              Booking Details
            </Text>
            <BookingDetailRow
              icon={<CalendarIcon color="#9ca3af" size={20} />}
              label="Booking Date"
              value={new Date(booking?.bookingDate).toLocaleDateString()}
            />
            <BookingDetailRow
              icon={<ClockIcon color="#9ca3af" size={20} />}
              label="Time Slot"
              value={
                <View>
                  {/* Show start date and time */}
                  <View className="items-end mb-1">
                    <Text className="text-white font-medium">
                      {new Date(
                        booking?.timeSlot?.startTime || new Date()
                      ).toLocaleDateString()}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {new Date(
                        booking?.timeSlot?.startTime || new Date()
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>

                  {/* Divider */}
                  <Text className="text-gray-500 text-center">to</Text>

                  {/* Show end date and time */}
                  <View className="items-end mt-1">
                    <Text className="text-white font-medium">
                      {new Date(
                        booking?.timeSlot?.endTime || new Date()
                      ).toLocaleDateString()}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {new Date(
                        booking?.timeSlot?.endTime || new Date()
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              }
            />
            <BookingDetailRow
              icon={<UserGroupIcon color="#9ca3af" size={20} />}
              label="Number of People"
              value={booking.numberOfPeople}
              isLast
            />
          </View>

          {/* Pricing Details */}
          <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
            <Text className="text-white font-dsbold text-lg mb-4">
              Payment Details
            </Text>
            <BookingDetailRow
              label="Base Price"
              value={`$${booking.pricing.basePrice}`}
            />
            {booking.pricing.specialPrice.applied && (
              <BookingDetailRow
                label={booking.pricing.specialPrice.name}
                value={`-$${
                  booking.pricing.basePrice - booking.pricing.specialPrice.price
                }`}
                valueColor="text-emerald-400"
              />
            )}
            <BookingDetailRow
              label="Tax"
              value={`$${booking.pricing.taxAmount}`}
            />
            <View className="border-t border-gray-700 mt-4 pt-4">
              <BookingDetailRow
                label="Total Amount"
                value={`$${booking.pricing.totalAmount}`}
                bold
                isLast
              />
            </View>
          </View>

          {/* Payment Status */}
          <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
            <Text className="text-white font-dsbold text-lg mb-4">
              Payment Status
            </Text>
            <View className="flex-row items-center justify-between bg-gray-700/50 p-3 rounded-xl">
              <View className="flex-row items-center">
                <View
                  className={
                    booking.payment.status === "fully_paid"
                      ? "bg-emerald-500/20 p-2 rounded-full mr-3"
                      : booking.payment.status === "deposit_paid"
                      ? "bg-amber-500/20 p-2 rounded-full mr-3"
                      : "bg-rose-500/20 p-2 rounded-full mr-3"
                  }
                >
                  {booking.payment.status === "fully_paid" ? (
                    <CheckCircleIcon color="#10b981" size={20} />
                  ) : booking.payment.status === "deposit_paid" ? (
                    <ExclamationCircleIcon color="#f59e0b" size={20} />
                  ) : (
                    <XCircleIcon color="#f43f5e" size={20} />
                  )}
                </View>
                <Text className="text-white font-medium capitalize">
                  {booking.payment.status.replace("_", " ")}
                </Text>
              </View>
              <TouchableOpacity
                className="bg-indigo-500 px-4 py-2 rounded-lg"
                onPress={() => setTransactionModalVisible(true)}
              >
                <Text className="text-white font-medium">Details</Text>
              </TouchableOpacity>
            </View>

            {/* Add Complete Payment button if status is confirmed and payment is either deposit_paid or not fully paid. and cannot be pending, cancelled, refunded, failed */}
            {booking.status === "confirmed" &&
              (booking.payment.status === "deposit_paid" ||
                booking.payment.status === "pending") && (
                <TouchableOpacity
                  className="bg-indigo-500 rounded-xl p-4 flex-row items-center justify-center mt-4"
                  onPress={() => setPaymentModalVisible(true)}
                >
                  <CreditCardIcon color="white" size={20} className="mr-2" />
                  <Text className="text-white font-dsbold ml-2">
                    Complete Payment
                  </Text>
                </TouchableOpacity>
              )}
          </View>

          {/* Cancellation Information */}
          {booking.status === "cancelled" && (
            <View className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
              <Text className="text-white font-dsbold text-lg mb-4">
                Cancellation Details
              </Text>
              <View className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/30 mb-4">
                <View className="flex-row items-start">
                  <ExclamationCircleIcon color="#f43f5e" size={20} />
                  <Text className="text-rose-300 ml-2 flex-1">
                    This booking has been cancelled
                  </Text>
                </View>
              </View>
              <BookingDetailRow
                label="Reason"
                value={booking.cancellation.reason || "Customer request"}
              />
              <BookingDetailRow
                label="Cancelled On"
                value={
                  booking.cancellation.cancellationDate
                    ? new Date(booking.cancellationDate).toLocaleString()
                    : new Date().toLocaleString()
                }
              />
              <BookingDetailRow
                label="Refund Amount"
                value={`$${booking.cancellation.refundAmount || 0}`}
                valueColor="text-emerald-400"
              />
              <BookingDetailRow
                label="Fee Charged"
                value={`$${booking.cancellation.cancellationFee || 0}`}
                valueColor={
                  booking.cancellation.cancellationFee > 0
                    ? "text-rose-400"
                    : "text-white"
                }
                isLast
              />
            </View>
          )}

          {/* Cancellation Options */}
          {booking.serviceId.cancellationPolicy.allowCancellation &&
            booking.status !== "cancelled" && (
              <View className="mb-8">
                <View className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <Text className="text-white font-dsbold text-lg mb-4">
                    Cancellation Policy
                  </Text>
                  <View className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/30 mb-4">
                    <View className="flex-row items-start">
                      <CalendarIcon color="#818cf8" size={20} />
                      <Text className="text-gray-300 ml-2 flex-1">
                        Free cancellation available until{" "}
                        {new Date(
                          new Date(booking.bookingDate).getTime() -
                            booking.serviceId.cancellationPolicy
                              .freeCancellationHours *
                              3600000
                        ).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    className="bg-gray-700 rounded-xl p-4 flex-row items-center justify-center"
                    onPress={() => setCancelReasonModalVisible(true)}
                  >
                    <TrashIcon color="#f43f5e" size={20} className="mr-2" />
                    <Text className="text-rose-500 font-dsbold ml-2">
                      Cancel Booking
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
        </View>
      </ScrollView>

      {/* Cancel Booking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelReasonModalVisible}
        onRequestClose={() => setCancelReasonModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-[#0f172a] rounded-t-3xl p-6">
            <Text className="text-white font-dsbold text-xl mb-4">
              Cancel Booking
            </Text>
            <Text className="text-gray-400 mb-4">
              Please provide a reason for cancellation:
            </Text>

            <View className="bg-gray-800 rounded-xl p-4 mb-6">
              <TextInput
                className="text-white"
                placeholder="Enter reason for cancellation..."
                placeholderTextColor="#6b7280"
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
                numberOfLines={3}
              />
            </View>

            <View className="flex-row gap-x-4">
              <TouchableOpacity
                className="flex-1 bg-gray-700 p-4 rounded-xl items-center"
                onPress={() => {
                  setCancelReasonModalVisible(false);
                  setCancelReason("");
                }}
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-rose-600 p-4 rounded-xl items-center"
                onPress={handleCancelBooking}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <LottieView
                    source={require("../../assets/animations/Loading1.json")}
                    style={{ width: 24, height: 24 }}
                    autoPlay
                    loop
                  />
                ) : (
                  <Text className="text-white font-medium">Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Transaction Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={transactionModalVisible}
        onRequestClose={() => setTransactionModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-[#0f172a] rounded-t-3xl p-6">
            <Text className="text-white font-dsbold text-xl mb-4">
              Payment Transactions
            </Text>

            {booking.payment.transactions &&
            booking.payment.transactions.length > 0 ? (
              <ScrollView className="max-h-96 mb-4">
                {booking.payment.transactions.map((transaction, index) => (
                  <View key={index} className="bg-gray-800 rounded-xl p-4 mb-3">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">Transaction Type</Text>
                      <Text className="text-white capitalize">
                        {transaction.transactionType}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">Amount</Text>
                      <Text className="text-white">${transaction.amount}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">Date</Text>
                      <Text className="text-white">
                        {new Date(transaction.date).toLocaleString()}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">Status</Text>
                      <Text
                        className={
                          transaction.status === "completed"
                            ? "text-emerald-400"
                            : transaction.status === "pending"
                            ? "text-amber-400"
                            : "text-rose-400"
                        }
                      >
                        {transaction.status}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Payment Method</Text>
                      <Text className="text-white">
                        {transaction.paymentMethod}
                      </Text>
                    </View>
                    {transaction.transactionId && (
                      <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-700">
                        <Text className="text-gray-400">Transaction ID</Text>
                        <Text className="text-gray-300 text-xs">
                          {transaction.transactionId}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View className="bg-gray-800 rounded-xl p-4 mb-4 items-center">
                <Text className="text-gray-400">
                  No transaction records found
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-indigo-500 p-4 rounded-xl items-center"
              onPress={() => setTransactionModalVisible(false)}
            >
              <Text className="text-white font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Completion Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-[#0f172a] rounded-t-3xl p-6">
            <Text className="text-white font-dsbold text-xl mb-4">
              Complete Payment
            </Text>

            <View className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/30 mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-300">Booking Total:</Text>
                <Text className="text-white font-medium">
                  ${booking.pricing.totalAmount}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-300">Amount Paid:</Text>
                <Text className="text-emerald-400 font-medium">
                  ${booking.pricing.totalAmount - calculateRemainingBalance()}
                </Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-700">
                <Text className="text-gray-100 font-medium">
                  Balance to Pay:
                </Text>
                <Text className="text-white font-dsbold text-lg">
                  ${calculateRemainingBalance()}
                </Text>
              </View>
            </View>

            <Text className="text-white font-dsbold text-lg mb-3">
              Payment Information
            </Text>

            {/* Card Number */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2">Card Number</Text>
              <View className="bg-gray-800 rounded-xl p-4 flex-row items-center">
                <CreditCardIcon color="#9ca3af" size={20} />
                <TextInput
                  className="text-white ml-3 flex-1"
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                />
              </View>
            </View>

            {/* Cardholder Name */}
            <View className="mb-4">
              <Text className="text-gray-400 mb-2">Cardholder Name</Text>
              <View className="bg-gray-800 rounded-xl p-4 flex-row items-center">
                <UserGroupIcon color="#9ca3af" size={20} />
                <TextInput
                  className="text-white ml-3 flex-1"
                  placeholder="John Doe"
                  placeholderTextColor="#6b7280"
                  value={cardName}
                  onChangeText={setCardName}
                />
              </View>
            </View>

            {/* Expiry and CVC */}
            <View className="flex-row gap-x-4 mb-6">
              <View className="flex-1">
                <Text className="text-gray-400 mb-2">Expiry Date</Text>
                <View className="bg-gray-800 rounded-xl p-4">
                  <TextInput
                    className="text-white"
                    placeholder="MM/YY"
                    placeholderTextColor="#6b7280"
                    keyboardType="numeric"
                    maxLength={5}
                    value={cardExpiry}
                    onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 mb-2">CVC</Text>
                <View className="bg-gray-800 rounded-xl p-4">
                  <TextInput
                    className="text-white"
                    placeholder="123"
                    placeholderTextColor="#6b7280"
                    keyboardType="numeric"
                    maxLength={3}
                    value={cardCVC}
                    onChangeText={setCardCVC}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <View className="flex-row gap-x-4">
              <TouchableOpacity
                className="flex-1 bg-gray-700 p-4 rounded-xl items-center"
                onPress={() => {
                  setPaymentModalVisible(false);
                  // Reset form
                  setCardNumber("");
                  setCardExpiry("");
                  setCardCVC("");
                  setCardName("");
                }}
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-indigo-600 p-4 rounded-xl items-center"
                onPress={handleSubmitPayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <LottieView
                    source={require("../../assets/animations/Loading1.json")}
                    style={{ width: 24, height: 24 }}
                    autoPlay
                    loop
                  />
                ) : (
                  <Text className="text-white font-medium">
                    Pay ${calculateRemainingBalance()}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Reusable Booking Detail Row Component
const BookingDetailRow = ({
  icon,
  label,
  value,
  bold = false,
  valueColor = "text-white",
  isLast = false,
}) => (
  <View className={`flex-row items-center ${isLast ? "" : "mb-4"}`}>
    {icon && <View className="mr-3 w-6">{icon}</View>}
    <View className="flex-1">
      <Text className="text-gray-400">{label}</Text>
    </View>
    {typeof value === "object" ? (
      value
    ) : (
      <Text
        className={`${valueColor} ${
          bold ? "font-dsbold text-lg" : "font-medium"
        }`}
      >
        {value}
      </Text>
    )}
  </View>
);

export default UserBookingProfileScreen;
