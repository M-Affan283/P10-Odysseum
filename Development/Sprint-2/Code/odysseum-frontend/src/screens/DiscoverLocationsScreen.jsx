import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import {useEffect, useState} from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '../utils/axios';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import images from '../../assets/images/images';
// Temporary Locations since database currently lacks many locations
import tempLocations from './tempfiles/templocations';

const DiscoverLocationsScreen = () => {

    // const user = useUserStore((state) => state.user);
    const [locations, setLocations] = useState(tempLocations || []);
    const [popularLocations, setPopularLocations] = useState(tempLocations.slice(0, 5) || []);
    const [filteredLocations, setFilteredLocations] = useState(locations);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);


    const getLocations = async () => 
    {
        console.log("Retrieving locations. Change to pagination if locations are too many...");
        return axiosInstance.get('/location/getAll');
    }

    const getPopularLocations = async () => 
    {
        console.log("Retrieving popular locations...");
        return axiosInstance.get('/location/getPopular');
    }

    useEffect(() => {
        const fetchLocations = async () => 
        {
            setLoading(true);  // Start loading before making the requests
            try 
            {
                const [locationsRes, popularLocationsRes] = await Promise.all([getLocations(), getPopularLocations()]);
                
                // Set locations and popular locations once both have been fetched
                setLocations(locationsRes.data.locations);
                setPopularLocations(popularLocationsRes.data.locations);
                setLoading(false);  // Finished loading
            } 
            catch (error) 
            {
                console.log(error);
                Toast.show({
                    type: "error",
                    position: "bottom",
                    text1: "Failed to fetch locations",
                    text2: "Error occurred server side",
                    visibilityTime: 300
                });
                setLoading(false);  // Error occurred, stop loading
            }
        };

        fetchLocations();
    }, []);  // Runs once on mount


    const filterLocations = () =>
    {

        if(search === '') setFilteredLocations(locations);
        else
        {
            const filtered = locations.filter((location) => location.name.toLowerCase().includes(search.toLowerCase()));
            setFilteredLocations(filtered);
        }
    }
    
    useEffect(()=>{
        filterLocations();
    }, [search, locations])

  return (
    <SafeAreaView className="flex-1 bg-[#070f1b]">
        {/* add create iteinirary and show itinerary buttons here simimal fashion of homme screen */}
        <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 py-5">

                <View className="mx-3 flex-row justify-between items-center mb-10">

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="py-4"
                        >
                        <ChevronLeftIcon size={30} strokeWidth={4} color="white" />
                    </TouchableOpacity>

                    <Text className="font-dsbold text-neutral-200 text-3xl">Discover Locations</Text>

                    <TouchableOpacity>
                        <Image source={images.DefaultLocationImg} style={{width: 80, height: 80, borderRadius: 35}} />
                    </TouchableOpacity>
                </View>

            <View className="mx-5 mb-4">
                <View className="flex-row items-center border-gray-400 border rounded-full space-x-2 pl-6">
                <MaterialIcons name="search" size={20} color="white" />

                <TextInput
                    placeholder='Search locations'
                    placeholderTextColor={'gray'}
                    value={search}
                    className="flex-1 text-base mb-1 pl-1 tracking-wider text-white"
                    onChangeText={(text) => setSearch(text)}
                />

                </View>
            </View>

            {loading ? (
                <View className="flex items-center justify-center">
                    <LottieView
                    source={require('../../assets/animations/Loading1.json')}
                    style={{
                        width: 100,
                        height: 100,
                    }}
                    autoPlay
                    loop
                    />
                </View>
            )
            :
            (
                <>
                <View className="mb-4">
                    <SuggestionsCard locations={popularLocations} />
                </View>

                <Text className="mx-5 font-bold text-neutral-200 text-base">All Locations:</Text>
                { filteredLocations.length > 0 &&
                    <View className="pr-3 mx-5 my-3 flex-row justify-between flex-wrap">
                        {filteredLocations.map((location, index) => (
                            <LocationCard location={location} key={index} />
                        ))}
                    </View>
                }
                </>
            )
            }
        </ScrollView>
    </SafeAreaView>
  )
}

const LocationCard = ({location}) => {
    return (
        <TouchableOpacity className="flex justify-end relative p-0 py-4 mb-5 gap-3" style={{ width: '50%', height: 250 }} onPress={() => router.push(`/location/${location._id}`)}>
            <Image source={location?.imageUrl? {uri: location?.imageUrl} : images.DefaultBookmarkImg}  className="absolute rounded-2xl h-full w-full" />
        
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,1)']}
                style={{width: '100%', height: 30, borderBottomLeftRadius: 15, borderBottomRightRadius: 15}}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0"
            />

            <Text className="text-white font-semibold"> {location.name} </Text>
        </TouchableOpacity>
    )
}

const SuggestionsCard = ({locations}) => {

    //random 5 from tempLocations
    // const suggestions = locations.slice(0, 5);

    return (
        <View className="space-y-5">
            <View className="mx-5 flex-row justify-between items-center">
                <Text className="font-bold text-neutral-200 text-base">We think you might like:</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4 mx-4" >
                {locations.map((suggestion, index) => (
                    <TouchableOpacity key={index} className="items-center space-y-2" style={{ width: 100 }} onPress={() => router.push(`/location/${suggestion._id}`)}>
                        <View className="rounded-3xl overflow-hidden" style={{ width: 95, height: 95 }}>
                            <Image source={suggestion?.imageUrl ? { uri: suggestion?.imageUrl } : images.DefaultBookmarkImg} className="w-full h-full" resizeMode="cover"/>
                        </View>
                        <Text className="text-neutral-200 font-medium text-center">{suggestion?.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )
}

export default DiscoverLocationsScreen