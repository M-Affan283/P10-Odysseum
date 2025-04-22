import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import React, { useRef, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import {
  ChevronLeftIcon,
  ShareIcon,
  StarIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "react-native-heroicons/solid";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import images from "../../assets/images/images";
import * as Linking from "expo-linking";
import LottieView from "lottie-react-native";

const width = Dimensions.get("window").width;

const tempService = {
  businessId: "60c72b2f5f1b2c001f7b8b8d", // This would be an ObjectId reference to a Business
  name: "Gourmet Dining Experience",
  description:
    "A luxurious dining experience with a wide variety of gourmet dishes prepared by our award-winning chefs.",
  mediaUrls: [
    // images.ActivityImg,
    // images.ActivityImg,
  ],
  category: "Restaurant",
  pricing: {
    pricingModel: "perPerson",
    basePrice: 50, // 50 per person
    specialPrices: [
      {
        name: "Happy Hour Discount",
        price: 35,
        conditions: {
          daysOfWeek: ["Monday", "Tuesday"],
          specificDates: ["2025-05-01", "2025-12-25"], // Happy hour on May 1st and Christmas
          minPeople: 2,
        },
      },
      {
        name: "Group Discount",
        price: 40,
        conditions: {
          minPeople: 5,
        },
      },
    ],
  },
  paymentSettings: {
    acceptOnlinePayment: true,
    deposit: {
      enabled: true,
      percentage: 20, // 20% deposit required
    },
    chargeOnNoShow: {
      enabled: true,
      amount: 50, // Charge 50 if no-show
    },
    taxRate: 10, // 10% tax rate
  },
  bookingSettings: {
    requiresApproval: false, // Instant booking
    minAdvanceBooking: 1, // 1 hour in advance
    maxAdvanceBooking: 7, // 7 days in advance
    bookingTimeout: 15, // 15-minute booking timeout
  },
  cancellationPolicy: {
    allowCancellation: true,
    freeCancellationHours: 24, // Free cancellation up to 24 hours before booking
    cancellationFee: 10, // 10 fee if canceled within 24 hours
  },
  availability: {
    dates: [],
    recurring: true,
    recurringStartDate: "2025-02-23T00:00:00.000+00:00",
    daysOfWeek: [
      {
        day: "Friday",
        totalCapacity: 50,
        bookingsMade: 15,
      },
      {
        day: "Saturday",
        totalCapacity: 50,
        bookingsMade: 20,
      },
    ],
  },
  customDetails: {
    tableSize: "4-person tables",
    wheelchairAccessible: "Yes",
  },
};

const getQueryService = async ({ serviceId }) => {
  try {
    const res = await axiosInstance.get(
      `/service/getById?serviceId=${serviceId}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const ServiceProfileScreen = ({ serviceId }) => {
  const [selectedButton, setSelectedButton] = useState("about");

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["service", { serviceId }],
    queryFn: () => getQueryService({ serviceId }),
    // enabled: !!serviceId
  });

  const service = data?.service || tempService;
  // const service = tempService;
  // const isFetching = false;

  const carouselRef = useRef(null);
  const progress = useSharedValue(0);

  const onPressPagination = (index) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const formatDayToShort = (day) => {
    const dayMappings = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };
    return dayMappings[day] || day;
  };

  const displayAbout = () => {
    return (
      <View className="bg-slate-800/60 rounded-2xl p-5 mb-4">
        <Text className="font-dsbold text-white text-xl mb-4">About</Text>
        <Text className="text-white/80 text-base leading-6">
          {service?.description || "No description available"}
        </Text>
      </View>
    );
  };

  const displayPricing = () => {
    return (
      <View className="bg-slate-800/60 rounded-2xl p-5 mb-4">
        <Text className="font-dsbold text-white text-xl mb-4">Pricing</Text>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white/60 text-base">Pricing Model</Text>
          <Text className="text-white text-base">
            {service?.pricing.pricingModel || "Not specified"}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white/60 text-base">Base Price</Text>
          <Text className="text-white text-base">
            ${service?.pricing.basePrice || "0"}
          </Text>
        </View>

        {service?.pricing.specialPrices &&
          service?.pricing.specialPrices.length > 0 && (
            <View className="mt-4">
              <Text className="font-dsbold text-purple-400 text-lg mb-3">
                Special Prices
              </Text>
              {service?.pricing.specialPrices.map((price, index) => (
                <View
                  key={index}
                  className="bg-gray-900/60 rounded-xl overflow-hidden mb-3"
                >
                  <View className="flex-row justify-between items-center bg-purple-900/30 p-3">
                    <Text className="text-white text-base">{price.name}</Text>
                    <Text className="text-purple-400 text-base">
                      ${price.price}
                    </Text>
                  </View>

                  <View className="p-3">
                    {price.conditions.daysOfWeek?.length > 0 && (
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-white/60 text-base">Days</Text>
                        <Text className="text-white text-base">
                          {price.conditions.daysOfWeek
                            ?.map(formatDayToShort)
                            .join(", ")}
                        </Text>
                      </View>
                    )}

                    {price?.conditions.minPeople > 0 && (
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-white/60 text-base">
                          Min People
                        </Text>
                        <Text className="text-white text-base">
                          {price?.conditions.minPeople}
                        </Text>
                      </View>
                    )}

                    {price.conditions.specificDates &&
                      price.conditions.specificDates.length > 0 && (
                        <View className="flex-row justify-between items-center mb-3">
                          <Text className="text-white/60 text-base">
                            Specific Dates
                          </Text>
                          <Text className="text-white text-base">
                            {price.conditions.specificDates?.join(", ")}
                          </Text>
                        </View>
                      )}
                  </View>
                </View>
              ))}
            </View>
          )}
      </View>
    );
  };

  const displayAvailability = () => {
    return (
      <View className="bg-slate-800/60 rounded-2xl p-5 mb-4">
        <Text className="font-dsbold text-white text-xl mb-4">
          Availability
        </Text>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white/60 text-base">Type</Text>
          <Text className="text-white text-base">
            {service?.availability.recurring ? "Recurring" : "Specific Dates"}
          </Text>
        </View>

        {service?.availability.recurring ? (
          <>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white/60 text-base">Start Date</Text>
              <Text className="text-white text-base">
                {new Date(
                  service?.availability.recurringStartDate
                ).toLocaleDateString("en-GB")}
              </Text>
            </View>

            <Text className="font-dsbold text-purple-400 text-lg mb-3 mt-4">
              Available Days
            </Text>
            {service?.availability.daysOfWeek.map((day, index) => (
              <View key={index} className="bg-gray-900/60 rounded-xl p-3 mb-3">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white/60 text-base">Day</Text>
                  <Text className="text-white text-base">
                    {formatDayToShort(day.day)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white/60 text-base">
                    Remaining Spots
                  </Text>
                  <Text className="text-white text-base">
                    {day.totalCapacity - day.bookingsMade} of{" "}
                    {day.totalCapacity}
                  </Text>
                </View>

                <View className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <View
                    className="h-full bg-purple-400 rounded-full"
                    style={{
                      width: `${
                        ((day.totalCapacity - day.bookingsMade) /
                          day.totalCapacity) *
                        100
                      }%`,
                    }}
                  />
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text className="font-dsbold text-purple-400 text-lg mb-3 mt-4">
              Available Dates
            </Text>
            {service?.availability.dates.map((date, index) => (
              <View key={index} className="bg-gray-900/60 rounded-xl p-3 mb-3">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white/60 text-base">Date</Text>
                  <Text className="text-white text-base">{date.date}</Text>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white/60 text-base">
                    Remaining Spots
                  </Text>
                  <Text className="text-white text-base">
                    {date.totalCapacity - date.bookingsMade} of{" "}
                    {date.totalCapacity}
                  </Text>
                </View>

                <View className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <View
                    className="h-full bg-purple-400 rounded-full"
                    style={{
                      width: `${
                        ((date.totalCapacity - date.bookingsMade) /
                          date.totalCapacity) *
                        100
                      }%`,
                    }}
                  />
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    );
  };

  const displayPaymentSettings = () => {
    return (
      <View className="bg-slate-800/60 rounded-2xl p-5 mb-4">
        <Text className="font-dsbold text-white text-xl mb-4">
          Payment Information
        </Text>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white/60 text-base">Online Payment</Text>
          <Text className="text-white text-base">
            {service?.paymentSettings.acceptOnlinePayment
              ? "Accepted"
              : "Not Accepted"}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white/60 text-base">Tax Rate</Text>
          <Text className="text-white text-base">
            {service?.paymentSettings.taxRate}%
          </Text>
        </View>

        <View className="mt-4">
          <View className="flex-row items-center gap-2 mb-3">
            <CurrencyDollarIcon size={20} color="#A855F7" />
            <Text className="font-dsbold text-purple-400 text-lg">Deposit</Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white/60 text-base">Required</Text>
            <Text className="text-white text-base">
              {service?.paymentSettings.deposit.enabled ? "Yes" : "No"}
            </Text>
          </View>

          {service?.paymentSettings.deposit.enabled && (
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white/60 text-base">Percentage</Text>
              <Text className="text-white text-base">
                {service?.paymentSettings.deposit.percentage}%
              </Text>
            </View>
          )}
        </View>

        <View className="mt-4">
          <View className="flex-row items-center gap-2 mb-3">
            <CurrencyDollarIcon size={20} color="#A855F7" />
            <Text className="font-dsbold text-purple-400 text-lg">
              No-Show Charge
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white/60 text-base">Enabled</Text>
            <Text className="text-white text-base">
              {service?.paymentSettings.chargeOnNoShow.enabled ? "Yes" : "No"}
            </Text>
          </View>

          {service?.paymentSettings.chargeOnNoShow.enabled && (
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white/60 text-base">Amount</Text>
              <Text className="text-white text-base">
                ${service?.paymentSettings.chargeOnNoShow.amount}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const displayBookingSettings = () => {
    return (
      <View className="bg-slate-800/60 rounded-2xl p-5 mb-4">
        <Text className="font-dsbold text-white text-xl mb-4">
          Booking Information
        </Text>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white/60 text-base">Requires Approval</Text>
          <Text className="text-white text-base">
            {service?.bookingSettings.requiresApproval ? "Yes" : "No"}
          </Text>
        </View>

        <View className="mt-2">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white/60 text-base">Min Advance Booking</Text>
            <Text className="text-white text-base">
              {service?.bookingSettings.minAdvanceBooking} hours
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white/60 text-base">Max Advance Booking</Text>
            <Text className="text-white text-base">
              {service?.bookingSettings.maxAdvanceBooking} days
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white/60 text-base">Booking Timeout</Text>
            <Text className="text-white text-base">
              {service?.bookingSettings.bookingTimeout} minutes
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const displayCancellationPolicy = () => {
    return (
      <View className="bg-slate-800/60 rounded-2xl p-5 mb-4">
        <Text className="font-dsbold text-white text-xl mb-4">
          Cancellation Policy
        </Text>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white/60 text-base">Allow Cancellation</Text>
          <Text className="text-white text-base">
            {service?.cancellationPolicy.allowCancellation ? "Yes" : "No"}
          </Text>
        </View>

        {service?.cancellationPolicy.allowCancellation && (
          <>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white/60 text-base">Free Cancellation</Text>
              <Text className="text-white text-base">
                Up to {service?.cancellationPolicy.freeCancellationHours} hours
                before
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white/60 text-base">Cancellation Fee</Text>
              <Text className="text-white text-base">
                ${service?.cancellationPolicy.cancellationFee}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  const displayCustomDetails = () => {
    if (!service?.customDetails)
      return (
        <View className="bg-slate-800/60 rounded-2xl p-5 mb-4">
          <Text className="font-dsbold text-white text-xl mb-4">
            Additional Details
          </Text>
          <Text className="text-white/50 text-base italic">
            No additional details available
          </Text>
        </View>
      );

    return (
      <View className="bg-slate-800/60 rounded-2xl p-5 mb-4">
        <Text className="font-dsbold text-white text-xl mb-4">
          Additional Details
        </Text>
        {Object.keys(service?.customDetails).length > 0 ? (
          Object.entries(service?.customDetails).map(([key, value], index) => (
            <View
              key={index}
              className="flex-row justify-between items-center mb-3"
            >
              <Text className="text-white/60 text-base">{key}</Text>
              <Text className="text-white text-base">{value}</Text>
            </View>
          ))
        ) : (
          <Text className="text-white/50 text-base italic">
            No additional details available
          </Text>
        )}
      </View>
    );
  };

  const buttonOptions = [
    {
      key: "about",
      title: "About",
      icon: () => (
        <StarIcon
          size={16}
          color={selectedButton === "about" ? "#fff" : "#A855F7"}
        />
      ),
      onPress: () => setSelectedButton("about"),
    },
    {
      key: "pricing",
      title: "Pricing",
      icon: () => (
        <CurrencyDollarIcon
          size={16}
          color={selectedButton === "pricing" ? "#fff" : "#A855F7"}
        />
      ),
      onPress: () => setSelectedButton("pricing"),
    },
    {
      key: "availability",
      title: "Availability",
      icon: () => (
        <CalendarIcon
          size={16}
          color={selectedButton === "availability" ? "#fff" : "#A855F7"}
        />
      ),
      onPress: () => setSelectedButton("availability"),
    },
    {
      key: "paymentSettings",
      title: "Payment",
      icon: () => (
        <CurrencyDollarIcon
          size={16}
          color={selectedButton === "paymentSettings" ? "#fff" : "#A855F7"}
        />
      ),
      onPress: () => setSelectedButton("paymentSettings"),
    },
    {
      key: "bookingSettings",
      title: "Booking",
      icon: () => (
        <ClockIcon
          size={16}
          color={selectedButton === "bookingSettings" ? "#fff" : "#A855F7"}
        />
      ),
      onPress: () => setSelectedButton("bookingSettings"),
    },
    {
      key: "cancellationPolicy",
      title: "Cancellation",
      icon: () => (
        <ClockIcon
          size={16}
          color={selectedButton === "cancellationPolicy" ? "#fff" : "#A855F7"}
        />
      ),
      onPress: () => setSelectedButton("cancellationPolicy"),
    },
    {
      key: "customDetails",
      title: "Details",
      icon: () => (
        <StarIcon
          size={16}
          color={selectedButton === "customDetails" ? "#fff" : "#A855F7"}
        />
      ),
      onPress: () => setSelectedButton("customDetails"),
    },
  ];

  const renderContent = () => {
    switch (selectedButton) {
      case "about":
        return displayAbout();
      case "pricing":
        return displayPricing();
      case "availability":
        return displayAvailability();
      case "paymentSettings":
        return displayPaymentSettings();
      case "bookingSettings":
        return displayBookingSettings();
      case "cancellationPolicy":
        return displayCancellationPolicy();
      case "customDetails":
        return displayCustomDetails();
      default:
        return displayAbout();
    }
  };

  if (isFetching) {
    return (
      <View className="flex-1 bg-[#070f1b] justify-center items-center">
        <LottieView
          source={require("../../assets/animations/Loading1.json")}
          style={{ width: 150, height: 150 }}
          autoPlay
          loop
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#070f1b]">
      <StatusBar barStyle="light-content" />

      {/* Image Carousel */}
      <View className="h-[340px] absolute top-0 left-0 right-0 z-10">
        {service?.mediaUrls.length > 0 ? (
          <>
            <Carousel
              data={service?.mediaUrls}
              loop={false}
              ref={carouselRef}
              width={width}
              height={340}
              scrollAnimationDuration={100}
              onProgressChange={progress}
              onConfigurePanGesture={(panGesture) => {
                panGesture.activeOffsetX([-5, 5]);
                panGesture.failOffsetY([-5, 5]);
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              )}
            />

            <LinearGradient
              colors={[
                "transparent",
                "rgba(7, 15, 27, 0.5)",
                "rgba(7, 15, 27, 0.8)",
                "#070f1b",
              ]}
              className="absolute bottom-0 left-0 right-0 h-[150px]"
            />

            <View className="absolute bottom-5 left-0 right-0 justify-center flex-row gap-1.5">
              <Pagination.Basic
                progress={progress}
                data={service?.mediaUrls}
                onPress={onPressPagination}
                size={8}
                dotStyle="w-2 h-2 rounded-full bg-white/40"
                activeDotStyle="w-2.5 h-2.5 rounded-full bg-white"
                containerStyle="flex-row gap-1.5 justify-center"
                horizontal
              />
            </View>
          </>
        ) : (
          <>
            <Image
              source={images.ActivityImg}
              className="w-full h-full"
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                "transparent",
                "rgba(7, 15, 27, 0.5)",
                "rgba(7, 15, 27, 0.8)",
                "#070f1b",
              ]}
              className="absolute bottom-0 left-0 right-0 h-[150px]"
            />
          </>
        )}
      </View>

      <ScrollView
        className="flex-1 mt-[280px] z-20"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pb-32">
          {/* Service Title and Category */}
          <View className="mb-4">
            <Text className="text-purple-400 text-base mb-1">
              {service?.category || "N/A"}
            </Text>
            <Text className="font-dsbold text-white text-2xl leading-tight">
              {service?.name || "N/A"}
            </Text>
          </View>

          {/* Key Highlights */}
          <View className="flex-row justify-between my-4">
            <View className="flex-1 bg-slate-800/60 rounded-xl p-3 mx-1 items-center">
              <CalendarIcon size={20} color="#A855F7" />
              <Text className="text-purple-400 text-xs mt-1.5 mb-0.5">
                Type
              </Text>
              <Text className="text-white text-sm text-center">
                {service?.availability?.recurring
                  ? "Recurring"
                  : "Specific Dates"}
              </Text>
            </View>

            <View className="flex-1 bg-slate-800/60 rounded-xl p-3 mx-1 items-center">
              <ClockIcon size={20} color="#A855F7" />
              <Text className="text-purple-400 text-xs mt-1.5 mb-0.5">
                Starting
              </Text>
              <Text className="text-white text-sm text-center">
                {service?.availability?.recurring
                  ? new Date(
                      service.availability.recurringStartDate
                    ).toLocaleDateString("en-GB")
                  : service?.availability?.dates &&
                    service.availability.dates.length > 0
                  ? new Date(
                      service.availability.dates[0].date
                    ).toLocaleDateString("en-GB")
                  : "N/A"}
              </Text>
            </View>

            <View className="flex-1 bg-slate-800/60 rounded-xl p-3 mx-1 items-center">
              <CurrencyDollarIcon size={20} color="#A855F7" />
              <Text className="text-purple-400 text-xs mt-1.5 mb-0.5">
                Price
              </Text>
              <Text className="text-white text-sm text-center">
                ${service?.pricing?.basePrice || "N/A"}
              </Text>
            </View>
          </View>

          {/* Navigation Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="my-4"
            contentContainerStyle={{
              gap: 12,
              paddingVertical: 6,
              paddingHorizontal: 2,
            }}
          >
            {buttonOptions.map((button, index) => (
              <TouchableOpacity
                key={index}
                className={`items-center justify-center px-3 py-2 rounded-lg ${
                  selectedButton === button.key
                    ? "bg-purple-900"
                    : "bg-slate-800/60"
                }`}
                onPress={button.onPress}
              >
                <View className="flex-row items-center justify-center gap-1.5">
                  {button.icon()}
                  <Text
                    className={`font-dsbold text-sm ${
                      selectedButton === button.key
                        ? "text-white"
                        : "text-purple-400"
                    }`}
                  >
                    {button.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Content Display */}
          {renderContent()}
        </View>
      </ScrollView>

      {/* Book Now Footer */}
      <LinearGradient
        colors={[
          "transparent",
          "rgba(7, 15, 27, 0.8)",
          "rgba(7, 15, 27, 0.95)",
        ]}
        className="absolute bottom-0 left-0 right-0 h-[120px] z-30"
      >
        <View className="absolute bottom-0 left-0 right-0 flex-row justify-between items-center px-4 py-5 z-40">
          <View className="flex-row items-baseline">
            <Text className="text-white/60 text-sm mr-1">From</Text>
            <Text className="font-dsbold text-white text-2xl">
              ${service?.pricing?.basePrice || "N/A"}
            </Text>
            <Text className="text-white/60 text-sm ml-1">
              / {service?.pricing?.pricingModel || "unit"}
            </Text>
          </View>

          <TouchableOpacity
            className="rounded-xl overflow-hidden"
            onPress={() => router.push(`/service/${serviceId}/booking`)}
          >
            <LinearGradient
              colors={["#1a1040", "#3b0764", "#4c0150"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-5 py-3"
            >
              <Text className="font-dsbold text-white text-lg text-center">
                Book Now
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Header Navigation */}
      <SafeAreaView className="absolute top-0 left-0 right-0 flex-row justify-between px-4 pt-4 z-50">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-black/30 justify-center items-center"
          onPress={() => router.back()}
        >
          <ChevronLeftIcon size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-black/30 justify-center items-center"
          onPress={() => console.log("Implement share function")}
        >
          <ShareIcon size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default ServiceProfileScreen;
