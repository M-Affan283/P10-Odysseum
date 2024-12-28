import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native'
import {useEffect, useState} from 'react'
import useUserStore from '../context/userStore'
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context'
import DefaultBookmarkPNG from '../../assets/DefaultBookmark.png'
import DefaultLocationPNG from '../../assets/Sunset.jpg'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '../utils/axios';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

// Temporary Locations since database currently lacks many locations
const tempLocations = [
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Chitral, KPK",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Giglit, Baltistan",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Hunza, Baltistan",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Kalam, KPK",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Murree, Punjab",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Skardu, Baltistan",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Swat, KPK",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Naran, KPK",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Kaghan, KPK",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Hunza, Baltistan",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Kalam, KPK",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Murree, Punjab",
    },
    {
        _id: "67310369aa977e99fcc2c31e",
        name: "Skardu, Baltistan",
    }
]

const DiscoverLocationsScreen = () => {

    // const user = useUserStore((state) => state.user);
    const [locations, setLocations] = useState(tempLocations || []);
    const [filteredLocations, setFilteredLocations] = useState(locations);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const getLocations = async () =>
    {
        console.log("Retrieving locations. Change to pagination if locations are too many...");

        axiosInstance.get('/location/getAllLocations')
        .then((res)=>
        {
            // console.log("Locations received: ", res.data.locations);
            setLocations(res.data.locations);
            setLoading(false);
        })
        .catch((error)=>
        {
            console.log(error);
            Toast.show({
                type: "error",
                position: "bottom",
                text1: "Failed to fetch locations",
                text2: "Error occurred server side",
                visibilityTime: 300
            })
            setLoading(false);
        })
    }

    useEffect(()=>
    {
        getLocations();
    }, [])


    const filterLocations = () =>
    {

        if(search === '') setFilteredLocations(locations);
        else
        {
            const filtered = locations.filter((location) => location.name.toLowerCase().includes(search.toLowerCase()));
            setFilteredLocations(filtered);
        }
    }
    
    //every time the search query changes, filter the bookmarks and update the view
    
    useEffect(()=>{
        filterLocations();
    }, [search, locations])

  return (
    <SafeAreaView className="flex-1 bg-white">
        {/* add create iteinirary and show itinerary buttons here simimal fashion of homme screen */}
        <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 py-5">

            <View className="mx-3 flex-row justify-between items-center mb-10">

                <TouchableOpacity
                    onPress={() => router.back()}
                    className="py-4"
                    >
                    <ChevronLeftIcon size={30} strokeWidth={4} color="black" />
                </TouchableOpacity>

                <Text className="font-dsbold text-neutral-700 text-3xl">Discover Locations</Text>

                <TouchableOpacity>
                    <Image source={DefaultLocationPNG} style={{width: 80, height: 80, borderRadius: 35}} />
                </TouchableOpacity>
            </View>

            <View className="mx-5 mb-4">
                <View className="flex-row items-center bg-neutral-100 rounded-full space-x-2 pl-6">
                <MaterialIcons name="search" size={20} color="black" />

                <TextInput
                    placeholder='Search locations'
                    placeholderTextColor={'gray'}
                    value={search}
                    className="flex-1 text-base mb-1 pl-1 tracking-wider"
                    onChangeText={(text) => setSearch(text)}
                />

                </View>
            </View>

            {loading ? (
                <View className="flex items-center justify-center">
                    <LottieView
                    source={require('../../assets/LoadingAnimation.json')}
                    style={{
                        width: 100,
                        height: 100,
                        
                        // backgroundColor: '#eee',
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
                    <SuggestionsCard locations={locations}/>
                </View>

                <Text className="mx-5 font-bold text-neutral-700 text-base">All Locations:</Text>
                { filteredLocations.length > 0 &&
                    <View className="pr-3 mx-5 my-3 flex-row justify-between flex-wrap">
                        {/* <BookMarkCard bookmark={{name: 'Chitral, KPK'}} /> */}
                        {filteredLocations.map((location, index) => (
                            // <Text>{location.name}</Text>
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
            <Image source={location?.imageUrl? {uri: location?.imageUrl} : DefaultBookmarkPNG}  className="absolute rounded-2xl h-full w-full" />
        
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
    const suggestions = locations.slice(0, 5);

    return (
        <View className="space-y-5">
            <View className="mx-5 flex-row justify-between items-center">
                <Text className="font-bold text-neutral-700 text-base">We think you might like:</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4" >
                {/* placeholder suggestion here for now */}
                {suggestions.map((suggestion, index) => (
                    <TouchableOpacity key={index} className="items-center space-y-2" style={{ width: 100 }} onPress={() => router.push(`/location/${suggestion._id}`)}>
                        <View className="rounded-3xl overflow-hidden" style={{ width: 95, height: 95 }}>
                            <Image source={suggestion?.imageUrl ? { uri: suggestion?.imageUrl } : DefaultBookmarkPNG} className="w-full h-full" resizeMode="cover"/>
                        </View>
                        <Text className="text-neutral-700 font-medium text-center">{suggestion?.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    )
}

export default DiscoverLocationsScreen