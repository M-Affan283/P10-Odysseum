import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '../utils/axios';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import { ChevronLeftIcon, MagnifyingGlassIcon, MapPinIcon, FireIcon } from 'react-native-heroicons/outline';
import images from '../../assets/images/images';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.42;

const DiscoverLocationsScreen = () => {
    const [locations, setLocations] = useState([]);
    const [popularLocations, setPopularLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState(locations);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollViewRef = useRef(null);

    const getLocations = async () => {
        console.log("Retrieving locations. Change to pagination if locations are too many...");
        return axiosInstance.get('/location/getAll');
    }

    const getPopularLocations = async () => {
        console.log("Retrieving popular locations...");
        return axiosInstance.get('/location/getPopular');
    }

    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            try {
                const [locationsRes, popularLocationsRes] = await Promise.all([getLocations(), getPopularLocations()]);
                setLocations(locationsRes.data.locations);
                setPopularLocations(popularLocationsRes.data.locations);
                setLoading(false);
            } catch (error) {
                console.log(error);
                Toast.show({
                    type: "error",
                    position: "bottom",
                    text1: "Failed to fetch locations",
                    text2: "Error occurred server side",
                    visibilityTime: 300
                });
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    const filterLocations = () => {
        if(search === '') setFilteredLocations(locations);
        else {
            const filtered = locations.filter((location) => 
                location.name.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredLocations(filtered);
        }
    }
    
    useEffect(() => {
        filterLocations();
    }, [search, locations]);

    return (
        <SafeAreaView className="flex-1 bg-[#070f1b]">
            <ScrollView 
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false} 
                className="py-4"
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Header */}
                <View className="px-4 flex-row justify-between items-center mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2 bg-gray-800/50 rounded-full"
                    >
                        <ChevronLeftIcon size={30} strokeWidth={2.5} color="white" />
                    </TouchableOpacity>

                    <Text className="font-dsbold text-white text-3xl">Discover Places</Text>

                    <TouchableOpacity>
                        <Image 
                            source={images.DefaultLocationImg} 
                            style={{width: 40, height: 40, borderRadius: 20}} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="mx-4 mb-6">
                    <LinearGradient
                        colors={['#1a2636', '#111927']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="flex-row items-center rounded-xl p-2 px-4"
                    >
                        <MagnifyingGlassIcon size={20} color="#9ca3af" />
                        <TextInput
                            placeholder='Search amazing places...'
                            placeholderTextColor={'#9ca3af'}
                            value={search}
                            className="flex-1 text-base ml-2 tracking-wider text-white"
                            onChangeText={(text) => setSearch(text)}
                        />
                    </LinearGradient>
                </View>

                {/* Categories ScrollView */}
                {/* <View className="mb-6">
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                        className="space-x-3"
                    >
                        {['All', 'Popular', 'Nature', 'Beach', 'Urban', 'Mountain', 'Historical'].map((category, index) => (
                            <LinearGradient
                                key={index}
                                colors={index === 0 ? ['#4c1d95', '#2e1065'] : ['#1a2636', '#111927']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="px-4 py-2 rounded-full"
                            >
                                <Text className={`${index === 0 ? 'text-white' : 'text-gray-400'} font-medium`}>{category}</Text>
                            </LinearGradient>
                        ))}
                    </ScrollView>
                </View> */}

                {loading ? (
                    <View className="flex items-center justify-center h-64">
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
                ) : (
                    <>
                        {/* Popular Locations Section */}
                        <View className="mb-8">
                            <View className="px-4 flex-row justify-between items-center mb-4">
                                <View className="flex-row items-center">
                                    <FireIcon size={20} color="#f97316" />
                                    <Text className="font-bold text-white text-lg ml-2">Popular Places</Text>
                                </View>
                            </View>

                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false} 
                                contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, gap: 12 }}
                                className="space-x-4"
                            >
                                {popularLocations.map((location, index) => (
                                    <PopularLocationCard key={index} location={location} />
                                ))}
                            </ScrollView>
                        </View>

                        {/* All Locations Section */}
                        <View>
                            <View className="px-4 flex-row justify-between items-center mb-4">
                                <View className="flex-row items-center">
                                    <MapPinIcon size={20} color="#3b82f6" />
                                    <Text className="font-bold text-white text-lg ml-2">All Destinations</Text>
                                </View>
                            </View>

                            {filteredLocations.length > 0 ? (
                                <View className="px-4 flex-row flex-wrap justify-between">
                                    {filteredLocations.map((location, index) => (
                                        <LocationCard location={location} key={index} />
                                    ))}
                                </View>
                            ) : (
                                <View className="mt-4 items-center justify-center px-4">
                                    <Text className="text-gray-400 text-center">No locations found matching your search.</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const PopularLocationCard = ({location}) => {

    return (
        <TouchableOpacity 
            className="mb-4 relative rounded-xl overflow-hidden" 
            style={{ width: width * 0.7, height: 180 }}
            onPress={() => router.push(`/location/${location._id}`)}
        >
            <Image 
                source={location?.imageUrl ? {uri: location?.imageUrl} : images.DefaultBookmarkImg}
                className="w-full h-full"
                resizeMode="cover"
            />
            
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={{width: '100%', height: '50%'}}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0 justify-end py-3 px-4"
            >
                <Text className="text-white font-bold text-lg">{location.name}</Text>
                <View className="flex-row items-center mt-1">
                    <MapPinIcon size={14} color="#f97316" />
                    <Text className="text-gray-300 ml-1 text-sm">
                        {location.region || 'Pakistan'}
                    </Text>
                </View>
            </LinearGradient>
            
            {/* Rating badge */}
            <View className="absolute top-3 right-3 bg-black/50 rounded-full p-1 px-2 backdrop-blur-md">
                <Text className="text-white font-medium text-sm">⭐ {location?.avgRating || 'N/A'}</Text>
            </View>
        </TouchableOpacity>
    );
};

const LocationCard = ({location}) => {
    return (
        <TouchableOpacity
            className="mb-5 relative rounded-2xl overflow-hidden"
            style={{ width: cardWidth, height: 180 }}
            onPress={() => router.push(`/location/${location._id}`)}
        >
            <Image 
                source={location?.imageUrl ? {uri: location?.imageUrl} : images.DefaultBookmarkImg}
                className="w-full h-full"
                resizeMode="cover"
            />
            
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={{width: '100%', height: 70}}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0 justify-end p-3"
            >
                <Text className="text-white font-semibold text-base">{location.name}</Text>
                <View className="flex-row items-center mt-1">
                    <MapPinIcon size={12} color="#f97316" />
                    <Text className="text-gray-300 ml-1 text-xs">
                        {location.region || 'Pakistan'}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default DiscoverLocationsScreen;