//On boarding styled business create screen
// by this we mean there will be a different screeens. 
// like one will be for name and category, then user presses next button and then it goes to the next screen where user enters the location and then the next screen where user enters the contact info

import { View, Text, FlatList, Platform, TouchableOpacity, Dimensions, TextInput, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../utils/axios';
import useUserStore from '../context/userStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import LocationsModal from '../components/LocationsModal';
import LottieView from "lottie-react-native";
import { MapIcon, ArrowLeftIcon, ArrowRightIcon, XMarkIcon, TrashIcon, ClockIcon, PlusIcon, MapPinIcon, PlusCircleIcon, PhotoIcon } from 'react-native-heroicons/solid';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import images from '../../assets/images/images';
import * as Location from 'expo-location';
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";

const { width } = Dimensions.get('window');

/*
  5 example longitudes and latitudes:
    122.4194, 37.7749 - San Francisco
    118.2437, 34.0522 - Los Angeles
    77.1025, 28.7041 - New Delhi
    151.2093, -33.8688 - Sydney
    0.1276, 51.5074 - London
 */

const testForm = {
    // ownerId: "672f358fb3e56fac046d76a5",
    name: 'Test Business',
    category: 'Restaurant',
    address: '123 Test Street',
    description: 'This is a test business',
    media: [],
    phone: '1234567890',
    email: 'testemail@gmail.com',
    website: 'testbusiness.com',
    location: { _id: '6781353badab4c338ff55148', name: 'Fairdy Meadows, Gilgit Baltistan' },
    longitude: '122.4194',
    latitude: '37.7749',
    operatingHours: {}
}

const BusinessCreateScreen = () => {

    const FormData = global.FormData;
    const user = useUserStore(state => state.user);
    const [focusedInput, setFocusedInput] = useState(null);
    const [visible, setVisible] = useState(false);
    const [region, setRegion] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);
    const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
    const [tempTimeRange, setTempTimeRange] = useState({ start: null, end: null });
    const mapRef = React.useRef(null);
    const [form, setForm] = useState({
        // ownerId: user._id,
        name: '',
        category: '',
        address: '',
        description: '',    
        media: [],
        phone: '',
        email: '',
        website: '',
        operatingHours: {
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: '',
        },
        location: null,
        longitude: '',
        latitude: '',
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    // Image picker and carousel related states and refs
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

    const createBusiness = async () =>
    {
        console.log("Creating business...");

        //test frontend
        // setUploading(true);
        // setTimeout(() => {
        //     setUploading(false);
        //     setError(true);
        // }, 2000);
        // return;

        // if any of the required fields are empty, return
        if(form.name === '' || form.category === '' || form.address === '' || form.location === null || form.longitude === '' || form.latitude === '' || form.phone === '' || form.email === '' || form.website === '')
        {
            console.log("Please fill in all required fields");
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: 'Please fill in all required fields',
                visibilityTime: 2000,
            });
            return;
        }

        setUploading(true);

        let formData = new FormData();

        formData.append('ownerId', user._id);
        formData.append('name', form.name);
        formData.append('category', form.category);
        formData.append('address', form.address);
        formData.append('description', form.description);
        formData.append('contactInfo', JSON.stringify({ phone: form.phone, email: form.email, website: form.website }));
        formData.append('operatingHours', JSON.stringify(form.operatingHours));
        formData.append('locationId', form.location?._id);
        formData.append('longitude', form.longitude);
        formData.append('latitude', form.latitude);
        
        form.media.forEach((media) =>
        {
            formData.append('media', {
                uri: Platform.OS === 'android' ? media.uri : media.uri.replace('file://', ''),
                type: media.mimeType,
                name: media.fileName
            })
        });


        axiosInstance.post('/business/create', formData, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            }   
        })
        .then((res) => {
            console.log(res.data);
            setUploading(false);

        })
        .catch((err) => {
            console.log(err.response.data.message);
            setUploading(false);
            setError(err.response.data.message);
        });

    };

    

    // Screen to add business name, location, category, description
    

    useEffect(() => {

        const setupMap = async () =>
        {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') 
            {
                setLocationError('Permission to access location was denied');
                return;
            }
        
            try 
            {
                let location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                
                const newRegion = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                
                setRegion(newRegion);
                setUserLocation(newRegion);
                
                // If form doesn't have coordinates yet, set initial coordinates
                if (!form.latitude && !form.longitude)
                {
                    setForm({
                        ...form,
                        latitude: location.coords.latitude.toString(),
                        longitude: location.coords.longitude.toString(),
                    });
                }

                setLocationLoading(false);
            } 
            catch (error) 
            {
                Toast.show({
                    type: 'error',
                    position: 'bottom',
                    text1: 'Error',
                    text2: 'Failed to get location',
                    visibilityTime: 2000,
                });
            }
        }

        setupMap();
    }, []);

    const flatListRef = React.useRef();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Handle Next button click
    const onNextPress = () => 
    {
        if (currentIndex < screens.length - 1) {
            setCurrentIndex(currentIndex + 1);
            // Move to next screen in FlatList
            flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
        }
    };

    // Handle Back button click
    const onBackPress = () => 
    {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            // Move to previous screen in FlatList
            flatListRef.current.scrollToIndex({ index: currentIndex - 1, animated: true });
        }
    };
    

    const screens = [
        {screen: startScreen, params: {onNextPress}},
        {screen: businessInfoScreen, params: {focusedInput, setFocusedInput, form, setForm, userLocation, setUserLocation, locationLoading, setLocationLoading, setRegion, region, mapRef, visible, setVisible, onNextPress, onBackPress}},
        {screen: contactScreen, params: {focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress}},
        {screen: imageScreen, params: {form, setForm, onNextPress, onBackPress, pickMedia, removeAllMedia, removeSingleMedia, carouselRef, progress, onPressPagination, setSelectedImageIndex, setImageViewerVisible, imageViewerVisible, selectedImageIndex}},
        {screen: operatingHoursScreen, params: {focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress, selectedDay, setSelectedDay, isStartTimePickerVisible, setStartTimePickerVisible, isEndTimePickerVisible, setEndTimePickerVisible, tempTimeRange, setTempTimeRange}},
        {screen: reviewScreen, params: {form, createBusiness, onNextPress, onBackPress, printForm, carouselRef, progress, onPressPagination, setSelectedImageIndex, setImageViewerVisible}},
        {screen: successScreen, params: {uploading, error}}
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
  )
}

// Screen to begin business creation
const startScreen = ({ onNextPress }) => {
    return (
        //move to screen center
        <View className="flex-1 items-center justify-center">
            <Image source={images.CreateBusinessImg} style={{ width: '95%', height: 250 }} className="rounded-full" resizeMode='cover' />

            <Text className="text-gray-300 text-4xl p-5 font-dsbold">Create Business</Text>

            <Text className="text-gray-400 text-lg p-5 text-center">Welcome to the business creation hub. Let's get started by adding some basic information about your business.</Text>

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

const businessInfoScreen = ({focusedInput, setFocusedInput, form, setForm, userLocation, setUserLocation, locationLoading, setLocationLoading, setRegion, region, mapRef, visible, setVisible, onNextPress, onBackPress}) => {

    const categories = ["","Restaurant", "Hotel", "Shopping", "Fitness", "Health", "Beauty", "Education", "Entertainment", "Services", "Other"]
     
    const handleMapPress = (event) => 
    {
        const { coordinate } = event.nativeEvent;
        
        // Update form with new coordinates
        setForm({
            ...form,
            latitude: coordinate.latitude.toString(),
            longitude: coordinate.longitude.toString(),
        });
    };
      
      // Center map on current location
    const centerOnUserLocation = async () => 
    {
        try 
        {   
            setRegion(userLocation);

            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        } 
        catch (error)
        {
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: 'Failed to get location',
                visibilityTime: 2000,
            })
        }
    };

    const validateScreen = () => 
    {
        if (form.name === '' || form.category === '' || form.address === '' || form.description === '' || form.location === null || form.longitude === '' || form.latitude === '') 
        {
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: 'Please fill in all required fields',
                visibilityTime: 2000,
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
            
            
            <ScrollView className="p-2 mx-auto">
                <Image source={images.Business2Img} style={{ width: 400, height: 250 }} resizeMode='contain' />
                <Text className="text-gray-300 text-3xl p-5 font-dsbold text-center">Business Information</Text>

                <View className="p-2">
                    <TextInput
                        value={form.name}
                        onChangeText={(text) => setForm({ ...form, name: text })}
                        placeholder="Business Name"
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
                        value={form.address}
                        onChangeText={(text) => setForm({ ...form, address: text })}
                        placeholder="Address"
                        placeholderTextColor="gray"
                        onFocus={() => setFocusedInput('address')}
                        onBlur={() => setFocusedInput(null)}
                        className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mt-5 ${focusedInput === 'address' ? 'border-purple-600' : 'border-gray-500'}`}
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

                    {form.location === null ? (
                        <TouchableOpacity 
                            className="flex-row items-center mt-5 p-4 bg-slate-800 rounded-xl border border-slate-700 w-[90%]" 
                            onPress={() => setVisible(true)}
                        >
                            <View className="bg-purple-600 bg-opacity-20 p-3 rounded-full">
                                <MapPinIcon size={24} color="#a78bfa" />
                            </View>
                            <Text className="text-gray-400 ml-3 text-lg font-medium">Add location</Text>
                            <View className="ml-auto">
                                <PlusCircleIcon size={24} color="#a78bfa" />
                            </View>
                        </TouchableOpacity>
                    )
                    :
                    (
                        <TouchableOpacity 
                            className="flex-row items-center justify-between mt-5 p-4 bg-slate-800 rounded-xl border border-slate-700 w-[90%]"
                            onPress={() => setVisible(true)}
                        >
                            <View className="flex-row items-center flex-1">
                            <View className="bg-purple-600 p-3 rounded-full">
                                <MapPinIcon size={24} color="white" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-400 text-sm">Location</Text>
                                <Text className="text-white text-lg font-medium">{form.location?.name}</Text>
                            </View>
                            </View>
                            
                            <TouchableOpacity 
                            onPress={() => setForm({ ...form, location: null })} 
                            className="ml-2 p-2 bg-red-500 bg-opacity-20 rounded-full"
                            >
                            <TrashIcon size={20} color="#f87171" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}

                    <View className="mt-5 ">
                    
                        <Text className="text-gray-300 text-lg">Location on Map</Text>

                        <TouchableOpacity className="flex-row bg-[#ff6b6b] w-[45%] h-10 items-center justify-center rounded-lg px-2 mt-2"onPress={centerOnUserLocation}>
                            <Text className="text-white font-bold">Center on My Location</Text>
                        </TouchableOpacity>

                        {
                            locationLoading ? (
                                <View className="flex-1 items-center justify-center mt-5">
                                    <ActivityIndicator size="large" color="#7c3aed" />
                                    <Text className="text-gray-300 text-lg mt-2">Loading map...</Text>
                                </View>
                            )
                            :
                            (
                                <MapView
                                    ref={mapRef}
                                    provider={PROVIDER_GOOGLE}
                                    initialRegion={region}
                                    region={region}
                                    style={{width: 350, height:300}}
                                    className="mt-4"
                                    onPress={handleMapPress}
                                >
                                    {form.latitude && form.longitude && (
                                        <Marker
                                            coordinate={{
                                                latitude: parseFloat(form.latitude),
                                                longitude: parseFloat(form.longitude)
                                            }}
                                            draggable
                                            onDragEnd={(e) => handleMapPress(e)}
                                        />
                                    )}
                                </MapView>
                            )
                        }
                        
                        <View className="flex-row space-x-5 px-2 mt-5">
                            <Text className="text-white text-lg">Lat: {form.latitude ? parseFloat(form.latitude).toFixed(6) : ''}
                            </Text>
                            <Text className="text-white text-lg">Long: {form.longitude ? parseFloat(form.longitude).toFixed(6) : ''}</Text>
                        </View>
                        
                        
                    </View>

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

            <LocationsModal visible={visible} setVisible={setVisible} setForm={setForm} />

        </View>
    );
};

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

// Screen to add contact info
const contactScreen = ({ focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress }) => {
    return (
        <View className="flex-1 mt-4">

            <ScrollView className="p-2 w-[90%] mx-auto" contentContainerStyle={{ alignItems: 'center' }}>

                <Image source={images.ContactImg} style={{ width: 200, height: 200 }} className="rounded-full" resizeMode='cover' />

                <Text className="text-gray-300 text-4xl p-5 font-dsbold text-center">Provide Contact Information</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">Add your contact information so that customers can reach out to you.</Text>
                
                <TextInput
                    value={form.phone}
                    onChangeText={(text) => setForm({ ...form, phone: text })}
                    placeholder="Phone Number"
                    placeholderTextColor="gray"
                    keyboardType="phone-pad"
                    onFocus={() => setFocusedInput('phone')}
                    onBlur={() => setFocusedInput(null)}
                    className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mb-5 ${focusedInput === 'phone' ? 'border-purple-600' : 'border-gray-500'}`}
                />

                <TextInput
                    value={form.email}
                    onChangeText={(text) => setForm({ ...form, email: text })}
                    placeholder="Email Address"
                    placeholderTextColor="gray"
                    keyboardType="email-address"
                    autoCapitalize='none'
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mb-5 ${focusedInput === 'email' ? 'border-purple-600' : 'border-gray-500'}`}
                />

                <TextInput
                    value={form.website}
                    onChangeText={(text) => setForm({ ...form, website: text })}
                    placeholder="Website"
                    placeholderTextColor="gray"
                    autoCapitalize='none'
                    onFocus={() => setFocusedInput('website')}
                    onBlur={() => setFocusedInput(null)}
                    className={`text-white text-lg w-[90%] border-b-2 p-3 rounded-xl mb-5 ${focusedInput === 'website' ? 'border-purple-600' : 'border-gray-500'}`}
                />

                <View className="flex-row gap-x-10">
                    <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowLeftIcon size={40} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onNextPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                        <ArrowRightIcon size={40} color="black" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

        </View>
    );
};


// Screen to add operating hours
const operatingHoursScreen = ({ focusedInput, setFocusedInput, form, setForm, onNextPress, onBackPress, selectedDay, setSelectedDay, isStartTimePickerVisible, setStartTimePickerVisible, isEndTimePickerVisible, setEndTimePickerVisible, tempTimeRange, setTempTimeRange }) => {

    const days = [
        { label: 'Monday', value: 'monday' },
        { label: 'Tuesday', value: 'tuesday' },
        { label: 'Wednesday', value: 'wednesday' },
        { label: 'Thursday', value: 'thursday' },
        { label: 'Friday', value: 'friday' },
        { label: 'Saturday', value: 'saturday' },
        { label: 'Sunday', value: 'sunday' }
    ];

    const formatTime = (date) => 
    {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleStartTimeConfirm = (time) => 
    {
        setTempTimeRange({ ...tempTimeRange, start: time });
        setStartTimePickerVisible(false);
    };

    const handleEndTimeConfirm = (time) =>
    {
        setTempTimeRange({ ...tempTimeRange, end: time });
        setEndTimePickerVisible(false);
    };

    const addTimeRange = () => 
    {
        if (!selectedDay) {
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: 'Please select a day',
                visibilityTime: 2000,
            });
            return;
        }

        if (!tempTimeRange.start || !tempTimeRange.end) 
        {
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: 'Please select both start and end times',
                visibilityTime: 2000,
            });
            return;
        }

        if (tempTimeRange.start >= tempTimeRange.end) 
        {
            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error',
                text2: 'Start time must be before end time',
                visibilityTime: 2000,
            });
            return;
        }

        const startTime = formatTime(tempTimeRange.start);
        const endTime = formatTime(tempTimeRange.end);
        const timeRangeText = `${startTime} - ${endTime}`;

        setForm({
            ...form,
            operatingHours: {
                ...form.operatingHours,
                [selectedDay]: timeRangeText
            }
        });

        // Reset temporary values
        setTempTimeRange({ start: null, end: null });
        // Alert.alert("Success", `Hours for ${selectedDay} set to ${timeRangeText}`);
    };

    const clearHours = (day) => 
    {
        setForm({
            ...form,
            operatingHours: {
                ...form.operatingHours,
                [day]: ''
            }
        });
    };

    return (
        <View className="flex-1 items-center justify-center bg-gray-900">
            <Text className="text-gray-300 text-4xl p-5 font-bold">Operating Hours</Text>

            <Text className="text-gray-400 text-lg p-5 text-center mb-2">
                Add your operating hours so that customers know when you are open.
                Leave fields empty if you are closed on that day.
            </Text>

            {/* Time Range Selector */}
            <View className="w-[90%] bg-gray-800 p-4 rounded-xl mb-6">
                <Text className="text-gray-300 text-lg mb-3">Set Hours for a Day</Text>
                
                <View className="mb-4">
                    <Dropdown
                        data={days}
                        labelField="label"
                        valueField="value"
                        placeholder="Select a day"
                        value={selectedDay}
                        onChange={item => setSelectedDay(item.value)}
                        className="bg-gray-700 p-3 rounded-lg text-white"
                        placeholderStyle={{ color: 'gray' }}
                        selectedTextStyle={{ color: 'white' }}
                        containerStyle={{ borderRadius: 8 }}
                        itemTextStyle={{ color: 'white' }}
                        activeColor="#7c3aed"
                        itemContainerStyle={{ backgroundColor: '#374151' }}
                    />
                </View>

                <View className="flex-row justify-between mb-4">
                    <TouchableOpacity 
                        onPress={() => setStartTimePickerVisible(true)} 
                        className="bg-gray-700 p-3 rounded-lg flex-row items-center w-[48%]"
                    >
                        <ClockIcon size={18} color="#9ca3af" />
                        <Text className="text-gray-300 ml-2">
                            {tempTimeRange.start ? formatTime(tempTimeRange.start) : "Start Time"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => setEndTimePickerVisible(true)} 
                        className="bg-gray-700 p-3 rounded-lg flex-row items-center w-[48%]"
                    >
                        <ClockIcon size={18} color="#9ca3af" />
                        <Text className="text-gray-300 ml-2">
                            {tempTimeRange.end ? formatTime(tempTimeRange.end) : "End Time"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    onPress={addTimeRange} 
                    className="bg-purple-600 p-3 rounded-lg flex-row justify-center items-center"
                >
                    <Text className="text-white">Set Hours</Text>
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={isStartTimePickerVisible}
                    mode="time"
                    onConfirm={handleStartTimeConfirm}
                    onCancel={() => setStartTimePickerVisible(false)}
                />

                <DateTimePickerModal
                    isVisible={isEndTimePickerVisible}
                    mode="time"
                    onConfirm={handleEndTimeConfirm}
                    onCancel={() => setEndTimePickerVisible(false)}
                />
            </View>

            {/* Schedule display */}
            <ScrollView className="p-2 w-[90%] bg-gray-800 rounded-xl mb-6" contentContainerStyle={{ paddingVertical: 10 }}>
                <Text className="text-gray-300 text-xl mb-4 text-center">Weekly Schedule</Text>
                
                {days.map((day) => (
                    <View key={day.value} className="mb-4 border-b border-gray-700 pb-3">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-gray-300 text-lg font-medium">{day.label}</Text>
                            <View className="flex-row items-center">
                                <Text className="text-gray-400 mr-2">
                                    {form.operatingHours[day.value] ? form.operatingHours[day.value] : "Closed"}
                                </Text>
                                {form.operatingHours[day.value] && (
                                    <TouchableOpacity onPress={() => clearHours(day.value)}>
                                        <Text className="text-red-500">Clear</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View className="flex-row gap-x-10 mb-10">
                <TouchableOpacity onPress={onBackPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-4 items-center justify-center">
                    <ArrowLeftIcon size={30} color="black" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onNextPress} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-4 items-center justify-center">
                    <ArrowRightIcon size={30} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Screen to review and submit
const reviewScreen = ({
  form,
  createBusiness,
  onNextPress,
  onBackPress,
  printForm,
  carouselRef,
  progress,
  onPressPagination,
  setSelectedImageIndex,
  setImageViewerVisible,
}) => {
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

        {/* Media preview */}
        {form.media.length > 0 && (
          <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
            <Text className="text-white text-xl font-dsbold mb-3">Media</Text>
            <View className="items-center">
              <Carousel
                data={form.media.map((media) => media.uri)}
                loop={true}
                ref={carouselRef}
                width={200}
                height={200}
                scrollAnimationDuration={100}
                style={{ alignItems: "center", justifyContent: "center" }}
                onProgressChange={progress}
                onConfigurePanGesture={(panGesture) => {
                  panGesture.activeOffsetX([-5, 5]);
                  panGesture.failOffsetY([-5, 5]);
                }}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImageIndex(index);
                      setImageViewerVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: item }}
                      style={{ width: 200, height: 200, borderRadius: 10 }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              />

              {form.media.length > 1 && (
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
                  containerStyle={{ gap: 5, marginTop: 10 }}
                  horizontal
                />
              )}
            </View>
          </View>
        )}

        {/* Genral info */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">
            General Information
          </Text>
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Name:</Text>
              <Text className="text-white">{form.name}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Category:</Text>
              <Text className="text-white">{form.category}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Address:</Text>
              <Text className="text-white">{form.address}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Description:</Text>
              <Text className="text-white">{form.description}</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">
            Contact Information
          </Text>
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Phone:</Text>
              <Text className="text-white">{form.phone}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Email:</Text>
              <Text className="text-white">{form.email}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Website:</Text>
              <Text className="text-white">{form.website}</Text>
            </View>
          </View>
        </View>

        {/* Operating hours */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">
            Operating Hours
          </Text>
          <View className="space-y-2">
            {Object.keys(form.operatingHours).map((key) => (
              <View key={key} className="flex-row justify-between">
                <Text className="text-gray-400">{`${
                  key.charAt(0).toUpperCase() + key.slice(1)
                }:`}</Text>
                <Text className="text-white">{form.operatingHours[key]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Location Info */}
        <View className="bg-gray-800 rounded-xl p-4 mb-4 w-full">
          <Text className="text-white text-xl font-dsbold mb-3">
            Location Information
          </Text>
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Location:</Text>
              <Text className="text-white flex-1">
                {form.location ? form.location.name : "N/A"}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Coordinates:</Text>
              <Text className="text-white">{`Long: ${form.longitude} \nLat: ${form.latitude}`}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-x-10 py-5">
          <TouchableOpacity
            onPress={onBackPress}
            className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10"
          >
            <ArrowLeftIcon size={40} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onNextPress();
              createBusiness();
            }}
            className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10"
          >
            <ArrowRightIcon size={40} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={printForm}
            className="bg-purple-500  h-14 p-2 rounded-full mt-10"
          >
            <Text className="text-white text-lg font-dsbold">Debug</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Screen to show success message
const successScreen = ({ uploading, error }) => {
    return (

        uploading ? (
            <View className="flex-1 items-center justify-center">
                <LottieView
                    source={require('../../assets/animations/Creating.json')}
                    autoPlay
                    loop={true}
                    style={{ width: 400, height: 400 }}
                />

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Building your business...</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">Please wait while we create your business. This may take a few seconds.</Text>
            
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

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Error creating business</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">An error occurred while creating your business. Please try again later.</Text>
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

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Business Request Submitted!!</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">Congratulations! Your business has been successfully sent for review. You will be notified once it is approved.</Text>

                <View className="flex-row gap-x-10 py-5">

                    <TouchableOpacity onPress={() => router.replace('/settings')} className="bg-purple-500 p-3 rounded-full mt-10">
                        <Text className="text-white text-lg">Complete</Text>
                    </TouchableOpacity>
                </View>
            
            </View>
        )
        

    );
};

export default BusinessCreateScreen