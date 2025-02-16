//On boarding styled business create screen
// by this we mean there will be a different screeens. 
// like one will be for name and category, then user presses next button and then it goes to the next screen where user enters the location and then the next screen where user enters the contact info

import { View, Text, FlatList, Platform, TouchableOpacity, Dimensions, TextInput, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import useUserStore from '../context/userStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import LocationsModal from '../components/LocationsModal';
import LottieView from "lottie-react-native";
import { MapIcon, ArrowLeftIcon, ArrowRightIcon, XMarkIcon, TrashIcon } from 'react-native-heroicons/solid';
import images from '../../assets/images/images';

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

    // Screen to begin business creation
    const startScreen = () => {
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

    // Screen to add business name, location, category, description
    const [focusedInput, setFocusedInput] = useState(null);
    const [visible, setVisible] = useState(false);

    const businessInfoScreen = () => {

        const categories = ["","Restaurant", "Hotel", "Shopping", "Fitness", "Health", "Beauty", "Education", "Entertainment", "Services", "Other"]
            
        const validateScreen = () => {
            if (form.name === '' || form.category === '' || form.address === '' || form.description === '') 
            {
                Toast.show({
                    type: 'error',
                    position: 'bottom',
                    text1: 'Error',
                    text2: 'Please fill in all required fields',
                    visibilityTime: 2000,
                });
            } 
            else onNextPress();
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

                        {/* <TouchableOpacity className="flex-row mt-7 border-b-2 rounded-xl border-gray-500 w-[90%] " onPress={() => setVisible(true)}>
                            <MapIcon size={40} color="#fff" />
                            <Text className="text-gray-500 ml-2 text-lg p-1">Add location</Text>
                        </TouchableOpacity> */}

                        {
                            form.location === null ? (
                                <TouchableOpacity className="flex-row mt-7 border-b-2 rounded-xl border-gray-500 w-[90%] " onPress={() => setVisible(true)}>
                                <MapIcon size={40} color="gray" />
                                <Text className="text-gray-500 ml-2 text-lg p-1">Add location</Text>
                                </TouchableOpacity>
                            )
                            :
                            (
                                <View className="flex-row mt-2 p-3">
                                <MapIcon size={40} color="gray" />
                                <Text className="text-white ml-2 text-lg p-1">{form.location?.name}</Text>

                                <TouchableOpacity onPress={() => setForm({ ...form, location: null })} className="my-auto ml-10">
                                    <TrashIcon size={25} color="red" />
                                </TouchableOpacity>
                                </View>
                            )
                        }

                        <View className="flex-row mt-5 w-[90%] ">
                            <TextInput
                                value={form.longitude} 
                                onChangeText={(text) => setForm({ ...form, longitude: text })}
                                placeholder="Longitude"
                                placeholderTextColor="gray"
                                onFocus={() => setFocusedInput('longitude')}
                                onBlur={() => setFocusedInput(null)}
                                className={`text-white text-lg w-[45%] border-b-2 p-3 rounded-xl ${focusedInput === 'longitude' ? 'border-purple-600' : 'border-gray-500'}`}
                            />

                            <TextInput
                                value={form.latitude}
                                onChangeText={(text) => setForm({ ...form, latitude: text })}
                                placeholder="Latitude"
                                placeholderTextColor="gray"
                                onFocus={() => setFocusedInput('latitude')}
                                onBlur={() => setFocusedInput(null)}
                                className={`text-white text-lg w-[45%] border-b-2 p-3 rounded-xl ${focusedInput === 'latitude' ? 'border-purple-600' : 'border-gray-500'}`}
                            />
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
    const imageScreen = () => {
        return (
            <View className="flex-1 items-center mt-4">
                <Image source={images.CameraImg} style={{ width: 100, height: 100 }} className="rounded-full" resizeMode='cover' />

                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Add some images</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">Add some images to showcase your business. You can add up to 5 images. Feel free to skip this step if you want.</Text>

                
                {/* Expo image picker here */}



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

    // Screen to add contact info
    const contactScreen = () => {
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
                        <TouchableOpacity onPress={ () => router.back()} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
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
    const operatingHoursScreen = () => {

        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-gray-300 text-4xl p-5 font-dsbold">Operating Hours</Text>

                <Text className="text-gray-400 text-lg p-5 text-center">Add your operating hours so that customers know when you are open. Leave fields empty if you are closed on that day.</Text>

                <ScrollView className="p-2 w-[90%] mx-auto" contentContainerStyle={{ alignItems: 'center' }}>

                    <TextInput
                        value={form.operatingHours.monday}
                        onChangeText={(text) => setForm({ ...form, operatingHours: { ...form.operatingHours, monday: text } })}
                        placeholder="Monday"
                        placeholderTextColor="gray"
                        onFocus={() => setFocusedInput('monday')}
                        onBlur={() => setFocusedInput(null)}
                        className={`text-white text-lg w-[50%] border-b-2 p-3 rounded-xl ${focusedInput === 'monday' ? 'border-purple-600' : 'border-gray-500'}`}
                    />
                    <TextInput
                        value={form.operatingHours.tuesday}
                        onChangeText={(text) => setForm({ ...form, operatingHours: { ...form.operatingHours, tuesday: text } })}
                        placeholder="Tuesday"
                        placeholderTextColor="gray"
                        onFocus={() => setFocusedInput('tuesday')}
                        onBlur={() => setFocusedInput(null)}
                        className={`text-white text-lg w-[50%] border-b-2 p-3 rounded-xl ${focusedInput === 'tuesday' ? 'border-purple-600' : 'border-gray-500'}`}
                    />
                    <TextInput
                        value={form.operatingHours.wednesday}
                        onChangeText={(text) => setForm({ ...form, operatingHours: { ...form.operatingHours, wednesday: text } })}
                        placeholder="Wednesday"
                        placeholderTextColor="gray"
                        onFocus={() => setFocusedInput('wednesday')}
                        onBlur={() => setFocusedInput(null)}
                        className={`text-white text-lg w-[50%] border-b-2 p-3 rounded-xl ${focusedInput === 'wednesday' ? 'border-purple-600' : 'border-gray-500'}`}
                    />
                    <TextInput
                        value={form.operatingHours.thursday}
                        onChangeText={(text) => setForm({ ...form, operatingHours: { ...form.operatingHours, thursday: text } })}
                        placeholder="Thursday"
                        placeholderTextColor="gray"
                        onFocus={() => setFocusedInput('thursday')}
                        onBlur={() => setFocusedInput(null)}
                        className={`text-white text-lg w-[50%] border-b-2 p-3 rounded-xl ${focusedInput === 'thursday' ? 'border-purple-600' : 'border-gray-500'}`}
                    />
                    <TextInput
                        value={form.operatingHours.friday}
                        onChangeText={(text) => setForm({ ...form, operatingHours: { ...form.operatingHours, friday: text } })}
                        placeholder="Friday"
                        placeholderTextColor="gray"
                        onFocus={() => setFocusedInput('friday')}
                        onBlur={() => setFocusedInput(null)}
                        className={`text-white text-lg w-[50%] border-b-2 p-3 rounded-xl ${focusedInput === 'friday' ? 'border-purple-600' : 'border-gray-500'}`}
                    />
                    <TextInput
                        value={form.operatingHours.saturday}
                        onChangeText={(text) => setForm({ ...form, operatingHours: { ...form.operatingHours, saturday: text } })}
                        placeholder="Saturday"
                        placeholderTextColor="gray"
                        onFocus={() => setFocusedInput('saturday')}
                        onBlur={() => setFocusedInput(null)}
                        className={`text-white text-lg w-[50%] border-b-2 p-3 rounded-xl ${focusedInput === 'saturday' ? 'border-purple-600' : 'border-gray-500'}`}
                    />
                    <TextInput
                        value={form.operatingHours.sunday}
                        onChangeText={(text) => setForm({ ...form, operatingHours: { ...form.operatingHours, sunday: text } })}
                        placeholder="Sunday"
                        placeholderTextColor="gray"
                        onFocus={() => setFocusedInput('sunday')}
                        onBlur={() => setFocusedInput(null)}
                        className={`text-white text-lg w-[50%] border-b-2 p-3 rounded-xl ${focusedInput === 'sunday' ? 'border-purple-600' : 'border-gray-500'}`}
                    />


                </ScrollView>

                <View className="flex-row gap-x-10 mb-10">
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

    // Screen to review and submit
    const reviewScreen = () => {
        return (
            <View className="flex-1 items-center justify-center">

                <ScrollView className="p-2 w-[90%] mx-auto" contentContainerStyle={{ alignItems: 'center' }}>
                    <Image source={images.ReviewImg} style={{ width: '95%', height: 250 }} className="rounded-full" resizeMode='cover' />

                    <Text className="text-gray-300 text-4xl p-5 font-dsbold">Review and Submit</Text>

                    <Text className="text-gray-400 text-lg p-5 text-center">Please review the information you have provided and submit.</Text>
                
                    <View className="flex-row gap-5 w-[90%] mt-5">
                        <Text className="text-gray-400 text-lg">Name:</Text>
                        <Text className="text-white text-lg">{form.name}</Text>
                    </View>
                    <View className="flex-row gap-5 w-[90%] mt-5">
                        <Text className="text-gray-400 text-lg">Category:</Text>
                        <Text className="text-white text-lg">{form.category}</Text>
                    </View>
                    <View className="flex-row gap-5 w-[90%] mt-5">
                        <Text className="text-gray-400 text-lg">Address:</Text>
                        <Text className="text-white text-lg">{form.address}</Text>
                    </View>
                    <View className="flex-row gap-5 w-[90%] mt-5">
                        <Text className="text-gray-400 text-lg">Description:</Text>
                        <Text className="text-white text-lg">{form.description}</Text>
                    </View>
                    <View className="flex-row gap-5 w-[90%] mt-5">
                        <Text className="text-gray-400 text-lg">Phone:</Text>
                        <Text className="text-white text-lg">{form.phone}</Text>
                    </View>
                    <View className="flex-row gap-5 w-[90%] mt-5">
                        <Text className="text-gray-400 text-lg">Email:</Text>
                        <Text className="text-white text-lg">{form.email}</Text>
                    </View>
                    <View className="flex-row gap-5 w-[90%] mt-5">
                        <Text className="text-gray-400 text-lg">Website:</Text>
                        <Text className="text-white text-lg">{form.website}</Text>
                    </View>
                    <View className="gap-5 w-[90%] mt-5">
                        <Text className="text-gray-400 text-lg">Operating Hours:</Text>
                        {
                            Object.keys(form.operatingHours).map((key) => (
                                <Text key={key} className="text-gray-400 text-lg">{`${key.charAt(0).toUpperCase() + key.slice(1)}: ${form.operatingHours[key]}`}</Text>
                            ))
                        }
                    </View>
                    <View className="flex-row gap-5 w-[90%] mt-5">
                        <Text className="text-gray-400 text-lg">Location:</Text>
                        <Text className="text-white text-lg flex-1">{form.location ? form.location.name : 'N/A'}</Text>
                    </View>
                    <View className="flex-row gap-5 w-[90%] mt-5">
                        <Text className="text-gray-400 text-lg">Coordinates:</Text>
                        <Text className="text-white text-lg">{`Long: ${form.longitude} \nLat: ${form.latitude}`}</Text>
                    </View>

                    <View className="flex-row gap-x-10 py-5">
                        <TouchableOpacity onPress={ () => router.back()} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                            <ArrowLeftIcon size={40} color="black" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=> { onNextPress(); createBusiness()}} className="bg-purple-500 w-14 h-14 p-2 rounded-full mt-10">
                            <ArrowRightIcon size={40} color="black" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>

            
            </View>
        );
    };

    // Screen to show success message
    const successScreen = () => {
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

    const screens = [
        startScreen,
        businessInfoScreen,
        imageScreen,
        contactScreen,
        operatingHoursScreen,
        reviewScreen,
        successScreen,
    ];

    const flatListRef = React.useRef();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Handle Next button click
    const onNextPress = () => {
        if (currentIndex < screens.length - 1) {
            setCurrentIndex(currentIndex + 1);
            // Move to next screen in FlatList
            flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
        }
    };

    // Handle Back button click
    const onBackPress = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            // Move to previous screen in FlatList
            flatListRef.current.scrollToIndex({ index: currentIndex - 1, animated: true });
        }
    };


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
                    {item()}
                </View>
            ) }
        />

    </SafeAreaView>
  )
}

export default BusinessCreateScreen