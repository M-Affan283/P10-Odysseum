import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Image, FlatList } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import FindUserImg from '../../assets/FindUserJPG.jpg';
import DiscoverLocationImg from '../../assets/DiscoverLocationJPG.jpg';
import BusinessSearchImg from '../../assets/BusinessSearch.jpg';


const searchList = [
    {
        img: FindUserImg,
        title: 'Find Users',
        onPress: () => router.push(`/user`)
    },
    {
        img: DiscoverLocationImg,
        title: 'Discover Locations',
        onPress: () => router.push(`/location`)
    },
    {
        img: BusinessSearchImg,
        title: 'Find Businesses',
        onPress: () => router.push(`/business`)
    }

    //add map, itinerary, reviews, posts, etc
]

const MainSearchScreen = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <View className="space-y-4">
            <View className="gap-5 bg-primary">

                <FlatList 
                    data={searchList}
                    keyExtractor={(item) => item.title}
                    contentContainerStyle={{ alignItems: 'center', padding: 20 }}
                    columnWrapperStyle={{ gap: 20 }}
                    numColumns={2}
                    ListHeaderComponent={()=> (
                        <View className="flex-row items-center justify-center" style={{marginBottom: 50, marginHorizontal:20}}>

                            <View style={{ alignItems: "center" }}>
                                <Text style={{ color: "white", fontSize: 30}} className="font-dsbold">Search</Text>
                                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Find what you're looking for</Text>
                            </View>
                        </View>
                    )}
                    renderItem={({item}) => (
                        <TouchableOpacity className="flex justify-end relative p-0 space-y-2 mb-4" style={{ width: 175, height: 100 }} activeOpacity={0.8} onPress={item.onPress}>
                            <Image source={item.img}  className="absolute rounded-lg h-full w-full" />
                        
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,1)']}
                                style={{width: '100%', height: 60, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                className="absolute bottom-0"
                            />
                
                            <Text className="text-white font-dsregular mb-1 text-2xl"> {item.title} </Text>
                        </TouchableOpacity>
                    )}
                />
                
            </View>
        </View>
    </SafeAreaView>
  )
}


export default MainSearchScreen