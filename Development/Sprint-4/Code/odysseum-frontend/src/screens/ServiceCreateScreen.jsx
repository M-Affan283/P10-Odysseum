import { View, Text, FlatList, Platform, TouchableOpacity, Dimensions, TextInput, Image, ScrollView } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../utils/axios';
import useUserStore from '../context/userStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import LottieView from "lottie-react-native";
import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon, CalendarIcon, PhotoIcon, TrashIcon } from 'react-native-heroicons/solid';
import images from '../../assets/images/images';
import CalendarModal from '../components/CalendarModal';
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";

const { width } = Dimensions.get('window');

const ServiceCreateScreen = ({ businessId }) => {
    const FormData = global.FormData;
    const user = useUserStore(state => state.user);
    const flatListRef = React.useRef();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [focusedInput, setFocusedInput] = useState(null);
    const [specialPrices, setSpecialPrices] = useState([]);
    const [customDetails, setCustomDetails] = useState({});
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [currentEditingIndex, setCurrentEditingIndex] = useState(null);
    const [editMode, setEditMode] = useState('date'); // 'date' or 'day
    const [currentIndex, setCurrentIndex] = useState(0);
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: '',
        media: [],
        pricing: {
            pricingModel: '',
        basePrice: '',
        specialPrices: [],
        },
        paymentSettings: {
            acceptOnlinePayment: false,
            deposit: {
                enabled: false,
                percentage: 0,
            },
            chargeOnNoShow: {
                enabled: false,
                amount: 0,
            },
            taxRate: 0,
        },
        bookingSettings: {
            requiresApproval: false,
            minAdvanceBooking: 0,
            maxAdvanceBooking: 0,
            bookingTimeout: 15,
        },
        cancellationPolicy: {
            allowCancellation: true,
            freeCancellationHours: '',
            cancellationFee: '',
        },
        availability: {
            dates: [],

            recurring: false,
            recurringStartDate: '',
            daysOfWeek: [],
        },
        customDetails: {}
    });

    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const carouselRef = useRef(null);
    const progress = useSharedValue(0);

    const pickMedia = async () => {
        const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Toast.show({
            type: "error",
            position: "top",
            text1: "Error",
            text2: "Permission to access media library is required!",
            visibilityTime: 2000,
            });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            try {
            // Compress images
            const compressedImages = await Promise.all(
                result.assets.map(async (asset) => {
                // Compress if size > 3mb
                if (asset.fileSize > 3 * 1024 * 1024) {
                    let compressedImage = await ImageManipulator.manipulateAsync(
                    asset.uri,
                    [],
                    { compress: 0.5 }
                    );
                    return { ...asset, uri: compressedImage.uri };
                }
                return asset;
                })
            );

            setForm({ ...form, media: [...form.media, ...compressedImages] });
            } catch (error) {
            console.log(error);
            Toast.show({
                type: "error",
                position: "top",
                text1: "Error",
                text2: "An error occurred while processing images",
                visibilityTime: 2000,
            });
            }
        }
    };

    const removeAllMedia = () => {
        setForm({ ...form, media: [] });
        console.log("Media Removed");
    };

    const removeSingleMedia = (index) => {
        let newMedia = form.media.filter((media, i) => i !== index);
        setForm({ ...form, media: newMedia });
    };

    const onPressPagination = (index) => 
    {
        carouselRef.current?.scrollTo({
            count: index - progress.value,
            animated: true,
        });
    };

    // debug function to print entire form object entirely along with all objects
    const printForm = () =>
    {
        console.log(JSON.stringify(form, null, 2));
    }

    const createService = async () =>
    {
        console.log("Creating service...");

        if (!form.name || !form.description || !form.category || !form.pricing.pricingModel || !form.pricing.basePrice || !form.paymentSettings.taxRate || !form.bookingSettings.minAdvanceBooking || !form.bookingSettings.maxAdvanceBooking)
        {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill out all required fields',
                position: 'bottom',
            });
            return;
        }

        setUploading(true);

        let formData = new FormData();

        formData.append('ownerId', user._id);
        formData.append('businessId', businessId);
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('category', form.category);
        formData.append('pricing', JSON.stringify(form.pricing));
        formData.append('paymentSettings', JSON.stringify(form.paymentSettings));
        formData.append('bookingSettings', JSON.stringify(form.bookingSettings));
        formData.append('cancellationPolicy', JSON.stringify(form.cancellationPolicy));
        formData.append('availability', JSON.stringify(form.availability));
        formData.append('customDetails', JSON.stringify(form.customDetails));

        form.media.forEach((media) =>
        {
            formData.append('media', {
                uri: Platform.OS === 'android' ? media.uri : media.uri.replace('file://', ''),
                type: media.mimeType,
                name: media.fileName
            })
        });

        axiosInstance.post('/service/create', formData, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            }
        })
        .then((res) =>
        {
            console.log(res.data);
            setUploading(false);
        })
        .catch((err)=>
        {
            console.log(err);
            setUploading(false);
            setError(err.response.data.message);
        })
    }

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
    // Update form when specialPrices change
    useEffect(() =>
    {
        setForm(prev => ({
            ...prev,
            pricing: {
                ...prev.pricing,
                specialPrices: specialPrices
            }
        }));
    }, [specialPrices]);

    useEffect(()=>
    {
        setForm(prev => ({
            ...prev,
            customDetails: customDetails
        }));
    }, [customDetails]);


    const screens = [
        {screen: startScreen, params: {onNextPress}},
        {screen: serviceInfoScreen, params: {focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress}},
        {screen: imageScreen, params: {form, setForm, onNextPress, onBackPress, pickMedia, removeAllMedia, removeSingleMedia, carouselRef, progress, onPressPagination, setSelectedImageIndex, setImageViewerVisible, imageViewerVisible, selectedImageIndex}},
        {screen: pricingScreen, params: {focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress, specialPrices, setSpecialPrices, calendarVisible, setCalendarVisible, currentEditingIndex, setCurrentEditingIndex}},
        {screen: paymentScreen, params: {focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress}},
        {screen: bookingScreen, params: {focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress}},
        {screen: cancellationScreen, params: {focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress}},
        {screen: availabilityScreen, params: {focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress, calendarVisible, setCalendarVisible, currentEditingIndex, setCurrentEditingIndex, editMode, setEditMode}},
        {screen: customDetailsScreen, params: {focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress, customDetails, setCustomDetails}},
        {screen: reviewScreen, params: {form, createService, onNextPress, onBackPress, printForm, carouselRef, progress, onPressPagination, setSelectedImageIndex, setImageViewerVisible}},
        {screen: successScreen, params: {uploading, error, businessId}}
    ];



    return (
        <SafeAreaView className="flex-1 bg-[#070f1b]">
                
            <FlatList
                ref={flatListRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={screens}
                initialScrollIndex={currentIndex}
                scrollEnabled={false}
                keyExtractor={(item, index) => (index).toString()}
                renderItem={({ item }) => (
                    <View style={{ width: width }}>
                        {item.screen(item.params)}
                    </View>
                )}
            />

        </SafeAreaView>
    );
};


const startScreen = ({ onNextPress }) =>
{
    return (
        //move to screen center
        <View className="flex-1 items-center justify-center">
            <Image source={images.CreateServiceImg} style={{ width: '95%', height: 250 }} className="rounded-full" resizeMode='cover' />

            <Text className="text-gray-300 text-4xl p-5 font-dsbold">Create Service</Text>

            <Text className="text-gray-400 text-lg p-5 text-center">Welcome to the service creation hub. This hub will guide you through the process of creating a new service offering for your business.</Text>

            <View className="flex-row gap-x-10 py-5">
                <TouchableOpacity onPress={ () => router.back()} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                    <ArrowLeftIcon size={40} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onNextPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                    <ArrowRightIcon size={40} color="black" />
                </TouchableOpacity>
            </View>
        
        </View>
    );
};

const serviceInfoScreen = ({ form, setForm, onNextPress, onBackPress, focusedInput, setFocusedInput }) =>
{
    const categories = ["Restaurant", "Hotel", "Shopping", "Fitness", "Health", "Beauty", "Education", "Entertainment", "Services", "Other"]

    const validateScreen = () =>
    {
        if (!form.name || !form.category || !form.description)
        {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill out all required fields',
                position: 'bottom',
            });
            return
        }

        onNextPress();
    }

    return (
    <View className="flex-1">
        <TouchableOpacity onPress={() => router.replace('/settings')} className="p-3">
            <XMarkIcon size={30} color="white" />
        </TouchableOpacity>
        
        
        <ScrollView className="p-2 mx-2">
            <Image source={images.Business2Img} style={{ width: 400, height: 250 }} resizeMode='contain' />
            <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Service Information</Text>

            <View className="p-2">
                <TextInput
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                    placeholder="Service Name"
                    placeholderTextColor="gray"
                    maxLength={30}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                    className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mb-5 ${focusedInput === 'name' ? 'border-purple-600' : 'border-gray-500'}`}
                />

                <Dropdown
                    data={categories}
                    value={form.category}
                    selectedTextStyle={{ color: 'white' }}
                    placeholder= {form.category === '' ? 'Select a category' : form.category}
                    placeholderStyle={{ color: 'gray', fontSize: 18 }}
                    onChange={(item) => setForm({ ...form, category: item })}
                    maxHeight={250}
                    onFocus={() => setFocusedInput('category')}
                    onBlur={() => setFocusedInput(null)}
                    style={{ width: '90%', height: 50, borderBottomWidth: 2, borderRadius: 12, padding: 12, borderColor: focusedInput === 'category' ? '#9333ea' : '#6b7280' }}
                    containerStyle={{ backgroundColor: '#070f1b', borderRadius: 8 }}
                    renderItem={(item) => (
                        <View className="p-3">
                            <Text className="text-lg text-white">{item}</Text>
                        </View>
                    )}
                />

                <TextInput
                    value={form.description}
                    onChangeText={(text) => setForm({ ...form, description: text })}
                    placeholder="Description"
                    placeholderTextColor="gray"
                    maxLength={250}
                    multiline={true}
                    onFocus={() => setFocusedInput('description')}
                    onBlur={() => setFocusedInput(null)}
                    className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mt-5 ${focusedInput === 'description' ? 'border-purple-600' : 'border-gray-500'}`}
                />


            </View>

            <View className="flex-row gap-5 py-5 justify-center">
                <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                    <ArrowLeftIcon size={40} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={validateScreen} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                    <ArrowRightIcon size={40} color="black" />
                </TouchableOpacity>
            </View>
        </ScrollView>

    </View>
    );
}

// Screen to add images
const imageScreen = ({
  form,
  setForm,
  onNextPress,
  onBackPress,
  pickMedia,
  removeAllMedia,
  removeSingleMedia,
  carouselRef,
  progress,
  onPressPagination,
  setSelectedImageIndex,
  setImageViewerVisible,
}) => {
  return (
    <View className="flex-1 items-center mt-4">
      <Image
        source={images.CameraImg}
        style={{ width: 100, height: 100 }}
        className="rounded-full"
        resizeMode="cover"
      />

      <Text className="text-gray-300 text-4xl p-5 font-dsbold">
        Add some images
      </Text>

      <Text className="text-gray-400 text-lg p-5 text-center">
        Add some images to showcase your business. You can add up to 5 images.
        Feel free to skip this step if you want.
      </Text>

      {/* Image picker functionality */}
      {form.media.length === 0 ? (
        <View className="mt-6 w-[80%]">
          <View className="rounded-xl p-6 border border-dashed border-gray-700 bg-gray-800">
            <TouchableOpacity
              onPress={pickMedia}
              className="justify-center items-center"
            >
              <View className="p-3 rounded-full mb-3 bg-blue-500">
                <PhotoIcon size={30} color="white" />
              </View>
              <Text className="font-medium text-gray-300 text-center">
                Add your photos
              </Text>
              <Text className="text-gray-500 text-xs text-center mt-1">
                Tap to upload
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-1 items-center my-5">
          <Carousel
            data={form.media.map((media) => media.uri)}
            loop={true}
            ref={carouselRef}
            width={250}
            height={250}
            scrollAnimationDuration={100}
            style={{ alignItems: "center", justifyContent: "center" }}
            onProgressChange={progress}
            onConfigurePanGesture={(panGesture) => {
              panGesture.activeOffsetX([-5, 5]);
              panGesture.failOffsetY([-5, 5]);
            }}
            renderItem={({ item, index }) => (
              <View className="items-center">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedImageIndex(index);
                    setImageViewerVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: item }}
                    style={{ width: 250, height: 250, borderRadius: 15 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => removeSingleMedia(index)}
                  className="absolute top-2 right-2"
                >
                  <TrashIcon size={30} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />

          <Pagination.Basic
            progress={progress}
            data={form.media.map((media) => media.uri)}
            onPress={onPressPagination}
            size={5}
            dotStyle={{ backgroundColor: "gray", borderRadius: 100 }}
            activeDotStyle={{
              backgroundColor: "white",
              overflow: "hidden",
              aspectRatio: 1,
              borderRadius: 15,
            }}
            containerStyle={{ gap: 5, marginTop: 20 }}
            horizontal
          />

          <View className="flex-row gap-x-4 mt-5">
            <TouchableOpacity onPress={pickMedia}>
              <Text className="text-blue-500 font-semibold">Add More</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={removeAllMedia}>
              <Text className="text-red-600 font-medium">Remove all</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="flex-row gap-x-10 py-5">
        <TouchableOpacity
          onPress={onBackPress}
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

const pricingScreen = ({focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress, specialPrices, setSpecialPrices, calendarVisible, setCalendarVisible, currentEditingIndex, setCurrentEditingIndex}) =>
{
    const pricingModels = ['fixed', 'perHour', 'perDay', 'perPerson'];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    


    const addSpecialPrice = () => setSpecialPrices([...specialPrices, { 
        name: '', 
        price: 0, 
        conditions: { 
            daysOfWeek: [], 
            specificDates: [], 
            minPeople: 0 
        } 
    }]);
    
    const removeSpecialPrice = (index) => setSpecialPrices(specialPrices.filter((_, i) => i !== index));

    const updateSpecialPrice = (index, field, value) => {
        const updatedPrices = [...specialPrices];
        
        if (field.includes('.')) 
        {
            // Handle nested fields like 'conditions.minPeople'
            const [parent, child] = field.split('.');
            updatedPrices[index][parent][child] = value;
        } 
        else updatedPrices[index][field] = value;
        
        setSpecialPrices(updatedPrices);
    };

    const toggleDayOfWeek = (index, day) => {
        const updatedPrices = [...specialPrices];
        const currentDays = updatedPrices[index].conditions.daysOfWeek;
        
        if (currentDays.includes(day)) updatedPrices[index].conditions.daysOfWeek = currentDays.filter(d => d !== day);
        else updatedPrices[index].conditions.daysOfWeek = [...currentDays, day];
        
        setSpecialPrices(updatedPrices);
    };

    const addSpecificDate = (index, date) => 
    {
        // Format date to YYYY-MM-DD
        const formattedDate = date instanceof Date 
            ? date.toISOString().split('T')[0] 
            : date;
            
        const updatedPrices = [...specialPrices];
        if (!updatedPrices[index].conditions.specificDates.includes(formattedDate))
        {
            updatedPrices[index].conditions.specificDates = [...updatedPrices[index].conditions.specificDates, formattedDate];
            setSpecialPrices(updatedPrices);
        }
    };

    const removeSpecificDate = (priceIndex, dateIndex) => 
    {
        const updatedPrices = [...specialPrices];
        updatedPrices[priceIndex].conditions.specificDates = updatedPrices[priceIndex].conditions.specificDates
            .filter((_, i) => i !== dateIndex);
        setSpecialPrices(updatedPrices);
    };

    // Calendar handlers
    const openCalendar = (index) => 
    {
        setCurrentEditingIndex(index);
        setCalendarVisible(true);
    };

    const handleDateSelect = (date) => 
    {
        if (currentEditingIndex !== null) addSpecificDate(currentEditingIndex, date);
    };

    const validateScreen = () =>
    {
        //validate and check every field
        // special prices array should not have default values
        // special prices array should not have empty values
        // special prices array should not have negative values
        // empty special prices is allowed

        if (!form.pricing.pricingModel || !form.pricing.basePrice)
        {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill out all required fields',
                position: 'bottom',
            });
            return
        }

        if (form.pricing.basePrice < 0)
        {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Base price cannot be negative',
                position: 'bottom',
            });
            return
        }

        if (form.pricing.specialPrices.length > 0)
        {
            for (let i = 0; i < form.pricing.specialPrices.length; i++)
            {
                if (form.pricing.specialPrices[i].price < 0)
                {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Special price cannot be negative',
                        position: 'bottom',
                    });
                    return
                }

                if (form.pricing.specialPrices[i].conditions.minPeople < 0)
                {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Minimum people cannot be negative',
                        position: 'bottom',
                    });
                    return
                }

                if (form.pricing.specialPrices[i].name === '' || form.pricing.specialPrices[i].price === 0)
                {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Special price cannot have default values. Change or remove them',
                        position: 'bottom',
                    });
                    return

                }

                //either speicfic dates or days of week should be selected
                if (form.pricing.specialPrices[i].conditions.specificDates.length === 0 && form.pricing.specialPrices[i].conditions.daysOfWeek.length === 0)
                {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Special price should have either specific dates or days of week selected',
                        position: 'bottom',
                    });
                    return
                }
            }
        }

        onNextPress();
    }

    return (
        <View className="flex-1">
            <TouchableOpacity onPress={() => router.replace('/settings')} className="p-3">
                <XMarkIcon size={30} color="white" />
            </TouchableOpacity>


            <ScrollView className="p-2 mx-2" showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-center items-center">
                <Image source={images.ServicePricingImg} style={{ width: 200, height: 200 }} className="rounded-full" resizeMode='cover' />
                </View>
                <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Set Your Pricing</Text>

                <View className="p-2">
                    <Dropdown
                        data={pricingModels}
                        value={form.pricing.pricingModel}
                        selectedTextStyle={{ color: 'white' }}
                        placeholder={form.pricing.pricingModel === '' ? 'Select a pricing model' : form.pricing.pricingModel}
                        placeholderStyle={{ color: 'gray', fontSize: 18 }}
                        onChange={(item) => setForm({ ...form, pricing: { ...form.pricing, pricingModel: item } })}
                        maxHeight={250}
                        onFocus={() => setFocusedInput('pricingModel')}
                        onBlur={() => setFocusedInput(null)}
                        style={{ width: '90%', height: 50, borderBottomWidth: 2, borderRadius: 12, padding: 12, borderColor: focusedInput === 'pricingModel' ? '#9333ea' : '#6b7280' }}
                        containerStyle={{ backgroundColor: '#070f1b', borderRadius: 8 }}
                        renderItem={(item) => (
                            <View className="p-3">
                                <Text className="text-lg text-white">{item}</Text>
                            </View>
                        )}
                    />

                    <TextInput
                        value={form.pricing.basePrice}
                        onChangeText={(text) => setForm({ ...form, pricing: { ...form.pricing, basePrice: text } })}
                        placeholder="Base Price"
                        placeholderTextColor="gray"
                        keyboardType="numeric"
                        onFocus={() => setFocusedInput('basePrice')}
                        onBlur={() => setFocusedInput(null)}
                        className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mt-5 ${focusedInput === 'basePrice' ? 'border-purple-600' : 'border-gray-500'}`}
                    />

                    {/* Special prices section */}
                    <View className="mt-8">
                        <Text className="text-white text-2xl font-dsbold mb-4 mx-auto">Special Pricing</Text>
                        
                        {specialPrices.map((specialPrice, index) => (
                            <View key={index} className="bg-gray-800 rounded-xl p-4 mb-6">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="text-white text-lg font-dsbold">Special Price {index + 1}</Text>
                                    
                                    {specialPrices.length >= 1 && (
                                        <TouchableOpacity 
                                            onPress={() => removeSpecialPrice(index)} 
                                            className="bg-red-500 px-3 py-1 rounded-lg"
                                        >
                                            <Text className="text-white">Remove</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                
                                <TextInput
                                    value={specialPrice.name}
                                    onChangeText={(text) => updateSpecialPrice(index, 'name', text)}
                                    placeholder="Name (e.g. Weekend Rate)"
                                    placeholderTextColor="gray"
                                    onFocus={() => setFocusedInput(`specialName_${index}`)}
                                    onBlur={() => setFocusedInput(null)}
                                    className={`text-white text-lg w-full border-b-2 p-3 rounded-xl mb-4 ${focusedInput === `specialName_${index}` ? 'border-purple-600' : 'border-gray-500'}`}
                                />
                                
                                <TextInput
                                    value={specialPrice.price}
                                    onChangeText={(text) => updateSpecialPrice(index, 'price', text)}
                                    placeholder="Price"
                                    placeholderTextColor="gray"
                                    keyboardType="numeric"
                                    onFocus={() => setFocusedInput(`specialPrice_${index}`)}
                                    onBlur={() => setFocusedInput(null)}
                                    className={`text-white text-lg w-full border-b-2 p-3 rounded-xl mb-6 ${focusedInput === `specialPrice_${index}` ? 'border-purple-600' : 'border-gray-500'}`}
                                />
                                
                                <Text className="text-white text-lg font-dsbold mb-3">Conditions</Text>
                                
                                {/* Days of Week */}
                                <Text className="text-gray-300 mb-2">Days of Week</Text>
                                <View className="flex-row flex-wrap mb-4">
                                    {daysOfWeek.map((day) => (
                                        <TouchableOpacity
                                            key={day}
                                            onPress={() => toggleDayOfWeek(index, day)}
                                            className={`m-1 px-3 py-1 rounded-lg ${specialPrice.conditions.daysOfWeek.includes(day) ? 'bg-purple-600' : 'bg-gray-600'}`}
                                        >
                                            <Text className="text-white">{day.substring(0, 3)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                
                                {/* Minimum People */}
                                <Text className="text-gray-300 mb-2">Minimum People</Text>
                                <TextInput
                                    value={specialPrice.conditions.minPeople}
                                    onChangeText={(text) => updateSpecialPrice(index, 'conditions.minPeople', text)}
                                    placeholder="Minimum people"
                                    placeholderTextColor="gray"
                                    keyboardType="numeric"
                                    onFocus={() => setFocusedInput(`minPeople_${index}`)}
                                    onBlur={() => setFocusedInput(null)}
                                    className={`text-white text-lg w-full border-b-2 p-3 rounded-xl mb-4 ${focusedInput === `minPeople_${index}` ? 'border-purple-600' : 'border-gray-500'}`}
                                />
                                
                                {/* Specific Dates */}
                                <Text className="text-gray-300 mb-2">Specific Dates</Text>
                                <View className="mb-2">
                                    {specialPrice.conditions.specificDates.map((date, dateIndex) => (
                                        <View key={dateIndex} className="flex-row items-center mb-2">
                                            <Text className="text-white flex-1">{date}</Text>
                                            <TouchableOpacity 
                                                onPress={() => removeSpecificDate(index, dateIndex)}
                                                className="bg-red-500 px-2 py-1 rounded-lg"
                                            >
                                                <Text className="text-white">Remove</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                                
                                {/* Date picker would go here */}
                                <TouchableOpacity 
                                    onPress={() => openCalendar(index)}
                                    className="bg-purple-600 p-3 rounded-xl flex-row justify-center items-center mb-2"
                                >
                                    <Text className="text-white font-semibold">Add Date</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        
                        <TouchableOpacity 
                            onPress={addSpecialPrice} 
                            className="bg-purple-600 p-3 rounded-xl flex-row justify-center items-center"
                        >
                            <Text className="text-white text-lg font-dsbold">Add Special Price</Text>
                        </TouchableOpacity>
                    </View>
                    
                    
                </View>

                <View className="flex-row gap-5 py-5 justify-center">
                    <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowLeftIcon size={40} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={validateScreen} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowRightIcon size={40} color="black" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => console.log(form.pricing)} className="bg-purple-500  h-14 p-2 rounded-full mt-10">
                        <Text className="text-white text-lg font-dsbold">Debug</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <CalendarModal
                visible={calendarVisible}
                setVisible={setCalendarVisible}
                setDate={handleDateSelect}
            />
        </View>
    )
}

const paymentScreen = ({focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress}) =>
{
    const validateScreen = () =>
    {
        if (!form.paymentSettings.taxRate)
        {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Tax rate must be between 0 and 100',
                position: 'bottom',
            });
            return
        }

        if (form.paymentSettings.deposit.enabled && !form.paymentSettings.deposit.percentage)
        {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Deposit percentage must be between 0 and 100',
                position: 'bottom',
            });
            return
        }

        if (form.paymentSettings.chargeOnNoShow.enabled && !form.paymentSettings.chargeOnNoShow.amount)
        {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Charge amount must be greater than 0',
                position: 'bottom',
            });
            return
        }

        onNextPress();
    }

    return (
        <View className="flex-1">
            <TouchableOpacity onPress={() => router.replace('/settings')} className="p-3">
                <XMarkIcon size={30} color="white" />
            </TouchableOpacity>
            
            
            <ScrollView className="p-2 mx-2" showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-center items-center">
                <Image source={images.PaymentImg} style={{ width: 200, height: 200 }} className="rounded-full" resizeMode='cover' />
                </View>
                <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Payment Settings</Text>
    
                <View className="p-2">

                    <View className="mt-5">
                        {/* <Text className={`${focusedInput === 'taxRate' ? 'text-purple-600' : 'text-gray-500'} text-lg`}>Tax Rate (%)</Text> */}
                        <TextInput
                            value={form.paymentSettings.taxRate}
                            onChangeText={(text) => setForm({ ...form, paymentSettings: { ...form.paymentSettings, taxRate: text } })}
                            placeholder="Tax Rate (%)"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            onFocus={() => setFocusedInput('taxRate')}
                            onBlur={() => setFocusedInput(null)}
                            className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-md ${focusedInput === 'taxRate' ? 'border-purple-600' : 'border-gray-500'}`}
                        />
                    </View>
                    
                    <View className="flex-row gap-5 items-center mt-5">
                        <Checkbox
                            value={form.paymentSettings.acceptOnlinePayment}
                            onValueChange={(value) => setForm({ ...form, paymentSettings: { ...form.paymentSettings, acceptOnlinePayment: value } })}
                            color="#9333ea"
                            style={{ width: 30, height: 30 }}
                        />
                        <Text className="text-white text-lg">Accept Online Payment</Text>
                    </View>
    
                    <View className="flex-row gap-5 items-center mt-5">
                        <Checkbox
                            value={form.paymentSettings.deposit.enabled}
                            onValueChange={(value) => setForm({ ...form, paymentSettings: { ...form.paymentSettings, deposit: { ...form.paymentSettings.deposit, enabled: value } } })}
                            color="#9333ea"
                            style={{ width: 30, height: 30 }}
                        />
                        <Text className="text-white text-lg">Require Deposit</Text>
                    </View>
    
                    {form.paymentSettings.deposit.enabled && (
                        <TextInput
                            value={form.paymentSettings.deposit.percentage}
                            onChangeText={(text) => setForm({ ...form, paymentSettings: { ...form.paymentSettings, deposit: { ...form.paymentSettings.deposit, percentage: text } } })}
                            placeholder="Percentage (%)"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            onFocus={() => setFocusedInput('depositPercentage')}
                            onBlur={() => setFocusedInput(null)}
                            className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mt-5 ${focusedInput === 'depositPercentage' ? 'border-purple-600' : 'border-gray-500'}`}
                        />
                    )}

                    <View className="flex-row gap-5 items-center mt-5">
                        <Checkbox
                            value={form.paymentSettings.chargeOnNoShow.enabled}
                            onValueChange={(value) => setForm({ ...form, paymentSettings: { ...form.paymentSettings, chargeOnNoShow: { ...form.paymentSettings.chargeOnNoShow, enabled: value } } })}
                            color="#9333ea"
                            style={{ width: 30, height: 30 }}
                        />
                        <Text className="text-white text-lg">Charge on No Show</Text>
                    </View>

                    {form.paymentSettings.chargeOnNoShow.enabled && (
                        <TextInput
                            value={form.paymentSettings.chargeOnNoShow.amount}
                            onChangeText={(text) => setForm({ ...form, paymentSettings: { ...form.paymentSettings, chargeOnNoShow: { ...form.paymentSettings.chargeOnNoShow, amount: text } } })}
                            placeholder="Charge Amount"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            onFocus={() => setFocusedInput('chargeAmount')}
                            onBlur={() => setFocusedInput(null)}
                            className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mt-5 ${focusedInput === 'chargeAmount' ? 'border-purple-600' : 'border-gray-500'}`}
                        />
                    )}
                </View>

                <View className="flex-row gap-5 py-5 justify-center">
                    <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowLeftIcon size={40} color="black" />
                    </TouchableOpacity>
    
                    <TouchableOpacity onPress={validateScreen} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowRightIcon size={40} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => console.log(form.paymentSettings)} className="bg-purple-500 h-14 p-2 rounded-full mt-10">
                        <Text className="text-white text-lg font-dsbold">Debug</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

const bookingScreen = ({focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress}) => 
{

    const validateScreen = () =>
    {
        if (!form.bookingSettings.minAdvanceBooking || !form.bookingSettings.maxAdvanceBooking || !form.bookingSettings.bookingTimeout)
        {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill out all required fields',
                position: 'bottom',
            });
            return
        }

        onNextPress();
    }

    return (
        <View className="flex-1">

            <TouchableOpacity onPress={() => router.replace('/settings')} className="p-3">
                <XMarkIcon size={30} color="white" />
            </TouchableOpacity>

            <ScrollView className="p-2">
                <View className="flex-row justify-center items-center">
                    <Image source={images.PaymentImg} style={{ width: 200, height: 200 }} className="rounded-full" resizeMode='cover' />
                </View>
                <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Booking Settings</Text>
                <Text className="text-gray-400 text-lg p-1 text-center">Set your booking settings to control how customers can book your service.</Text>
        

                <View className="p-2">
                    <View className="flex-row gap-5 items-center mt-1 mx-3">
                        <Checkbox
                            value={form.bookingSettings.requiresApproval}
                            onValueChange={(value) => setForm({ ...form, bookingSettings: { ...form.bookingSettings, requiresApproval: value } })}
                            color="#9333ea"
                            style={{ width: 30, height: 30 }}
                        />
                        <Text className="text-white text-lg">Booking Requires Approval</Text>
                        </View>
                    </View>


                    <View className="items-center">
                        <TextInput
                            value={form.bookingSettings.minAdvanceBooking}
                            onChangeText={(text) => setForm({ ...form, bookingSettings: { ...form.bookingSettings, minAdvanceBooking: text } })}
                            placeholder="Minimum Advance Booking (hours)"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            onFocus={() => setFocusedInput('minAdvanceBooking')}
                            onBlur={() => setFocusedInput(null)}
                            className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mt-5 ${focusedInput === 'minAdvanceBooking' ? 'border-purple-600' : 'border-gray-500'}`}
                        />

                        <TextInput
                            value={form.bookingSettings.maxAdvanceBooking}
                            onChangeText={(text) => setForm({ ...form, bookingSettings: { ...form.bookingSettings, maxAdvanceBooking: text } })}
                            placeholder="Maximum Advance Booking (days)"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            onFocus={() => setFocusedInput('maxAdvanceBooking')}
                            onBlur={() => setFocusedInput(null)}
                            className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mt-5 ${focusedInput === 'maxAdvanceBooking' ? 'border-purple-600' : 'border-gray-500'}`}
                        />

                        <TextInput
                            value={form.bookingSettings.bookingTimeout}
                            onChangeText={(text) => setForm({ ...form, bookingSettings: { ...form.bookingSettings, bookingTimeout: text } })}
                            placeholder="Booking Timeout (minutes)"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            onFocus={() => setFocusedInput('bookingTimeout')}
                            onBlur={() => setFocusedInput(null)}
                            className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mt-5 ${focusedInput === 'bookingTimeout' ? 'border-purple-600' : 'border-gray-500'}`}
                        />

                </View>

                <View className="flex-row gap-x-10 py-5 justify-center">
                    <TouchableOpacity onPress={ onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowLeftIcon size={40} color="black" />
                    </TouchableOpacity>
        
                    <TouchableOpacity onPress={validateScreen} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowRightIcon size={40} color="black" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        
        </View>
    )
}

const cancellationScreen = ({focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress}) =>
{
    const validateScreen = () =>
    {
        if (form.cancellationPolicy.allowCancellation && (!form.cancellationPolicy.freeCancellationHours || !form.cancellationPolicy.cancellationFee))
        {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill out all required fields',
                position: 'bottom',
            });
            return
        }

        onNextPress();
    }

    return (
        <View className="flex-1">
            <TouchableOpacity onPress={() => router.replace('/settings')} className="p-3">
                <XMarkIcon size={30} color="white" />
            </TouchableOpacity>
            
            
            <ScrollView className="p-2">
                <View className="flex-row justify-center items-center">
                    <Image source={images.CancelImg} style={{ width: 200, height: 200 }} className="rounded-full" resizeMode='cover' />
                </View>
                <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Cancellation Policy</Text>
                <Text className="text-gray-400 text-lg p-1 text-center">Set your cancellation policy to control how customers can cancel their booking.</Text>
        
                <View className="items-center">
                    <View className="flex-row gap-4 items-center mt-1">
                        <Checkbox
                            value={form.cancellationPolicy.allowCancellation}
                            onValueChange={(value) => setForm({ ...form, cancellationPolicy: { ...form.cancellationPolicy, allowCancellation: value } })}
                            color="#9333ea"
                            style={{ width: 30, height: 30 }}
                        />
                        <Text className="text-white text-lg">Allow Cancellation</Text>
                    </View>
                </View>
        
                {form.cancellationPolicy.allowCancellation && (
                    <View className="items-center">
                        <TextInput
                            value={form.cancellationPolicy.freeCancellationHours}
                            onChangeText={(text) => setForm({ ...form, cancellationPolicy: { ...form.cancellationPolicy, freeCancellationHours: text } })}
                            placeholder="Free Cancellation Hours"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            onFocus={() => setFocusedInput('freeCancellationHours')}
                            onBlur={() => setFocusedInput(null)}
                            className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mt-5 ${focusedInput === 'freeCancellationHours' ? 'border-purple-600' : 'border-gray-500'}`}
                        />
            
                        <TextInput
                            value={form.cancellationPolicy.cancellationFee}
                            onChangeText={(text) => setForm({ ...form, cancellationPolicy: { ...form.cancellationPolicy, cancellationFee: text } })}
                            placeholder="Cancellation Fee"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            onFocus={() => setFocusedInput('cancellationFee')}
                            onBlur={() => setFocusedInput(null)}
                            className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mt-5 ${focusedInput === 'cancellationFee' ? 'border-purple-600' : 'border-gray-500'}`}
                        />
                    </View>
                )}

                <View className="flex-row gap-x-10 py-5 justify-center">
                    <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowLeftIcon size={40} color="black" />
                    </TouchableOpacity>
        
                    <TouchableOpacity onPress={validateScreen} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowRightIcon size={40} color="black" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

        </View>
    )
}

const availabilityScreen = ({focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress, currentEditingIndex, setCurrentEditingIndex, calendarVisible, setCalendarVisible, editMode, setEditMode}) =>
{
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    //Simialr to pricing mechanism
    //Show checkbox for recurring
    //if recurring remove button to add date. replace with button to add days of week (both in similar format to special prices)
    //if not recurring show button to add dates

    // Add a new date to the availability
    const addDate = () => 
    {
        const newDates = [...form.availability.dates, {
            date: '',
            totalCapacity: 0,
            bookingsMade: 0,
        }];
        setForm({...form, availability: {...form.availability, dates: newDates}});
    };

    // Remove a date from availability
    const removeDate = (index) => 
    {
        const updatedDates = form.availability.dates.filter((_, i) => i !== index);
        setForm({...form, availability: {...form.availability, dates: updatedDates}});
    };

    // Update date properties
    const updateDate = (index, field, value) => 
    {
        const updatedDates = [...form.availability.dates];
        updatedDates[index][field] = value;
        setForm({...form, availability: {...form.availability, dates: updatedDates}});
    };

    // Add a new day of week for recurring availability
    const addDayOfWeek = () => 
    {
        const newDays = [...form.availability.daysOfWeek, {
            day: '',
            totalCapacity: 0,
            bookingsMade: 0,
        }];
        setForm({...form, availability: {...form.availability, daysOfWeek: newDays}});
    };

    // Remove a day of week
    const removeDayOfWeek = (index) => 
    {
        const updatedDays = form.availability.daysOfWeek.filter((_, i) => i !== index);
        setForm({...form, availability: {...form.availability, daysOfWeek: updatedDays}});
    };

    // Update day of week properties
    const updateDayOfWeek = (index, field, value) => 
    {
        const updatedDays = [...form.availability.daysOfWeek];
        updatedDays[index][field] = value;
        setForm({...form, availability: {...form.availability, daysOfWeek: updatedDays}});
    };

    // Toggle recurring option
    const toggleRecurring = () => 
    {
        setForm({...form, availability: {...form.availability, recurring: !form.availability.recurring}});
    };

    // Calendar handlers
    const openCalendar = (index) => 
    {
        setCurrentEditingIndex(index);
        setEditMode('date');
        setCalendarVisible(true);
    };

    const openRecurringCalendar = () => 
    {
        setCalendarVisible(true);
        setEditMode('recurring');
    };

    const handleDateSelect = (date) => 
    {
        // Format date to YYYY-MM-DD
        const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;

        if (editMode === 'date' && currentEditingIndex !== null) updateDate(currentEditingIndex, 'date', formattedDate);
        else if (editMode === 'recurring') setForm({...form, availability: {...form.availability, recurringStartDate: formattedDate}});
        
        setCalendarVisible(false);
    };

    const validateScreen = () =>
    {
        if (form.availability.recurring && !form.availability.recurringStartDate)
        {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select a start date for recurring availability',
                position: 'bottom',
            });
            return
        }

        if (form.availability.recurring)
        {
            if(form.availability.daysOfWeek.length === 0)
            {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please add at least one day of week for recurring availability',
                    position: 'bottom',
                });
                return
            }

            const validDays = form.availability.daysOfWeek.every(day => day.day !== '' && day.totalCapacity > 0);
            if (!validDays)
            {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please fill out all fields for recurring availability',
                    position: 'bottom',
                });
                return
            }
        }
        else
        {
            if(form.availability.dates.length === 0)
            {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please add at least one date for single date availability',
                    position: 'bottom',
                });
                return
            }

            const validDates = form.availability.dates.every(date => date.date !== '' && date.totalCapacity > 0);
            if (!validDates)
            {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please fill out all fields for single date availability',
                    position: 'bottom',
                });
                return
            }
        }


        onNextPress();
    }


    return (
        <View className="flex-1">
            <TouchableOpacity onPress={() => router.replace('/settings')} className="p-3">
                <XMarkIcon size={30} color="white" />
            </TouchableOpacity>

            <ScrollView className="p-2 mx-2" showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-center items-center">
                    <Image source={images.AvailablityImg} style={{ width: 200, height: 200 }} className="rounded-full" resizeMode='cover' />
                </View>
                <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Set Your Availability</Text>

                <View className="p-2">
                    {/* Recurring checkbox */}
                    <View className="flex-row items-center mb-6">
                        <TouchableOpacity 
                            onPress={toggleRecurring}
                            className={`w-6 h-6 mr-3 rounded ${form.availability.recurring ? 'bg-purple-600' : 'bg-gray-600'} flex items-center justify-center`}
                        >
                            {form.availability.recurring && <Text className="text-white text-lg">✓</Text>}
                        </TouchableOpacity>
                        <Text className="text-white text-lg">Recurring availability</Text>
                    </View>

                    {form.availability.recurring ? (
                        // Recurring availability section
                        <View>
                            <Text className="text-white text-xl font-dsbold mb-4">Recurring Schedule</Text>
                            
                            {/* Recurring start date picker */}
                            <View className="mb-6">
                                <Text className="text-gray-300 mb-2">Start Date</Text>
                                <TouchableOpacity 
                                    onPress={openRecurringCalendar}
                                    className={`flex-row justify-between items-center text-white text-lg w-full border-b-2 p-3 rounded-xl mb-2 ${focusedInput === 'recurringStartDate' ? 'border-purple-600' : 'border-gray-500'}`}
                                    onFocus={() => setFocusedInput('recurringStartDate')}
                                    onBlur={() => setFocusedInput(null)}
                                >
                                    <Text className="text-white text-lg">
                                        {form.availability.recurringStartDate || 'Select start date'}
                                    </Text>
                                    <CalendarIcon size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Days of Week */}
                            <Text className="text-white text-lg font-dsbold mb-3">Available Days</Text>

                            {form.availability.daysOfWeek.map((dayItem, index) => (
                                <View key={index} className="bg-gray-800 rounded-xl p-4 mb-6">
                                    <View className="flex-row justify-between items-center mb-3">
                                        <Text className="text-white text-lg font-dsbold">Day {index + 1}</Text>
                                        
                                        <TouchableOpacity 
                                            onPress={() => removeDayOfWeek(index)} 
                                            className="bg-red-500 px-3 py-1 rounded-lg"
                                        >
                                            <Text className="text-white">Remove</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Day selection dropdown */}
                                    <Dropdown
                                        data={daysOfWeek}
                                        value={dayItem.day}
                                        selectedTextStyle={{ color: 'white' }}
                                        placeholder={dayItem.day === '' ? 'Select day of week' : dayItem.day}
                                        placeholderStyle={{ color: 'gray', fontSize: 18 }}
                                        onChange={(item) => updateDayOfWeek(index, 'day', item)}
                                        maxHeight={250}
                                        onFocus={() => setFocusedInput(`day_${index}`)}
                                        onBlur={() => setFocusedInput(null)}
                                        style={{ width: '100%', height: 50, borderBottomWidth: 2, borderRadius: 12, padding: 12, borderColor: focusedInput === `day_${index}` ? '#9333ea' : '#6b7280' }}
                                        containerStyle={{ backgroundColor: '#070f1b', borderRadius: 8 }}
                                        renderItem={(item) => (
                                            <View className="p-3">
                                                <Text className="text-lg text-white">{item}</Text>
                                            </View>
                                        )}
                                    />

                                    {/* Capacity input */}
                                    <TextInput
                                        value={dayItem.totalCapacity}
                                        onChangeText={(text) => updateDayOfWeek(index, 'totalCapacity', text)}
                                        placeholder="Total capacity"
                                        placeholderTextColor="gray"
                                        keyboardType="numeric"
                                        onFocus={() => setFocusedInput(`dayCapacity_${index}`)}
                                        onBlur={() => setFocusedInput(null)}
                                        className={`text-white text-lg w-full border-b-2 p-3 rounded-xl mt-4 ${focusedInput === `dayCapacity_${index}` ? 'border-purple-600' : 'border-gray-500'}`}
                                    />
                                </View>
                            ))}

                            <TouchableOpacity 
                                onPress={addDayOfWeek} 
                                className="bg-purple-600 p-3 rounded-xl flex-row justify-center items-center"
                            >
                                <Text className="text-white text-lg font-dsbold">Add Day</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Single date availability section
                        <View>
                            <Text className="text-white text-xl font-dsbold mb-4">Available Dates</Text>

                            {form.availability.dates.map((dateItem, index) => (
                                <View key={index} className="bg-gray-800 rounded-xl p-4 mb-6">
                                    <View className="flex-row justify-between items-center mb-3">
                                        <Text className="text-white text-lg font-dsbold">Date {index + 1}</Text>
                                        
                                        <TouchableOpacity 
                                            onPress={() => removeDate(index)} 
                                            className="bg-red-500 px-3 py-1 rounded-lg"
                                        >
                                            <Text className="text-white">Remove</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Date picker */}
                                    <TouchableOpacity 
                                        onPress={() => openCalendar(index)}
                                        className={`flex-row justify-between items-center text-white text-lg w-full border-b-2 p-3 rounded-xl mb-4 ${focusedInput === `date_${index}` ? 'border-purple-600' : 'border-gray-500'}`}
                                        onFocus={() => setFocusedInput(`date_${index}`)}
                                        onBlur={() => setFocusedInput(null)}
                                    >
                                        <Text className="text-white text-lg">
                                            {dateItem.date || 'Select date'}
                                        </Text>
                                        <CalendarIcon size={24} color="white" />
                                    </TouchableOpacity>

                                    {/* Capacity input */}
                                    <TextInput
                                        value={dateItem.totalCapacity}
                                        onChangeText={(text) => updateDate(index, 'totalCapacity', text)}
                                        placeholder="Total capacity"
                                        placeholderTextColor="gray"
                                        keyboardType="numeric"
                                        onFocus={() => setFocusedInput(`capacity_${index}`)}
                                        onBlur={() => setFocusedInput(null)}
                                        className={`text-white text-lg w-full border-b-2 p-3 rounded-xl mb-2 ${focusedInput === `capacity_${index}` ? 'border-purple-600' : 'border-gray-500'}`}
                                    />
                                </View>
                            ))}

                            <TouchableOpacity 
                                onPress={addDate} 
                                className="bg-purple-600 p-3 rounded-xl flex-row justify-center items-center"
                            >
                                <Text className="text-white text-lg font-dsbold">Add Date</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View className="flex-row gap-5 py-5 justify-center">
                    <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowLeftIcon size={40} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={validateScreen} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowRightIcon size={40} color="black" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => console.log(form.availability)} className="bg-purple-500 h-14 p-2 rounded-full mt-10">
                        <Text className="text-white text-lg font-dsbold">Debug</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <CalendarModal
                visible={calendarVisible}
                setVisible={setCalendarVisible}
                setDate={handleDateSelect}
            />
        </View>
    );
}

const customDetailsScreen = ({focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress, customDetails, setCustomDetails}) =>
{
    // key value paurs the user can add

    const addCustomDetail = () => 
    {
        const updatedDetails = { ...customDetails };
        const newKey = `temp_${Object.keys(updatedDetails).length}`;
        updatedDetails[newKey] = '';
        
        setCustomDetails(updatedDetails);
    };

    // Remove a custom detail by key
    const removeCustomDetail = (keyToRemove) => 
    {
        const updatedDetails = { ...customDetails };
        delete updatedDetails[keyToRemove];
        
        setCustomDetails(updatedDetails);
    };

    // Update a custom detail key or value
    const updateCustomDetail = (oldKey, field, value) => 
    {
        // Use a local copy first to avoid state updates on every keystroke
        let updatedDetails = { ...customDetails };
        
        if (field === 'key')
        {
            // Store the new key temporarily without modifying the object structure
            // This prevents keyboard closing on each keystroke
            const currentValue = updatedDetails[oldKey];
            updatedDetails[`temp_new_${oldKey}`] = value; // Store the new key name temporarily
            updatedDetails[oldKey] = currentValue; // Keep the old key-value pair intact during typing
        } 
        else if (field === 'value')
        {
            // Just update the value directly
            updatedDetails[oldKey] = value;
        }
        
        setCustomDetails(updatedDetails);
    };

    // Handle key change completion (when user finishes typing)
    const handleKeyChangeComplete = (oldKey) => 
    {
        const updatedDetails = { ...customDetails };
        const newKeyName = updatedDetails[`temp_new_${oldKey}`];
        
        // Only process if we have a temporary key value stored
        if (newKeyName && newKeyName.trim() !== '') 
        {
            const currentValue = updatedDetails[oldKey];
            delete updatedDetails[oldKey];
            delete updatedDetails[`temp_new_${oldKey}`];
            updatedDetails[newKeyName] = currentValue;
            setCustomDetails(updatedDetails);
        }
    };

    // Display the right key in the input (the temporary one if available)
    const getDisplayKeyValue = (key) => 
    {
        if (customDetails[`temp_new_${key}`]) 
        {
            return customDetails[`temp_new_${key}`];
        }
        return key.startsWith('temp_') ? '' : key;
    };

    return (
        <View className="flex-1">
            <TouchableOpacity onPress={() => router.replace('/settings')} className="p-3">
                <XMarkIcon size={30} color="white" />
            </TouchableOpacity>
            
            <ScrollView className="p-2 mx-2" showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-center items-center">
                    <Image source={images.CustomDetailsImg} style={{ width: 200, height: 200 }} className="rounded-full" resizeMode='cover' />
                </View>
                <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Custom Details</Text>
                <Text className="text-gray-400 text-lg p-1 text-center">Add custom details to your service to provide more information to customers.</Text>
        
                <View className="p-2">
                    {Object.entries(customDetails)
                        .filter(([key]) => !key.startsWith('temp_new_')) // Filter out temporary keys
                        .map(([key, value], index) => (
                        <View key={key} className="bg-gray-800 rounded-xl p-4 mb-6">
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-white text-lg font-dsbold">Detail {index + 1}</Text>

                                <TouchableOpacity 
                                    onPress={() => removeCustomDetail(key)} 
                                    className="bg-red-500 px-3 py-1 rounded-lg"
                                >
                                    <Text className="text-white">Remove</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="mb-4">
                                <Text className="text-white text-base mb-1">Key:</Text>
                                <TextInput
                                    value={getDisplayKeyValue(key)}
                                    onChangeText={(text) => updateCustomDetail(key, 'key', text)}
                                    placeholder="Enter key name"
                                    placeholderTextColor="gray"
                                    onFocus={() => setFocusedInput(`key_${index}`)}
                                    onBlur={() => {
                                        setFocusedInput(null);
                                        handleKeyChangeComplete(key);
                                    }}
                                    className={`text-white text-lg w-full border-b-2 p-3 rounded-xl ${focusedInput === `key_${index}` ? 'border-purple-600' : 'border-gray-500'}`}
                                />
                            </View>

                            <View>
                                <Text className="text-white text-base mb-1">Value:</Text>
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => updateCustomDetail(key, 'value', text)}
                                    placeholder="Enter value"
                                    placeholderTextColor="gray"
                                    onFocus={() => setFocusedInput(`value_${index}`)}
                                    onBlur={() => setFocusedInput(null)}
                                    className={`text-white text-lg w-full border-b-2 p-3 rounded-xl ${focusedInput === `value_${index}` ? 'border-purple-600' : 'border-gray-500'}`}
                                />
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={addCustomDetail}
                        className="bg-purple-600 p-3 rounded-xl flex-row justify-center items-center"
                    >
                        <Text className="text-white text-lg font-dsbold">Add Detail</Text>
                    </TouchableOpacity>

                    <View className="flex-row gap-5 py-5 justify-center">
                        <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                            <ArrowLeftIcon size={40} color="black" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onNextPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                            <ArrowRightIcon size={40} color="black" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => console.log(form.customDetails)} className="bg-purple-500 h-14 p-2 rounded-full mt-10">
                            <Text className="text-white text-lg font-dsbold">Debug</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>      
        </View>
    );
}

const reviewScreen = ({form, onNextPress, onBackPress, createService, printForm}) =>
{
    return (
        <View className="flex-1 items-center justify-center">

            <ScrollView className="p-2 w-[90%] mx-auto" contentContainerStyle={{ alignItems: 'center' }}>
                <Image source={images.ReviewImg} style={{ width: '95%', height: 250 }} className="rounded-full" resizeMode='cover' />

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Review and Submit</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">Please review the information you have provided and submit.</Text>

                <View className="p-2 w-full">
                    <View className="flex-row justify-between items-center w-full p-3 bg-gray-800 rounded-xl mb-4">
                        <Text className="text-white text-lg font-dsbold">Service Name</Text>
                        <Text className="text-white text-lg">{form.name}</Text>
                    </View>

                    <View className="space-y-4 w-full">
                        {/* Basic Info */}
                        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
                            <Text className="text-white text-xl font-dsbold mb-3">Basic Information</Text>
                            <View className="space-y-2">
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Name:</Text>
                                    <Text className="text-white">{form.name || 'Not specified'}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Category:</Text>
                                    <Text className="text-white">{form.category || 'Not specified'}</Text>
                                </View>
                                <View>
                                    <Text className="text-gray-400">Description:</Text>
                                    <Text className="text-white text-right">{form.description || 'Not specified'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Media */}
                        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
                            <Text className="text-white text-xl font-dsbold mb-3">Media</Text>
                            <View className="flex-row flex-wrap">
                                {form.media && form.media.length > 0 ? 
                                    form.media.map((item, index) => (
                                        <View key={index} className="mr-2 mb-2">
                                            <Image source={{uri: item.uri}} style={{width: 80, height: 80}} className="rounded" />
                                        </View>
                                    ))
                                    : <Text className="text-white">No media added</Text>
                                }
                            </View>
                        </View>

                        {/* Pricing */}
                        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
                            <Text className="text-white text-xl font-dsbold mb-3">Pricing</Text>
                            <View className="space-y-2">
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Pricing Model:</Text>
                                    <Text className="text-white">{form.pricing.pricingModel || 'Not specified'}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Base Price:</Text>
                                    <Text className="text-white">${form.pricing.basePrice || '0'}</Text>
                                </View>
                                
                                {form.pricing.specialPrices && form.pricing.specialPrices.length > 0 && (
                                    <View>
                                        <Text className="text-white text-lg font-dsbold mt-3 mb-2">Special Prices</Text>
                                        {form.pricing.specialPrices.map((price, index) => (
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
                                                    <Text className="text-white">{price.conditions.daysOfWeek.join(', ') || 'None'}</Text>
                                                </View>
                                                <View className="flex-row justify-between">
                                                    <Text className="text-gray-400">Min People:</Text>
                                                    <Text className="text-white">{price.conditions.minPeople || '0'}</Text>
                                                </View>
                                                {price.conditions.specificDates && price.conditions.specificDates.length > 0 && (
                                                    <View>
                                                        <Text className="text-gray-400">Specific Dates:</Text>
                                                        <Text className="text-white">{price.conditions.specificDates.join(', ')}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Payment Settings */}
                        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
                            <Text className="text-white text-xl font-dsbold mb-3">Payment Settings</Text>
                            <View className="space-y-2">
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Accept Online Payment:</Text>
                                    <Text className="text-white">{form.paymentSettings.acceptOnlinePayment ? 'Yes' : 'No'}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Tax Rate:</Text>
                                    <Text className="text-white">{form.paymentSettings.taxRate}%</Text>
                                </View>
                                
                                <View>
                                    <Text className="text-white text-lg font-semibold mt-2">Deposit</Text>
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-400">Required:</Text>
                                        <Text className="text-white">{form.paymentSettings.deposit.enabled ? 'Yes' : 'No'}</Text>
                                    </View>
                                    {form.paymentSettings.deposit.enabled && (
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-400">Percentage:</Text>
                                            <Text className="text-white">{form.paymentSettings.deposit.percentage}%</Text>
                                        </View>
                                    )}
                                </View>
                                
                                <View>
                                    <Text className="text-white text-lg font-semibold mt-2">No-Show Charge</Text>
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-400">Enabled:</Text>
                                        <Text className="text-white">{form.paymentSettings.chargeOnNoShow.enabled ? 'Yes' : 'No'}</Text>
                                    </View>
                                    {form.paymentSettings.chargeOnNoShow.enabled && (
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-400">Amount:</Text>
                                            <Text className="text-white">${form.paymentSettings.chargeOnNoShow.amount}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                        
                        {/* Booking Settings */}
                        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
                            <Text className="text-white text-xl font-dsbold mb-3">Booking Settings</Text>
                            <View className="space-y-2">
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Requires Approval:</Text>
                                    <Text className="text-white">{form.bookingSettings.requiresApproval ? 'Yes' : 'No'}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Min Advance Booking:</Text>
                                    <Text className="text-white">{form.bookingSettings.minAdvanceBooking} hours</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Max Advance Booking:</Text>
                                    <Text className="text-white">{form.bookingSettings.maxAdvanceBooking} days</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Booking Timeout:</Text>
                                    <Text className="text-white">{form.bookingSettings.bookingTimeout} minutes</Text>
                                </View>
                            </View>
                        </View>
                        
                        {/* Cancellation Policy */}
                        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
                            <Text className="text-white text-xl font-dsbold mb-3">Cancellation Policy</Text>
                            <View className="space-y-2">
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Allow Cancellation:</Text>
                                    <Text className="text-white">{form.cancellationPolicy.allowCancellation ? 'Yes' : 'No'}</Text>
                                </View>
                                {form.cancellationPolicy.allowCancellation && (
                                    <>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-400">Free Cancellation Period:</Text>
                                            <Text className="text-white">{form.cancellationPolicy.freeCancellationHours} hours</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-400">Cancellation Fee:</Text>
                                            <Text className="text-white">${form.cancellationPolicy.cancellationFee}</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                        
                        {/* Availability */}
                        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
                            <Text className="text-white text-xl font-dsbold mb-3">Availability</Text>
                            <View className="space-y-2">
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400">Type:</Text>
                                    <Text className="text-white">{form.availability.recurring ? 'Recurring' : 'Specific Dates'}</Text>
                                </View>
                                
                                {form.availability.recurring ? (
                                    <>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-400">Start Date:</Text>
                                            <Text className="text-white">{form.availability.recurringStartDate}</Text>
                                        </View>
                                        <Text className="text-white text-lg font-semibold mt-2">Available Days:</Text>
                                        {form.availability.daysOfWeek.map((day, index) => (
                                            <View key={index} className="bg-gray-700 p-3 rounded mb-2">
                                                <View className="flex-row justify-between">
                                                    <Text className="text-gray-400">Day:</Text>
                                                    <Text className="text-white">{day.day}</Text>
                                                </View>
                                                <View className="flex-row justify-between">
                                                    <Text className="text-gray-400">Capacity:</Text>
                                                    <Text className="text-white">{day.totalCapacity}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-white text-lg font-semibold mt-2">Available Dates:</Text>
                                        {form.availability.dates.map((date, index) => (
                                            <View key={index} className="bg-gray-700 p-3 rounded mb-2">
                                                <View className="flex-row justify-between">
                                                    <Text className="text-gray-400">Date:</Text>
                                                    <Text className="text-white">{date.date}</Text>
                                                </View>
                                                <View className="flex-row justify-between">
                                                    <Text className="text-gray-400">Capacity:</Text>
                                                    <Text className="text-white">{date.totalCapacity}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </>
                                )}
                            </View>
                        </View>
                        
                        {/* Custom Details */}
                        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
                            <Text className="text-white text-xl font-dsbold mb-3">Custom Details</Text>
                            {Object.keys(form.customDetails).length > 0 ? (
                                Object.entries(form.customDetails).map(([key, value], index) => (
                                    <View key={index} className="flex-row justify-between mb-2">
                                        <Text className="text-gray-400">{key}:</Text>
                                        <Text className="text-white">{value}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-white">No custom details added</Text>
                            )}
                        </View>
                    </View>

                    <View className="flex-row gap-5 py-5 justify-center">
                        <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                            <ArrowLeftIcon size={40} color="black" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { onNextPress(); createService() }} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                            <ArrowRightIcon size={40} color="black" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={printForm} className="bg-purple-500  h-14 p-2 rounded-full mt-10">
                            <Text className="text-white text-lg font-dsbold">Debug</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const successScreen = ({uploading, error, businessId}) => {
    return (

        uploading ? (
            <View className="flex-1 items-center justify-center">
                <LottieView
                    source={require('../../assets/animations/Creating.json')}
                    autoPlay
                    loop={true}
                    style={{ width: 400, height: 400 }}
                />

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Adding your service...</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">Please wait while we create your service. This may take a few seconds.</Text>
            
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

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Error creating service</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">An error occurred while creating your service. Please try again later.</Text>
                <Text className="text-gray-400 text-lg p-5 text-center">Error: {error}</Text>

                <View className="flex-row gap-x-10 mb-3">
                    <TouchableOpacity onPress={() => router.replace('/settings')} className="bg-purple-500 p-3 rounded-full mt-10">
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

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Service Created!!</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">Congratulations! Your service has been successfully created. Now go and advertise it to the world!</Text>

                <View className="flex-row gap-x-10 py-5">

                    <TouchableOpacity onPress={() => router.replace(`/settings/service/manage/${businessId}`)} className="bg-purple-500 p-3 rounded-full mt-10">
                        <Text className="text-white text-lg">Complete</Text>
                    </TouchableOpacity>
                </View>
            
            </View>
        )
        

    );
};

export default ServiceCreateScreen;
