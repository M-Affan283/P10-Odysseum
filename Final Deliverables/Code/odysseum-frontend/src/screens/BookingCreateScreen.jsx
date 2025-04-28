import {
  View,
  Text,
  FlatList,
  Platform,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import useUserStore from "../context/userStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import LottieView from "lottie-react-native";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  CalendarIcon,
} from "react-native-heroicons/solid";
import images from "../../assets/images/images";
import CalendarModal from "../components/CalendarModal";
import Checkbox from "expo-checkbox";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

const { width } = Dimensions.get("window");

const BookingCreateScreen = ({ serviceId }) => {
  //this screen will be used to book a service
  //addiotnally add my bookings screen for profile
  //option here that when user sets a date for booking, an api call is made to check if the service is available on that date.
  //if not, show a message that the service is not available on that date, and ask the user to select another date.
  //also a timer must be added to the screen to show the time left for the user to book the service.
  //if the time runs out, show a message that the time has run out and the user must restart.
  //UI similar to screate service screen, but with a timer and a calendar to select the date.

  const FormData = global.FormData;
  const user = useUserStore((state) => state.user);
  const flatListRef = React.useRef();

  const [uploading, setUploading] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false); //if timeout then show a message and restart the process by going back to the first screen
  const [serviceLoading, setServiceLoading] = useState(true); //for loading the service
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [error, setError] = useState("");
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [service, setService] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [form, setForm] = useState({
    bookingDate: "",
    status: "",
    numberOfPeople: "",
    timeSlot: {
      startTime: "",
      endTime: "",
    },
    hotelBooking: {
      isHotel: false,
      numberOfNights: "",
      checkInDate: "",
      checkOutDate: "",
    },
    payment: {
      status: "",
      //transactions handledin the backend
    },
    //if online payment
    paymentMethod: "",
    paymentDetails: {
      cardNumber: "",
      expiryDate: "",
      cvc: "",
      name: "",
    },
  });

  const createBooking = async () => {
    console.log("Creating booking");
    setUploading(true);

    // Prepare the booking data to send to backend
    let bookingData = {
      ...form,
      userId: user._id,
      serviceId: serviceId,
    };

    // If it's a hotel booking and we have number of nights information,
    // ensure timeSlot is set properly based on check-in/check-out dates
    if (form.hotelBooking.isHotel && form.hotelBooking.numberOfNights) {
      // timeSlot is already set in the BookingInfoScreen, so we can just pass it along
    }

    axiosInstance
      .post("/booking/create", bookingData)
      .then((res) => {
        console.log(res.data);
        setUploading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(err.response.data.message);
        setUploading(false);
      });
  };

  const getService = async () => {
    console.log("Retrieving service...");

    setServiceLoading(true);

    axiosInstance
      .get(`/service/getById?serviceId=${serviceId}`)
      .then((res) => {
        // console.log(res.data)
        const serviceData = res.data.service;
        setService(serviceData);

        // Check if service is a hotel and update form accordingly
        if (
          serviceData.category === "Hotel" ||
          serviceData.subcategory === "Hotel"
        ) {
          setForm((prev) => ({
            ...prev,
            hotelBooking: {
              ...prev.hotelBooking,
              isHotel: true,
            },
          }));
        }

        setServiceLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(err.response.data.message);
        setServiceLoading(false);
      });
  };

  useEffect(() => {
    getService();
  }, []);

  const getServiceAvailability = async (date) => {
    console.log(date);

    setAvailabilityLoading(true);

    axiosInstance
      .get(`/service/getAvailability?serviceId=${serviceId}&date=${date}`)
      .then((res) => {
        // console.log(res.data.availability)
        setAvailabilityInfo(res.data.availability);
        setAvailabilityLoading(false);
      })
      .catch((err) => {
        console.log(err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occurred while checking service availability.",
          visibilityTime: 4000,
        });
        setAvailabilityLoading(false);
      });
  };

  // Handle Next button click
  const onNextPress = () => {
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Move to next screen in FlatList
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  // Handle Back button click
  const onBackPress = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Move to previous screen in FlatList
      flatListRef.current.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const screens = [
    { screen: StartScreen, params: { onNextPress } },
    {
      screen: DateSelectScreen,
      params: {
        service,
        onNextPress,
        onBackPress,
        form,
        setForm,
        getServiceAvailability,
        calendarVisible,
        setCalendarVisible,
        focusedInput,
        availabilityInfo,
        availabilityLoading,
      },
    },
    {
      screen: BookingInfoScreen,
      params: {
        service,
        onNextPress,
        onBackPress,
        form,
        setForm,
        focusedInput,
        isEndTimePickerVisible,
        setEndTimePickerVisible,
        isStartTimePickerVisible,
        setStartTimePickerVisible,
      },
    },
    {
      screen: PaymentScreen,
      params: {
        service,
        onNextPress,
        onBackPress,
        form,
        setForm,
        focusedInput,
      },
    },
    {
      screen: ReviewScreen,
      params: { service, onNextPress, onBackPress, form, createBooking },
    },
    { screen: SuccessScreen, params: { uploading, error } },
  ];

  if (serviceLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#070f1b]">
        <LottieView
          source={require("../../assets/animations/Loading1.json")}
          autoPlay
          loop={true}
          style={{ width: 400, height: 400 }}
        />

        <Text className="text-gray-300 text-4xl p-5 font-dsbold">
          Loading...
        </Text>

        <Text className="text-gray-400 text-lg p-5 text-center">
          Please wait while we load the service details.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
      {service && (
        <View className="absolute bottom-5 right-5 z-10">
          <CountdownCircleTimer
            isPlaying
            duration={service?.bookingSettings?.bookingTimeout * 60} // Convert minutes to seconds
            colors={["#00FF00", "#F7B801", "#A30000"]}
            colorsTime={[
              service.bookingSettings.timeout * 60 * 0.6,
              service.bookingSettings.timeout * 60 * 0.3,
              0,
            ]}
            size={70}
            strokeWidth={6}
            onComplete={() => {
              setIsTimedOut(true);
              Toast.show({
                type: "error",
                text1: "Time Expired",
                text2:
                  "Your booking session has timed out. Please start again.",
                visibilityTime: 4000,
              });
              return { shouldRepeat: false };
            }}
          >
            {({ remainingTime }) => {
              const minutes = Math.floor(remainingTime / 60);
              const seconds = remainingTime % 60;
              return (
                <View className="items-center">
                  <Text className="text-white text-xs">Time Left</Text>
                  <Text className="text-white font-bold">
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                  </Text>
                </View>
              );
            }}
          </CountdownCircleTimer>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={screens}
        initialScrollIndex={currentIndex}
        scrollEnabled={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ width: width }}>{item.screen(item.params)}</View>
        )}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const StartScreen = ({ onNextPress }) => {
  return (
    //move to screen center
    <View className="flex-1 items-center justify-center">
      <Image
        source={images.BookingImg}
        style={{ width: "95%", height: 250 }}
        className="rounded-full"
        resizeMode="cover"
      />

      <Text className="text-gray-300 text-4xl p-5 font-dsbold">
        Create Booking
      </Text>

      <Text className="text-gray-400 text-lg p-5 text-center">
        Welcome to the booking hub. This hub will guide you through the process
        of making a reservation for a service.
      </Text>

      <View className="flex-row gap-x-10 py-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10"
        >
          <ArrowLeftIcon size={40} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNextPress}
          className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10"
        >
          <ArrowRightIcon size={40} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DateSelectScreen = ({
  service,
  onNextPress,
  onBackPress,
  form,
  setForm,
  getServiceAvailability,
  calendarVisible,
  setCalendarVisible,
  focusedInput,
  availabilityInfo,
  availabilityLoading,
}) => {
  const setBookingDate = (date) => {
    const dateString = date.toISOString();
    setForm((prevForm) => ({
      ...prevForm,
      bookingDate: dateString,
      hotelBooking: {
        ...prevForm.hotelBooking,
        checkInDate: dateString, // Set check-in date for hotel bookings
      },
    }));

    // This ensures we're using the actual dateString value, not depending on state
    getServiceAvailability(dateString);
  };

  const checkAdvanceBookingRequirements = () => {
    if (!form.bookingDate || !service.bookingSettings) return null;

    const bookingDate = moment(form.bookingDate);
    const currTime = moment();

    // Check if booking is too soon
    if (
      bookingDate.isBefore(
        currTime.clone().add(service.bookingSettings.minAdvanceBooking, "hours")
      )
    ) {
      return {
        valid: false,
        message: `Booking must be made at least ${service.bookingSettings.minAdvanceBooking} hours in advance`,
      };
    }

    // Check if booking is too far in the future
    if (
      bookingDate.isAfter(
        currTime.clone().add(service.bookingSettings.maxAdvanceBooking, "days")
      )
    ) {
      return {
        valid: false,
        message: `Booking must be made at most ${service.bookingSettings.maxAdvanceBooking} days in advance`,
      };
    }

    return {
      valid: true,
      message: "Booking time is valid",
    };
  };

  const validateScreen = () => {
    if (!Date.parse(form.bookingDate) || !form.bookingDate) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a booking date.",
        visibilityTime: 4000,
      });
      return;
    }

    const advanceCheck = checkAdvanceBookingRequirements();
    if (!advanceCheck?.valid) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: advanceCheck.message,
        visibilityTime: 4000,
      });
      return;
    }

    onNextPress();
  };

  // Function to determine the status color
  const getStatusColor = (status) => {
    if (status.includes("Available")) return "text-green-500";
    if (status.includes("Limited")) return "text-yellow-500";
    return "text-red-500"; // For Fully Booked or Unavailable
  };

  // Function to handle selecting a date from upcoming dates
  const selectUpcomingDate = (dateString) => {
    const date = new Date(dateString);
    setBookingDate(date);
  };

  return (
    <View className="flex-1">
      <TouchableOpacity onPress={() => router.back()} className="p-3">
        <XMarkIcon size={30} color="white" />
      </TouchableOpacity>

      <ScrollView className="p-2 mx-2">
        <Image
          source={images.Business2Img}
          style={{ width: 400, height: 250 }}
          resizeMode="contain"
        />
        <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">
          Select a Booking Date.
        </Text>

        {/* First display available days/dates of service */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">
            Availability Info
          </Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Type:</Text>
              <Text className="text-white">
                {service?.availability.recurring
                  ? "Recurring"
                  : "Specific Dates"}
              </Text>
            </View>

            {service?.availability.recurring ? (
              <>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Start Date:</Text>
                  <Text className="text-white">
                    {new Date(
                      service?.availability.recurringStartDate
                    ).toLocaleDateString("en-GB")}
                  </Text>
                </View>
                <Text className="text-white text-lg font-semibold mt-2">
                  Available Days:
                </Text>
                {service?.availability.daysOfWeek.map((day, index) => (
                  <View key={index} className="bg-gray-700 p-3 rounded mb-2">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Day:</Text>
                      <Text className="text-white">{day.day}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Remaining Capacity:</Text>
                      <Text className="text-white">
                        {day.totalCapacity - day.bookingsMade}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <>
                <Text className="text-white text-lg font-semibold mt-2">
                  Available Dates:
                </Text>
                {service?.availability.dates.map((date, index) => (
                  <View key={index} className="bg-gray-700 p-3 rounded mb-2">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Date:</Text>
                      <Text className="text-white">
                        {new Date(date.date).toLocaleDateString("en-GB")}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Remaining Capacity:</Text>
                      <Text className="text-white">
                        {date.totalCapacity - date.bookingsMade}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>

        {/* Select a date */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">
            Select a Date
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400">Booking Date:</Text>
            <TouchableOpacity
              onPress={() => setCalendarVisible(true)}
              className="flex-row items-center gap-x-2 bg-gray-700 p-2 rounded-lg"
            >
              <Text className="text-white">
                {form.bookingDate
                  ? new Date(form.bookingDate).toLocaleDateString("en-GB")
                  : "Select Date"}
              </Text>
              <CalendarIcon size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Display availability information */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">
            Availability Status
          </Text>

          {availabilityLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text className="text-gray-400 mt-2">
                Checking availability...
              </Text>
            </View>
          ) : availabilityInfo ? (
            <View className="space-y-4">
              {/* Show availability status */}
              <View className="bg-gray-700 p-4 rounded-lg">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-400">Date:</Text>
                  <Text className="text-white">
                    {availabilityInfo.requestedDate}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400">Status:</Text>
                  <Text
                    className={`font-dsbold ${getStatusColor(
                      availabilityInfo.availabilityStatus
                    )}`}
                  >
                    {availabilityInfo.availabilityStatus}
                  </Text>
                </View>

                {/* Add Advance Booking Check */}
                {form.bookingDate && (
                  <>
                    {(() => {
                      const advanceCheck = checkAdvanceBookingRequirements();
                      return (
                        <View className="mt-3 pt-3 border-t border-gray-600">
                          <Text className="text-gray-400 mb-1">
                            Booking Window:
                          </Text>
                          <Text
                            className={`font-dsbold ${
                              advanceCheck?.valid
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {advanceCheck?.message}
                          </Text>
                        </View>
                      );
                    })()}
                  </>
                )}
              </View>

              {/* If not available on requested date, show upcoming dates */}
              {!availabilityInfo.isAvailable &&
                availabilityInfo.upcomingDates.length > 0 && (
                  <View>
                    <Text className="text-white text-lg font-dsbold mb-2">
                      Upcoming Available Dates:
                    </Text>
                    <View className="space-y-2">
                      {availabilityInfo.upcomingDates.map((date, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => selectUpcomingDate(date.date)}
                          className="bg-gray-700 p-3 rounded-lg flex-row justify-between items-center"
                        >
                          <Text className="text-white">{date.date}</Text>
                          <View className="flex-row items-center">
                            <Text className="text-green-500 mr-2">
                              {date.remainingSpots} spots
                            </Text>
                            <ArrowRightIcon size={16} color="#8B5CF6" />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
            </View>
          ) : (
            <Text className="text-gray-400 text-center py-4">
              Please select a date to check availability
            </Text>
          )}
        </View>

        <View className="flex-row gap-5 py-5 justify-center">
          <TouchableOpacity
            onPress={onBackPress}
            className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10"
          >
            <ArrowLeftIcon size={40} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={validateScreen}
            className={`${
              !form.bookingDate ||
              (availabilityInfo && !availabilityInfo.isAvailable)
                ? "bg-gray-500"
                : "bg-purple-500"
            } w-14 h-14 p-2 rounded-full mt-10`}
            disabled={
              !form.bookingDate ||
              (availabilityInfo && !availabilityInfo.isAvailable)
            }
          >
            <ArrowRightIcon size={30} color="black" />
          </TouchableOpacity>
        </View>

        {/* Calendar Modal */}
        <CalendarModal
          visible={calendarVisible}
          setVisible={setCalendarVisible}
          setDate={setBookingDate}
        />
      </ScrollView>
    </View>
  );
};

//time slot, number of people
const BookingInfoScreen = ({
  service,
  onNextPress,
  onBackPress,
  form,
  setForm,
  focusedInput,
  isStartTimePickerVisible,
  setStartTimePickerVisible,
  isEndTimePickerVisible,
  setEndTimePickerVisible,
}) => {
  // const [isHotel, setIsHotel] = useState(form.hotelBooking.isHotel);

  const handleStartTimeConfirm = (time) => {
    setForm({
      ...form,
      timeSlot: {
        ...form.timeSlot,
        startTime: new Date(time).toLocaleTimeString("en-GB"),
      },
    });
    setStartTimePickerVisible(false);
  };

  const handleEndTimeConfirm = (time) => {
    setForm({
      ...form,
      timeSlot: {
        ...form.timeSlot,
        endTime: new Date(time).toLocaleTimeString("en-GB"),
      },
    });
    setEndTimePickerVisible(false);
  };

  // Function to update number of nights for hotel bookings
  const updateNumberOfNights = (nights) => {
    if (isNaN(nights) || nights <= 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid number of nights",
        visibilityTime: 4000,
      });
      return;
    }

    // Calculate checkout date based on check-in date and nights
    const checkInDate = new Date(form.bookingDate);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + parseInt(nights));

    // Default check-in time is 14:00 (2 PM) and check-out time is 12:00 (noon)
    const checkInTime = "14:00:00";
    const checkOutTime = "12:00:00";

    setForm({
      ...form,
      hotelBooking: {
        ...form.hotelBooking,
        isHotel: true,
        numberOfNights: nights,
        checkOutDate: checkOutDate.toISOString(),
      },
      timeSlot: {
        startTime: checkInTime,
        endTime: checkOutTime,
      },
    });
  };

  const validateScreen = () => {
    if (form.hotelBooking.isHotel) {
      // Hotel booking validation
      if (!form.hotelBooking.numberOfNights) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please enter the number of nights for your stay.",
          visibilityTime: 4000,
        });
        return;
      }
    } else {
      // Regular service booking validation
      if (!form.timeSlot.startTime) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please select a start time.",
          visibilityTime: 4000,
        });
        return;
      }

      if (!form.timeSlot.endTime) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please select an end time.",
          visibilityTime: 4000,
        });
        return;
      }
    }

    if (!form.numberOfPeople) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter the number of people.",
        visibilityTime: 4000,
      });
      return;
    }

    onNextPress();
  };

  return (
    <View className="flex-1">
      <TouchableOpacity onPress={() => router.back()} className="p-3">
        <XMarkIcon size={30} color="white" />
      </TouchableOpacity>

      <ScrollView className="p-2 mx-2">
        <Image
          source={images.Business2Img}
          style={{ width: 400, height: 250 }}
          resizeMode="contain"
        />
        <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">
          Enter Booking Information.
        </Text>

        {form.hotelBooking.isHotel ? (
          // Hotel booking form
          <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
            <Text className="text-white text-xl font-dsbold mb-3">
              Hotel Stay Details
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400">Check-in Date:</Text>
              <Text className="text-white">
                {form.bookingDate
                  ? new Date(form.bookingDate).toLocaleDateString("en-GB")
                  : "Not selected"}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-400">Number of Nights:</Text>
              <TextInput
                placeholder="Enter number of nights"
                placeholderTextColor="#4B5563"
                keyboardType="numeric"
                style={{
                  width: 200,
                  padding: 10,
                  color: "white",
                  backgroundColor: "#374151",
                  borderRadius: 10,
                }}
                value={form.hotelBooking.numberOfNights}
                onChangeText={(text) => updateNumberOfNights(text)}
              />
            </View>
            {form.hotelBooking.checkOutDate && (
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-400">Check-out Date:</Text>
                <Text className="text-white">
                  {new Date(form.hotelBooking.checkOutDate).toLocaleDateString(
                    "en-GB"
                  )}
                </Text>
              </View>
            )}
            <View className="p-2 mt-2 bg-gray-700 rounded">
              <Text className="text-gray-300">
                Standard check-in time: 2:00 PM
              </Text>
              <Text className="text-gray-300">
                Standard check-out time: 12:00 PM
              </Text>
            </View>
          </View>
        ) : (
          // Regular service booking form - time slot selection
          <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
            <Text className="text-white text-xl font-dsbold mb-3">
              Select a Time Slot
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400">Start Time:</Text>
              <TouchableOpacity
                onPress={() => setStartTimePickerVisible(true)}
                className="bg-gray-700 py-2 px-4 rounded-lg"
              >
                <Text className="text-white">
                  {form.timeSlot.startTime
                    ? form.timeSlot.startTime
                    : "Select Start Time"}
                </Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isStartTimePickerVisible}
                mode="time"
                onConfirm={handleStartTimeConfirm}
                onCancel={() => setStartTimePickerVisible(false)}
              />
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-400">End Time:</Text>
              <TouchableOpacity
                onPress={() => setEndTimePickerVisible(true)}
                className="bg-gray-700 py-2 px-4 rounded-lg"
              >
                <Text className="text-white">
                  {form.timeSlot.endTime
                    ? form.timeSlot.endTime
                    : "Select End Time"}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isEndTimePickerVisible}
                mode="time"
                onConfirm={handleEndTimeConfirm}
                onCancel={() => setEndTimePickerVisible(false)}
              />
            </View>
          </View>
        )}

        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">
            Number of People
          </Text>
          <TextInput
            placeholder="Number of People"
            placeholderTextColor="#4B5563"
            keyboardType="numeric"
            style={{
              padding: 10,
              color: "white",
              backgroundColor: "#374151",
              borderRadius: 10,
            }}
            value={form.numberOfPeople}
            onChangeText={(text) => setForm({ ...form, numberOfPeople: text })}
          />
        </View>

        <View className="flex-row gap-5 py-5 justify-center">
          <TouchableOpacity
            onPress={onBackPress}
            className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10 items-center justify-center"
          >
            <ArrowLeftIcon size={30} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={validateScreen}
            className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10 items-center justify-center"
          >
            <ArrowRightIcon size={30} color="black" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

//pricing, payment method
const PaymentScreen = ({
  service,
  onNextPress,
  onBackPress,
  form,
  setForm,
  focusedInput,
}) => {
  //check if online payment is enabled. if not, show a message that online payment is not enabled for this service, so skip this step.

  // if (!service?.onlinePaymentEnabled)
  // {
  //   onNextPress();
  // }

  const enableonlinePayment = service?.paymentSettings?.acceptOnlinePayment;
  // console.log(enableonlinePayment);

  // Define payment options data
  const paymentOptions = [
    { label: "Credit Card", value: "credit_card" },
    { label: "Debit Card", value: "debit_card" },
    { label: "Paypal", value: "paypal" },
    { label: "Stripe", value: "stripe" },
  ];

  const validateScreen = () => {
    if (!service?.paymentSettings?.acceptOnlinePayment) {
      onNextPress();
      return;
    }

    if (!form.paymentMethod) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a payment method.",
        visibilityTime: 4000,
      });
      return;
    }

    if (!form.paymentDetails.cardNumber) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a card number.",
        visibilityTime: 4000,
      });
      return;
    }

    if (!form.paymentDetails.expiryDate) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter an expiry date.",
        visibilityTime: 4000,
      });
      return;
    }

    if (!form.paymentDetails.cvc) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a CVV.",
        visibilityTime: 4000,
      });
      return;
    }

    if (!form.paymentDetails.name) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a name.",
        visibilityTime: 4000,
      });
      return;
    }

    onNextPress();
  };

  return (
    <View className="flex-1">
      <TouchableOpacity onPress={() => router.back()} className="p-3">
        <XMarkIcon size={30} color="white" />
      </TouchableOpacity>

      <ScrollView className="p-2 mx-2">
        <Image
          source={images.Business2Img}
          style={{ width: 400, height: 250 }}
          resizeMode="contain"
        />
        <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">
          Enter Payment Information.
        </Text>

        {enableonlinePayment ? (
          <>
            <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
              <Text className="text-white text-xl font-dsbold mb-3">
                Select a Payment Method
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400">Payment Method:</Text>
                <Dropdown
                  style={{
                    height: 50,
                    width: 200,
                    borderRadius: 8,
                    backgroundColor: "#374151",
                    paddingHorizontal: 8,
                  }}
                  placeholderStyle={{ color: "#9CA3AF" }}
                  selectedTextStyle={{ color: "white" }}
                  data={paymentOptions}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select payment method"
                  value={form.paymentMethod}
                  onChange={(item) => {
                    setForm((prevForm) => ({
                      ...prevForm,
                      paymentMethod: item.value,
                    }));
                  }}
                />
              </View>
            </View>

            <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
              <Text className="text-white text-xl font-dsbold mb-3">
                Enter Payment Details
              </Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-400">Card Number:</Text>
                <TextInput
                  placeholder="Card Number"
                  placeholderTextColor="#4B5563"
                  style={{
                    width: 200,
                    padding: 10,
                    color: "white",
                    backgroundColor: "#374151",
                    borderRadius: 10,
                  }}
                  value={form.paymentDetails.cardNumber}
                  onChangeText={(text) =>
                    setForm((prevForm) => ({
                      ...prevForm,
                      paymentDetails: {
                        ...prevForm.paymentDetails,
                        cardNumber: text,
                      },
                    }))
                  }
                />
              </View>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-400">Expiry Date:</Text>
                <TextInput
                  placeholder="Expiry Date"
                  placeholderTextColor="#4B5563"
                  style={{
                    width: 200,
                    padding: 10,
                    color: "white",
                    backgroundColor: "#374151",
                    borderRadius: 10,
                  }}
                  value={form.paymentDetails.expiryDate}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      paymentDetails: {
                        ...form.paymentDetails,
                        expiryDate: text,
                      },
                    })
                  }
                />
              </View>

              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-400">CVV:</Text>
                <TextInput
                  placeholder="CVV"
                  placeholderTextColor="#4B5563"
                  style={{
                    width: 200,
                    padding: 10,
                    color: "white",
                    backgroundColor: "#374151",
                    borderRadius: 10,
                  }}
                  value={form.paymentDetails.cvc}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      paymentDetails: { ...form.paymentDetails, cvc: text },
                    })
                  }
                />
              </View>

              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-400">Name:</Text>
                <TextInput
                  placeholder="Name"
                  placeholderTextColor="#4B5563"
                  style={{
                    width: 200,
                    padding: 10,
                    color: "white",
                    backgroundColor: "#374151",
                    borderRadius: 10,
                  }}
                  value={form.paymentDetails.name}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      paymentDetails: { ...form.paymentDetails, name: text },
                    })
                  }
                />
              </View>
            </View>
          </>
        ) : (
          <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
            <Text className="text-white text-xl font-dsbold mb-3">
              Payment Method
            </Text>
            <Text className="text-gray-400 text-lg">
              Online payment is not enabled for this service. Please proceed to
              the next step.
            </Text>
          </View>
        )}

        <View className="flex-row gap-5 py-5 justify-center">
          <TouchableOpacity
            onPress={onBackPress}
            className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10"
          >
            <ArrowLeftIcon size={40} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={validateScreen}
            className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10"
          >
            <ArrowRightIcon size={40} color="black" />
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => console.log(JSON.stringify(form))}
            className="bg-purple-500 h-14 p-2 rounded-full mt-10"
          >
            <Text className="text-white text-lg font-dsbold">Debug</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </View>
  );
};

//review booking, confirm
const ReviewScreen = ({
  service,
  onNextPress,
  onBackPress,
  form,
  createBooking,
}) => {
  // Calculate billing information based on service pricing and booking details
  const calculateBillingInfo = () => {
    const { pricing, paymentSettings } = service;
    let basePrice = pricing.basePrice;
    let oldBasePrice = pricing.basePrice;
    let specialPrice = null;

    // Check for special prices
    if (pricing.specialPrices && pricing.specialPrices.length > 0) {
      const bookingDay = new Date(form.bookingDate).toLocaleDateString(
        "en-US",
        { weekday: "long" }
      );
      const specialPriceMatch = pricing.specialPrices.find((sp) => {
        return (
          !sp.conditions.daysOfWeek ||
          sp.conditions.daysOfWeek.includes(bookingDay) ||
          !sp.conditions.specificDates ||
          sp.conditions.specificDates.some(
            (date) =>
              new Date(date).toDateString() ===
              new Date(form.bookingDate).toDateString()
          ) ||
          !sp.conditions.minPeople ||
          parseInt(form.numberOfPeople) >= sp.conditions.minPeople
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
    let pricingDetails = "";

    switch (pricing.pricingModel) {
      case "perPerson":
        totalBeforeTax *= parseInt(form.numberOfPeople);
        pricingDetails = `${basePrice} × ${form.numberOfPeople} people`;
        break;
      case "perHour":
        if (form.hotelBooking.isHotel) {
          // For hotels, calculate based on nights instead of hours
          const nights = parseInt(form.hotelBooking.numberOfNights) || 1;
          totalBeforeTax = basePrice * nights;
          pricingDetails = `${basePrice} × ${nights} nights`;
        } else {
          const startTime = new Date(
            `${new Date(form.bookingDate).toISOString().split("T")[0]}T${
              form.timeSlot.startTime
            }`
          );
          const endTime = new Date(
            `${new Date(form.bookingDate).toISOString().split("T")[0]}T${
              form.timeSlot.endTime
            }`
          );
          const durationInHours = Math.ceil(
            (endTime - startTime) / (1000 * 60 * 60)
          );
          totalBeforeTax = basePrice * durationInHours;
          pricingDetails = `${basePrice} × ${durationInHours} hours`;
        }
        break;
      case "perDay":
        if (form.hotelBooking.isHotel) {
          // For hotels, days is same as nights
          const nights = parseInt(form.hotelBooking.numberOfNights) || 1;
          totalBeforeTax = basePrice * nights;
          pricingDetails = `${basePrice} × ${nights} nights`;
        } else {
          const startDay = new Date(
            `${new Date(form.bookingDate).toISOString().split("T")[0]}T${
              form.timeSlot.startTime
            }`
          );
          const endDay = new Date(
            `${new Date(form.bookingDate).toISOString().split("T")[0]}T${
              form.timeSlot.endTime
            }`
          );
          const durationInDays = Math.ceil(
            (endDay - startDay) / (1000 * 60 * 60 * 24)
          );
          totalBeforeTax = basePrice * (durationInDays || 1);
          pricingDetails = `${basePrice} × ${durationInDays || 1} days`;
        }
        break;
      case "fixed":
      default:
        if (form.hotelBooking.isHotel) {
          // Even for fixed price hotels, we might multiply by nights
          const nights = parseInt(form.hotelBooking.numberOfNights) || 1;
          totalBeforeTax = basePrice * nights;
          pricingDetails = `${basePrice} × ${nights} nights`;
        } else {
          pricingDetails = `Fixed price`;
        }
        break;
    }

    // Calculate tax
    const taxRate = paymentSettings.taxRate || 0;
    const taxAmount = (totalBeforeTax * taxRate) / 100;

    // Calculate deposit if enabled
    const depositAmount = paymentSettings.deposit.enabled
      ? (totalBeforeTax * paymentSettings.deposit.percentage) / 100
      : 0;

    return {
      basePrice,
      oldBasePrice,
      specialPrice,
      totalBeforeTax,
      taxRate,
      taxAmount,
      depositAmount,
      totalAmount: totalBeforeTax + taxAmount,
      pricingDetails,
      pricingModel: pricing.pricingModel,
    };
  };

  const billingInfo = calculateBillingInfo();

  return (
    <View className="flex-1 items-center justify-center">
      <ScrollView
        className="p-2 w-[90%] mx-auto"
        contentContainerStyle={{ alignItems: "center" }}
      >
        <Image
          source={images.ReviewImg}
          style={{ width: "95%", height: 250 }}
          className="rounded-full"
          resizeMode="cover"
        />

        <Text className="text-gray-300 text-4xl p-5 font-dsbold">
          Review and Submit
        </Text>

        <Text className="text-gray-400 text-lg p-5 text-center">
          Please review the information you have provided and submit.
        </Text>

        <View className="p-2 w-full">
          <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
            <Text className="text-white text-xl font-dsbold mb-3">
              Booking Information
            </Text>
            {form.hotelBooking.isHotel ? (
              // Hotel booking information
              <>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Check-in Date:</Text>
                  <Text className="text-white">
                    {new Date(form.bookingDate).toLocaleDateString("en-GB")}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Check-in Time:</Text>
                  <Text className="text-white">{form.timeSlot.startTime}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Number of Nights:</Text>
                  <Text className="text-white">
                    {form.hotelBooking.numberOfNights}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Check-out Date:</Text>
                  <Text className="text-white">
                    {new Date(
                      form.hotelBooking.checkOutDate
                    ).toLocaleDateString("en-GB")}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Check-out Time:</Text>
                  <Text className="text-white">{form.timeSlot.endTime}</Text>
                </View>
              </>
            ) : (
              // Regular booking information
              <>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Booking Date:</Text>
                  <Text className="text-white">
                    {new Date(form.bookingDate).toLocaleDateString("en-GB")}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Start Time:</Text>
                  <Text className="text-white">{form.timeSlot.startTime}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">End Time:</Text>
                  <Text className="text-white">{form.timeSlot.endTime}</Text>
                </View>
              </>
            )}
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Number of People:</Text>
              <Text className="text-white">{form.numberOfPeople}</Text>
            </View>
          </View>

          {/* New Billing Information Section */}
          <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
            <Text className="text-white text-xl font-dsbold mb-3">
              Billing Information
            </Text>

            <View className="flex-row justify-between">
              <Text className="text-gray-400">Pricing Model:</Text>
              <Text className="text-white capitalize">
                {billingInfo.pricingModel.replace(/([A-Z])/g, " $1")}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-400">Base Price:</Text>
              <Text className="text-white">
                ${billingInfo.oldBasePrice.toFixed(2)}
              </Text>
            </View>

            {billingInfo.specialPrice && billingInfo.specialPrice.applied && (
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Special Price:</Text>
                <Text className="text-green-500">
                  {billingInfo.specialPrice.name} ($
                  {billingInfo.specialPrice.price.toFixed(2)})
                </Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <Text className="text-gray-400">Calculation:</Text>
              <Text className="text-white">{billingInfo.pricingDetails}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-400">Subtotal:</Text>
              <Text className="text-white">
                ${billingInfo.totalBeforeTax.toFixed(2)}
              </Text>
            </View>

            {billingInfo.taxRate > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-gray-400">
                  Tax ({billingInfo.taxRate}%):
                </Text>
                <Text className="text-white">
                  ${billingInfo.taxAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-700">
              <Text className="text-gray-300 font-dsbold">Total:</Text>
              <Text className="text-white font-dsbold">
                ${billingInfo.totalAmount.toFixed(2)}
              </Text>
            </View>

            {service?.paymentSettings?.acceptOnlinePayment && (
              <>
                {billingInfo.depositAmount > 0 ? (
                  <>
                    <View className="flex-row justify-between mt-4 pt-2 border-t border-gray-700">
                      <Text className="text-gray-400">
                        Deposit ({service.paymentSettings.deposit.percentage}%):
                      </Text>
                      <Text className="text-white">
                        ${billingInfo.depositAmount.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Remaining Balance:</Text>
                      <Text className="text-white">
                        $
                        {(
                          billingInfo.totalAmount - billingInfo.depositAmount
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View className="mt-2">
                    <Text className="text-green-500">
                      Full payment will be processed
                    </Text>
                  </View>
                )}
              </>
            )}

            {!service?.paymentSettings?.acceptOnlinePayment && (
              <View className="mt-2">
                <Text className="text-yellow-500">
                  Payment will be collected on-site
                </Text>
              </View>
            )}
          </View>

          <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
            <Text className="text-white text-xl font-dsbold mb-3">
              Payment Information
            </Text>
            {service?.paymentSettings?.acceptOnlinePayment ? (
              <>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Payment Method:</Text>
                  <Text className="text-white">{form.paymentMethod}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Card Number:</Text>
                  <Text className="text-white">
                    {form.paymentDetails.cardNumber}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Expiry Date:</Text>
                  <Text className="text-white">
                    {form.paymentDetails.expiryDate}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">CVV:</Text>
                  <Text className="text-white">{form.paymentDetails.cvc}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Name:</Text>
                  <Text className="text-white">{form.paymentDetails.name}</Text>
                </View>
              </>
            ) : (
              <Text className="text-gray-400 text-lg">
                Online payment is not enabled for this service.
              </Text>
            )}
          </View>

          <View className="flex-row gap-5 py-5 justify-center">
            <TouchableOpacity
              onPress={onBackPress}
              className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10"
            >
              <ArrowLeftIcon size={40} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onNextPress();
                createBooking();
              }}
              className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10"
            >
              <ArrowRightIcon size={40} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

//success screen
const SuccessScreen = ({ uploading, error }) => {
  return uploading ? (
    <View className="flex-1 items-center justify-center">
      <LottieView
        source={require("../../assets/animations/Creating.json")}
        autoPlay
        loop={true}
        style={{ width: 400, height: 400 }}
      />

      <Text className="text-gray-300 text-4xl p-5 font-dsbold">
        Adding your booking...
      </Text>

      <Text className="text-gray-400 text-lg p-5 text-center">
        Please wait while we create your booking. This may take a few seconds.
      </Text>
    </View>
  ) : error ? (
    <View className="flex-1 items-center justify-center">
      <LottieView
        source={require("../../assets/animations/Error.json")}
        autoPlay
        loop={true}
        style={{ width: 400, height: 400 }}
      />

      <Text className="text-gray-300 text-4xl p-5 font-dsbold">
        Error creating booking
      </Text>

      <Text className="text-gray-400 text-lg p-5 text-center">
        An error occurred while making the booking. Please try again later.
      </Text>
      <Text className="text-gray-400 text-lg p-5 text-center">
        Error: {error}
      </Text>

      <View className="flex-row gap-x-10 mb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-purple-500 p-3 rounded-full mt-10"
        >
          <Text className="text-white text-lg">Back to Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View className="flex-1 items-center justify-center">
      <LottieView
        source={require("../../assets/animations/Success.json")}
        autoPlay
        loop={false}
        style={{ width: 300, height: 300 }}
      />

      <Text className="text-gray-300 text-4xl p-5 font-dsbold">
        Booking Created!!
      </Text>

      <Text className="text-gray-400 text-lg p-5 text-center">
        Congratulations! Your booking has been successfully created.
      </Text>

      <View className="flex-row gap-x-10 py-5">
        <TouchableOpacity
          onPress={() => router.replace("/user/booking/bookings")}
          className="bg-purple-500 p-3 rounded-full mt-10"
        >
          <Text className="text-white text-lg">Go to My Bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default BookingCreateScreen;
