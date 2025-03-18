import { View, Text, FlatList, Platform, TouchableOpacity, Dimensions, TextInput, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import useUserStore from '../context/userStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import LottieView from "lottie-react-native";
import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon, CalendarIcon } from 'react-native-heroicons/solid';
import images from '../../assets/images/images';
import CalendarModal from '../components/CalendarModal';
import Checkbox from "expo-checkbox";
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const { width } = Dimensions.get('window');

const BookingCreateScreen = ({ serviceId }) => {

  //this screen will be used to book a service
  //addiotnally add my bookings screen for profile
  //option here that when user sets a date for booking, an api call is made to check if the service is available on that date.
  //if not, show a message that the service is not available on that date, and ask the user to select another date.
  //also a timer must be added to the screen to show the time left for the user to book the service.
  //if the time runs out, show a message that the time has run out and the user must restart.
  //UI similar to screate service screen, but with a timer and a calendar to select the date.

  const FormData = global.FormData;
  const user = useUserStore(state => state.user);
  const flatListRef = React.useRef();

  const [uploading, setUploading] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(true); //for loading the service
  const [availablityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [error, setError] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [service, setService] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [form, setForm] = useState({
    bookingDate: '',
    status: '',
    numberOfPeople: '',
  timeSlot: {
      startTime: '',
      endTime: ''
    },
    pricing: {
      basePrice: '',
      specialPrice: {
        applied: '',
        name: '',
        price: ''
      },
      taxAmount: '',
      depositAmount: '',
      totalAmount: ''
    },
    payment: {
      status: ''
      //transactions handledin the backend
    },

    //if online payment
    paymentMethod: '',
    paymentDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      name: ''
    },
  })

  const createBooking = async () =>
  {
    console.log("Creating booking")
    setUploading(true)

    axiosInstance.post('/booking/create', { ...form, userId: user._id, serviceId: serviceId })
    .then((res)=>
    {
      console.log(res.data)
      setUploading(false)
    })
    .catch((err)=>
    {
      console.log(err)
      setError(err.response.data.message)
      setUploading(false)
    })
  }

  const getService = async () => 
  {
    console.log("Retrieving service...")

    setServiceLoading(true);

    axiosInstance.get(`/service/getById?serviceId=${serviceId}`)
    .then((res)=>
    {
      console.log(res.data)
      setService(res.data.service)
      setServiceLoading(false);
    })
    .catch((err)=>
    {
      console.log(err)
      setError(err.response.data.message)
      setServiceLoading(false);
    })
  }

  useEffect(() => {
    // getService();
  }, []);

  const getServiceAvailability = async (date) => {}
  const setBookingDate = (date) =>
  {
    setForm({ ...form, bookingDate: date })
  }

  useEffect(() =>
  {
    //if the booking date is changed, check if the service is available on that date
    getServiceAvailability(form.bookingDate);
  }, [form.bookingDate]);


  // Handle Next button click
  const onNextPress = () => 
  {
      if (currentIndex < screens.length - 1) 
      {
          setCurrentIndex(currentIndex + 1);
          // Move to next screen in FlatList
          flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
      }
  };

  // Handle Back button click
  const onBackPress = () => 
  {
      if (currentIndex > 0) 
      {
          setCurrentIndex(currentIndex - 1);
          // Move to previous screen in FlatList
          flatListRef.current.scrollToIndex({ index: currentIndex - 1, animated: true });
      }
  };

  const screens = [
    // {screen: startScreen, params: {onNextPress}},
    {screen: DateSelectScreen, params: {onNextPress, onBackPress, form, setForm, getServiceAvailability, calendarVisible, setCalendarVisible, focusedInput, setBookingDate }},
    // {screen: BookingInfoScreen, params: {onNextPress, onBackPress, form, setForm, focusedInput }},
    // {screen: PaymentScreen, params: {onNextPress, onBackPress, form, setForm, focusedInput }},
    // {screen: ReviewScreen, params: {onNextPress, onBackPress, form, setForm, focusedInput }},
    // {screen: SuccessScreen, params: {uploading, error }},
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">

      {/* timer here on top right*/}
      {service && (
        <View className="absolute top-3 right-3 z-10">
          <CountdownCircleTimer
            isPlaying
            duration={service.bookingSettings.timeout * 60} // Convert minutes to seconds
            colors={['#00FF00', '#F7B801', '#A30000']}
            colorsTime={[
              (service.bookingSettings.timeout * 60) * 0.6,
              (service.bookingSettings.timeout * 60) * 0.3,
              0
            ]}
            size={70}
            strokeWidth={6}
            onComplete={() => {
              setIsTimedOut(true);
              Toast.show({
                type: 'error',
                text1: 'Time Expired',
                text2: 'Your booking session has timed out. Please start again.',
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
          <View style={{ width: width}}>
            {item.screen(item.params)}
          </View>   
        )} 
      />
    </SafeAreaView>
  )
}

const startScreen = ({onNextPress}) => {}

const DateSelectScreen = ({service, onNextPress, onBackPress, form, setForm, getServiceAvailability, calendarVisible, setCalendarVisible, focusedInput, setBookingDate, availabilityInfo, availablityLoading }) => 
{
  const validateScreen = () => {};

  return (
    <View className="flex-1">
      <TouchableOpacity onPress={() => router.replace(`/service/profile/${service._id}`)} className="p-3">
        <XMarkIcon size={30} color="white" />
      </TouchableOpacity>

      <ScrollView className="p-2 mx-2">
        <Image source={images.Business2Img} style={{ width: 400, height: 250 }} resizeMode='contain' />
        <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Select a Booking Date.</Text>

        {/* First displat available dates of service */}
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

        {/* Select a date */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">Select a Date</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400">Booking Date:</Text>
            <TouchableOpacity onPress={() => setCalendarVisible(true)} className="flex-row items-center gap-x-2">
              <Text className="text-white">{form.bookingDate ? new Date(form.bookingDate).toLocaleDateString('en-GB') : 'Select Date'}</Text>
              <CalendarIcon size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Display output of getServiceAvailability here. it will tell if its available at the selecred dates. if not it will give array of upcoming dates */}
        

        <View className="flex-row gap-5 py-5 justify-center">
            <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                <ArrowLeftIcon size={40} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={validateScreen} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                <ArrowRightIcon size={40} color="black" />
            </TouchableOpacity>
        </View>

        {/* Calendar Modal */}
        <CalendarModal visible={calendarVisible} setVisible={setCalendarVisible} setDate={setBookingDate}/>

      </ScrollView>
    </View>
  )
};

//time slot, number of people
const BookingInfoScreen = ({service, onNextPress, onBackPress, form, setForm, focusedInput, isStartTimePickerVisible, setStartTimePickerVisible, isEndTimePickerVisible, setEndTimePickerVisible }) => 
{

  const handleStartTimeConfirm = (time) => 
  {
      setForm({ ...form, timeSlot: { ...form.timeSlot, startTime: new Date(time).toLocaleTimeString('en-GB') } });
      setStartTimePickerVisible(false);
  };

  const handleEndTimeConfirm = (time) =>
  {
      setForm({ ...form, timeSlot: { ...form.timeSlot, endTime: new Date(time).toLocaleTimeString('en-GB') } });
      setEndTimePickerVisible(false);
  };

  return (
    <View className="flex-1">
      <TouchableOpacity onPress={() => router.replace(`/service/profile/${service._id}`)} className="p-3">
        <XMarkIcon size={30} color="white" />
      </TouchableOpacity>

      <ScrollView className="p-2 mx-2">
        <Image source={images.Business2Img} style={{ width: 400, height: 250 }} resizeMode='contain' />
        <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Enter Booking Information.</Text>

        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">Select a Time Slot</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400">Start Time:</Text>
            <TouchableOpacity 
              onPress={() => setStartTimePickerVisible(true)} 
              className="bg-gray-700 py-2 px-4 rounded-lg"
            >
              <Text className="text-white">
                {form.timeSlot.startTime ? form.timeSlot.startTime : 'Select Start Time'}
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
                {form.timeSlot.endTime ? form.timeSlot.endTime : 'Select End Time'}
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

        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">Number of People</Text>
          <TextInput
            placeholder="Number of People"
            placeholderTextColor="#4B5563"
            style={{ padding: 10, color: 'white', backgroundColor: '#374151', borderRadius: 10 }}
            value={form.numberOfPeople}
            onChangeText={(text) => setForm({ ...form, numberOfPeople: text })}
          />
        </View>

        <View className="flex-row gap-5 py-5 justify-center">
            <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                <ArrowLeftIcon size={40} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onNextPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                <ArrowRightIcon size={40} color="black" />
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
};

//pricing, payment method
const PaymentScreen = ({service, onNextPress, onBackPress, form, setForm, focusedInput }) => 
{
  //check if online payment is enabled. if not, show a message that online payment is not enabled for this service, so skip this step.

  if (!service?.onlinePaymentEnabled) return onNextPress();

  return (
    <View className="flex-1">
      <TouchableOpacity onPress={() => router.replace(`/service/profile/${service._id}`)} className="p-3">
        <XMarkIcon size={30} color="white" />
      </TouchableOpacity>

      <ScrollView className="p-2 mx-2">
        <Image source={images.Business2Img} style={{ width: 400, height: 250 }} resizeMode='contain' />
        <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Enter Payment Information.</Text>

        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">Select a Payment Method</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400">Payment Method:</Text>
            <Dropdown
              options={[
                { label: 'Credit Card', value: 'credit_card' },
                { label: 'Debit Card', value: 'debit_card' },
                { label: 'Paypal', value: 'paypal' },
                { label: 'Stripe', value: 'stripe' },
              ]}
              value={form.paymentMethod}
              onChange={(text) => setForm({ ...form, paymentMethod: text })}
            />
          </View>
        </View>

        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">Enter Payment Details</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400">Card Number:</Text>
            <TextInput
              placeholder="Card Number"
              placeholderTextColor="#4B5563"
              style={{ width: 200, padding: 10, color: 'white', backgroundColor: '#374151', borderRadius: 10 }}
              value={form.paymentDetails.cardNumber}
              onChangeText={(text) => setForm({ ...form, paymentDetails: { ...form.paymentDetails, cardNumber: text } })}
            />
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-gray-400">Expiry Date:</Text>
            <TextInput
              placeholder="Expiry Date"
              placeholderTextColor="#4B5563"
              style={{ width: 200, padding: 10, color: 'white', backgroundColor: '#374151', borderRadius: 10 }}
              value={form.paymentDetails.expiryDate}
              onChangeText={(text) => setForm({ ...form, paymentDetails: { ...form.paymentDetails, expiryDate: text } })}
            />
          </View>

          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-gray-400">CVV:</Text>
            <TextInput
              placeholder="CVV"
              placeholderTextColor="#4B5563"
              style={{ width: 200, padding: 10, color: 'white', backgroundColor: '#374151', borderRadius: 10 }}
              value={form.paymentDetails.cvv}
              onChangeText={(text) => setForm({ ...form, paymentDetails: { ...form.paymentDetails, cvv: text } })}
            />
          </View>

          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-gray-400">Name:</Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor="#4B5563"
              style={{ width: 200, padding: 10, color: 'white', backgroundColor: '#374151', borderRadius: 10 }}
              value={form.paymentDetails.name}
              onChangeText={(text) => setForm({ ...form, paymentDetails: { ...form.paymentDetails, name: text } })}
            />
          </View>
        </View>

        <View className="flex-row gap-5 py-5 justify-center">
            <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                <ArrowLeftIcon size={40} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onNextPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                <ArrowRightIcon size={40} color="black" />
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
};

//review booking, confirm
const ReviewScreen = ({service, onNextPress, onBackPress, form, setForm, focusedInput }) =>
{
  return (
    <View className="flex-1 items-center justify-center">
      <ScrollView className="p-2 w-[90%] mx-auto" contentContainerStyle={{ alignItems: 'center' }}>
        <Image source={images.ReviewImg} style={{ width: '95%', height: 250 }} className="rounded-full" resizeMode='cover' />

        <Text className="text-gray-300 text-4xl p-5 font-dsbold">Review and Submit</Text>

        <Text className="text-gray-400 text-lg p-5 text-center">Please review the information you have provided and submit.</Text>
        
        <View className="p-2 w-full">
          <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
            <Text className="text-white text-xl font-dsbold mb-3">Booking Information</Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Booking Date:</Text>
              <Text className="text-white">{new Date(form.bookingDate).toLocaleDateString('en-GB')}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Start Time:</Text>
              <Text className="text-white">{form.timeSlot.startTime}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">End Time:</Text>
              <Text className="text-white">{form.timeSlot.endTime}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Number of People:</Text>
              <Text className="text-white">{form.numberOfPeople}</Text>
            </View>
          </View>

          <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
            <Text className="text-white text-xl font-dsbold mb-3">Payment Information</Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Payment Method:</Text>
              <Text className="text-white">{form.paymentMethod}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Card Number:</Text>
              <Text className="text-white">{form.paymentDetails.cardNumber}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Expiry Date:</Text>
              <Text className="text-white">{form.paymentDetails.expiryDate}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">CVV:</Text>
              <Text className="text-white">{form.paymentDetails.cvv}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Name:</Text>
              <Text className="text-white">{form.paymentDetails.name}</Text>
            </View>
          </View>

          <View className="flex-row gap-5 py-5 justify-center">
              <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                  <ArrowLeftIcon size={40} color="black" />
              </TouchableOpacity>

              <TouchableOpacity onPress={onNextPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                  <ArrowRightIcon size={40} color="black" />
              </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  ) 
};

//success screen
const successScreen = ({uploading, error}) => {
    return (

        uploading ? (
            <View className="flex-1 items-center justify-center">
                <LottieView
                    source={require('../../assets/animations/Creating.json')}
                    autoPlay
                    loop={true}
                    style={{ width: 400, height: 400 }}
                />

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Adding your booking...</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">Please wait while we create your booking. This may take a few seconds.</Text>
            
            </View>
        )
        :
        error ? (
            <View className="flex-1 items-center justify-center">
                <LottieView
                    source={require('../../assets/animations/Error.json')}
                    autoPlay
                    loop={true}
                    style={{ width: 400, height: 400 }}
                />

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Error creating booking</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">An error occurred while creating your service. Please try again later.</Text>
                <Text className="text-gray-400 text-lg p-5 text-center">Error: {error}</Text>

                <View className="flex-row gap-x-10 mb-3">
                    <TouchableOpacity onPress={() => router.replace(`/service/profile/${service._id}`)} className="bg-purple-500 p-3 rounded-full mt-10">
                        <Text className="text-white text-lg">Back to Settings</Text>
                    </TouchableOpacity>
                </View>

            
            </View> 
        )
        :
        (
            <View className="flex-1 items-center justify-center">
                <LottieView
                    source={require('../../assets/animations/Success.json')}
                    autoPlay
                    loop={false}
                    style={{ width: 300, height: 300 }}
                />

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Service!!</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">Congratulations! Your service has been successfully created. Now go and advertise it to the world!</Text>

                <View className="flex-row gap-x-10 py-5">

                    <TouchableOpacity onPress={() => router.replace('/route-to-mybooking-in-profile')} className="bg-purple-500 p-3 rounded-full mt-10">
                        <Text className="text-white text-lg">Complete</Text>
                    </TouchableOpacity>
                </View>
            
            </View>
        )
        

    );
};
export default BookingCreateScreen