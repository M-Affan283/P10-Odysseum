import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import React, { useRef, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import axiosInstance from "../utils/axios";
import { router } from "expo-router";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { ChevronLeftIcon, ShareIcon } from "react-native-heroicons/solid";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from 'expo-linear-gradient';
import images from "../../assets/images/images";
import * as Linking from "expo-linking"; 
import LottieView from "lottie-react-native";

const width = Dimensions.get('window').width;

const tempService = {
  businessId: "60c72b2f5f1b2c001f7b8b8d",  // This would be an ObjectId reference to a Business
  name: "Gourmet Dining Experience",
  description: "A luxurious dining experience with a wide variety of gourmet dishes prepared by our award-winning chefs.",
  "mediaUrls": [
      // images.ActivityImg,
      // images.ActivityImg,
  ],
  category: "Restaurant",
  pricing: {
      pricingModel: "perPerson",
      basePrice: 50,  // 50 per person
      specialPrices: [
          {
              name: "Happy Hour Discount",
              price: 35,
              conditions: {
                  daysOfWeek: ["Monday", "Tuesday"],
                  specificDates: ["2025-05-01", "2025-12-25"],  // Happy hour on May 1st and Christmas
                  minPeople: 2
              }
          },
          {
              name: "Group Discount",
              price: 40,
              conditions: {
                  minPeople: 5
              }
          }
      ]
  },
  paymentSettings: {
      acceptOnlinePayment: true,
      deposit: {
          enabled: true,
          percentage: 20  // 20% deposit required
      },
      chargeOnNoShow: {
          enabled: true,
          amount: 50  // Charge 50 if no-show
      },
      taxRate: 10  // 10% tax rate
  },
  bookingSettings: {
      requiresApproval: false,  // Instant booking
      minAdvanceBooking: 1,  // 1 hour in advance
      maxAdvanceBooking: 7,  // 7 days in advance
      bookingTimeout: 15  // 15-minute booking timeout
  },
  cancellationPolicy: {
      allowCancellation: true,
      freeCancellationHours: 24,  // Free cancellation up to 24 hours before booking
      cancellationFee: 10  // 10 fee if canceled within 24 hours
  },
  availability: {
      dates: [],
      recurring: true,
      recurringStartDate: "2025-02-23T00:00:00.000+00:00",
      daysOfWeek: [
          {
              day: "Friday",
              totalCapacity: 50,
              bookingsMade: 15
          },
          {
              day: "Saturday",
              totalCapacity: 50,
              bookingsMade: 20
          }
      ]
  },
  customDetails: {
      tableSize: "4-person tables",
      wheelchairAccessible: "Yes"
  }
}

const getQueryService = async ({serviceId}) =>
{
  try
  {
    const res = await axiosInstance.get(`/service/getById?serviceId=${serviceId}`);
    return res.data;
  }
  catch(error)
  {
    console.log(error);
    return error;
  }
}

const ServiceProfileScreen = ({serviceId}) => {

  const [selectedButton, setSelectedButton] = useState('about');


  const { data, isFetching, error, refetch} = useQuery({
    queryKey: ['service', {serviceId}],
    queryFn: () => getQueryService({serviceId}),
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
      animated: true
    })
  }

  const displayAbout = () => 
  {
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <Text className="text-white text-xl font-dsbold mb-3">About</Text>
        <View className="space-y-2">
          <Text className="text-white">{service?.description || 'No description available'}</Text>
        </View>
      </View>
    );
  };


  const displayPricing = () => 
  {
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <Text className="text-white text-xl font-dsbold mb-3">Pricing</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Pricing Model:</Text>
            <Text className="text-white">{service?.pricing.pricingModel || 'Not specified'}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Base Price:</Text>
            <Text className="text-white">${service?.pricing.basePrice || '0'}</Text>
          </View>
          
          {service?.pricing.specialPrices && service?.pricing.specialPrices.length > 0 && (
            <View>
              <Text className="text-white text-lg font-dsbold mt-3 mb-2">Special Prices</Text>
              {service?.pricing.specialPrices.map((price, index) => (
                <View key={index} className="bg-gray-700 p-3 rounded mb-2">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Name:</Text>
                    <Text className="text-white">{price.name}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Price:</Text>
                    <Text className="text-white">${price.price}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Days:</Text>
                    <Text className="text-white">{price.conditions.daysOfWeek?.join(', ') || 'None'}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Min People:</Text>
                    <Text className="text-white">{price?.conditions.minPeople || '0'}</Text>
                  </View>
                  {price.conditions.specificDates && price.conditions.specificDates.length > 0 && (
                    <View>
                      <Text className="text-gray-400">Specific Dates:</Text>
                      <Text className="text-white">{price.conditions.specificDates?.join(', ')}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const displayAvailability = () => 
  {
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <Text className="text-white text-xl font-dsbold mb-3">Availability Info</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Type:</Text>
            <Text className="text-white">{service?.availability.recurring ? 'Recurring' : 'Specific Dates'}</Text>
          </View>
          
          {service?.availability.recurring ? (
            <>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Start Date:</Text>
                <Text className="text-white">{new Date(service?.availability.recurringStartDate).toLocaleDateString('en-GB')}</Text>
              </View>
              <Text className="text-white text-lg font-semibold mt-2">Available Days:</Text>
              {service?.availability.daysOfWeek.map((day, index) => (
                <View key={index} className="bg-gray-700 p-3 rounded mb-2">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Day:</Text>
                    <Text className="text-white">{day.day}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Remaining Capacity:</Text>
                    <Text className="text-white">{day.totalCapacity - day.bookingsMade}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <>
              <Text className="text-white text-lg font-semibold mt-2">Available Dates:</Text>
              {service?.availability.dates.map((date, index) => (
                <View key={index} className="bg-gray-700 p-3 rounded mb-2">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Date:</Text>
                    <Text className="text-white">{date.date}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Remaining Capacity:</Text>
                    <Text className="text-white">{date.totalCapacity - date.bookingsMade}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </View>
    );
  };

  const displayPaymentSettings = () => 
  {
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <Text className="text-white text-xl font-dsbold mb-3">Payment Info</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Accept Online Payment:</Text>
            <Text className="text-white">{service?.paymentSettings.acceptOnlinePayment ? 'Yes' : 'No'}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Tax Rate:</Text>
            <Text className="text-white">{service?.paymentSettings.taxRate}%</Text>
          </View>
          
          <View>
            <Text className="text-white text-lg font-semibold mt-2">Deposit</Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Required:</Text>
              <Text className="text-white">{service?.paymentSettings.deposit.enabled ? 'Yes' : 'No'}</Text>
            </View>
            {service?.paymentSettings.deposit.enabled && (
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Percentage:</Text>
                <Text className="text-white">{service?.paymentSettings.deposit.percentage}%</Text>
              </View>
            )}
          </View>
          
          <View>
            <Text className="text-white text-lg font-semibold mt-2">No-Show Charge</Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Enabled:</Text>
              <Text className="text-white">{service?.paymentSettings.chargeOnNoShow.enabled ? 'Yes' : 'No'}</Text>
            </View>
            {service?.paymentSettings.chargeOnNoShow.enabled && (
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Amount:</Text>
                <Text className="text-white">${service?.paymentSettings.chargeOnNoShow.amount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  };

  const displayBookingSettings = () => 
  {
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <Text className="text-white text-xl font-dsbold mb-3">Booking Info</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Requires Approval:</Text>
            <Text className="text-white">{service?.bookingSettings.requiresApproval ? 'Yes' : 'No'}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Min Advance Booking:</Text>
            <Text className="text-white">{service?.bookingSettings.minAdvanceBooking} hours</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Max Advance Booking:</Text>
            <Text className="text-white">{service?.bookingSettings.maxAdvanceBooking} days</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Booking Timeout:</Text>
            <Text className="text-white">{service?.bookingSettings.bookingTimeout} minutes</Text>
          </View>
        </View>
      </View>
    )
  };

  const displayCancellationPolicy = () => 
  {
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <Text className="text-white text-xl font-dsbold mb-3">Cancellation Policy</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Allow Cancellation:</Text>
            <Text className="text-white">{service?.cancellationPolicy.allowCancellation ? 'Yes' : 'No'}</Text>
          </View>
          {service?.cancellationPolicy.allowCancellation && (
            <>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Free Cancellation Period:</Text>
                <Text className="text-white">{service?.cancellationPolicy.freeCancellationHours} hours</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Cancellation Fee:</Text>
                <Text className="text-white">${service?.cancellationPolicy.cancellationFee}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    )
  }

  const displayCustomDetails = () => 
  {
    if(!service?.customDetails) return (
      <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
        <Text className="text-white text-xl font-dsbold mb-3">More Info</Text>
        <Text className="text-white">No custom details added</Text>
      </View>
    )

      return (
        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">More Info</Text>
          {Object.keys(service?.customDetails).length > 0 ? (
            Object.entries(service?.customDetails).map(([key, value], index) => (
              <View key={index} className="flex-row justify-between mb-2">
                <Text className="text-gray-400">{key}:</Text>
                <Text className="text-white">{value}</Text>
              </View>
            ))
          ) : (
            <Text className="text-white">No custom details added</Text>
          )}
        </View>
    )
  };

  const buttonOptions = [
    {
      key: 'about',
      title: 'About',
      onPress: () => setSelectedButton('about')
    },
    {
      key: 'pricing',
      title: 'Pricing',
      onPress: () => setSelectedButton('pricing')
    },
    {
      key: 'availability',
      title: 'Availability',
      onPress: () => setSelectedButton('availability')
    },
    {
      key: 'paymentSettings',
      title: 'Payment',
      onPress: () => setSelectedButton('paymentSettings')
    },
    {
      key: 'bookingSettings',
      title: 'Booking ',
      onPress: () => setSelectedButton('bookingSettings')
    },
    {
      key: 'cancellationPolicy',
      title: 'Cancellation Policy',
      onPress: () => setSelectedButton('cancellationPolicy')
    },
    {
      key: 'customDetails',
      title: 'Custom Details',
      onPress: () => setSelectedButton('customDetails')
    }
  ]

  const renderContent = () =>
  {
    switch(selectedButton)
    {
      case 'about':
        return displayAbout();
      case 'pricing':
        return displayPricing();
      case 'availability':
        return displayAvailability();
      case 'paymentSettings':
        return displayPaymentSettings();
      case 'bookingSettings':
        return displayBookingSettings();
      case 'cancellationPolicy':
        return displayCancellationPolicy();
      case 'customDetails':
        return displayCustomDetails();
      default:
        return displayAbout();
    }
  }

  if(isFetching)
  {
    return (
      <View className="bg-[#070f1b] flex-1 justify-center items-center">
        <LottieView
          source={require('../../assets/animations/Loading1.json')}
          style={{
            width: 150,
            height: 150,
          }}
          autoPlay
          loop
        />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#070f1b]">
      {/* Fixed carousel at the top */}
      <View style={{ height: 310, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
        {
          service?.mediaUrls.length > 0 ?
          (
            <>
              <Carousel
                data={service?.mediaUrls}
                loop={false}
                ref={carouselRef}
                width={width}
                height={310}
                scrollAnimationDuration={100}
                onProgressChange={progress}
                onConfigurePanGesture={(panGesture) => {
                    panGesture.activeOffsetX([-5, 5]);
                    panGesture.failOffsetY([-5, 5]);
                }}
                style={{ alignItems: "center", justifyContent: "center" }}
                renderItem={({ item }) => (
                  <View className="items-center">
                    <Image
                      source={{ uri:item }}
                      style={{ width: width, height: 310, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
                      resizeMode="cover"
                    />
                  </View>
                )}
                />
                
                <Pagination.Basic 
                  progress={progress}
                  data={service?.mediaUrls}
                  onPress={onPressPagination}
                  size={10}
                  dotStyle={{backgroundColor: 'gray', borderRadius: 100}}
                  activeDotStyle={{backgroundColor: 'white', overflow: 'hidden', aspectRatio: 1, borderRadius: 15}}
                  containerStyle={{gap: 5, marginBottom: 10}}
                  horizontal
                />
              </>
          )
          :
          (
            <Image source={images.ActivityImg} style={{ width: width, height: 315, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} resizeMode="cover" />
          )
        }

      </View>

      <ScrollView className="flex-1 mt-2">
        <View className="py-4 px-4">
          <Text className="font-dsregular text-gray-400 text-xl">{service?.category || 'N/A'}</Text>
          <Text className="font-dsbold text-white text-4xl mt-2">{service?.name || 'N/A'}</Text>
            
          <View className="flex-row mt-4 gap-x-5">

            <LinearGradient
              colors={['#439DFEE8', '#F687FFE8']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 1 }}
              className="mt-2"
              style={{ width: 100, height: 70, borderRadius: 15, justifyContent: 'center', alignItems: 'center'}}
            >
                
              <Text className="font-dsregular text-white text-lg">Type</Text>
              <Text className="font-dsbold text-white text-xl mb-2">{ service?.availability?.recurring ? 'Recurring' : 'Specific Dates' }</Text>
              
              
            </LinearGradient>
            
            <LinearGradient
              colors={['#439DFEE8', '#F687FFE8']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 1 }}
              className="mt-2"
              style={{ width: 100, height: 70, borderRadius: 15, justifyContent: 'center', alignItems: 'center'}}
              >
                
              <Text className="font-dsregular text-white text-lg">Starting</Text>
              <Text className="font-dsbold text-white text-base mb-2">{ service?.availability?.recurring ? new Date(service.availability.recurringStartDate).toLocaleDateString('en-GB') : new Date(service.availability.dates[0].date).toLocaleDateString('en-GB') }</Text>
              
              
            </LinearGradient>

          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <View className="flex-row gap-x-3">
              {buttonOptions.map((button, index) => (
                <TouchableOpacity 
                  key={index}
                  className={`items-center py-2 px-4 rounded-xl ${selectedButton === button.key ? 'bg-purple-600' : 'bg-gray-800'}`}
                  onPress={button.onPress}
                >
                <Text className="font-dsbold text-white text-lg">{button.title}</Text>
              </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* here display inservice?ation based on what is selected. ideally availablity and pricing should be shown in a simialr as that in reveiwscreen function in service create screen */}
          <View className="flex-1 mt-5">
            {renderContent()}
          </View>

        </View>


      </ScrollView>
      {/* footer here for book now button */}
      <View className="flex-row justify-between items-center mb-4">
      
        <View className="flex-col ml-4">
          <Text className="text-gray-500 text-xl">Pricing from:</Text>
          <Text className="font-dsbold text-white text-xl">${service?.pricing?.basePrice || 'N/A'} / {service?.pricing?.pricingModel || 'N/A'}</Text>
        </View>

        <TouchableOpacity className="items-center rounded-xl mr-4" onPress={() => router.push(`/service/${serviceId}/booking`)}>

          <LinearGradient
            colors={['#439DFEE8', '#F687FFE8']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 1 }}
            className="mt-2"
            style={{ width: 150, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center'}}
          >
              
            <Text className="font-dsbold text-white text-2xl">Book Now</Text>
          </LinearGradient>
        
        </TouchableOpacity>
      </View>


      <SafeAreaView className="flex-row justify-between items-center w-full absolute mt-4">
        <TouchableOpacity className="p-2 rounded-full ml-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={() => router.back()}>
          <ChevronLeftIcon size={30} strokeWidth={4} color='white' />
        </TouchableOpacity>

        <TouchableOpacity className="p-2 rounded-full mr-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}} onPress={() => console.log("Implement this")}>
          <ShareIcon size={30} strokeWidth={4} color='white' />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default ServiceProfileScreen;
