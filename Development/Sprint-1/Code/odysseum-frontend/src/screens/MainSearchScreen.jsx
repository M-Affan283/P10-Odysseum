import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import FindUserImg from '../../assets/FindUserJPG.jpg';
import DiscoverLocationImg from '../../assets/DiscoverLocationJPG.jpg';

const MainSearchScreen = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <View className="space-y-4">
            <View className="">
                {/* user and location search buttons */}
                <View className="gap-5 p-2 bg-primary">
                     <TouchableOpacity className="flex justify-end relative p-0 space-y-2 mb-4" style={{ width: 350, height: 200 }} onPress={()=> router.push(`/user`)}>
                        <Image source={FindUserImg}  className="absolute rounded-lg h-full w-full" />
                    
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,1)']}
                            style={{width: '100%', height: 60, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            className="absolute bottom-0"
                        />
            
                        <Text className="text-white font-dsregular mb-1 text-3xl"> Find Users </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex justify-end relative p-0 space-y-2 mb-4" style={{ width: 350, height: 200 }} onPress={()=> router.push('/location')}>
                        <Image source={DiscoverLocationImg}  className="absolute rounded-lg h-full w-full" />
                    
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,1)']}
                            style={{width: '100%', height: 60, borderBottomLeftRadius: 5, borderBottomRightRadius: 5}}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            className="absolute bottom-0"
                        />
            
                        <Text className="text-white font-dsregular mb-1 text-3xl"> Discover Locations </Text>
                    </TouchableOpacity>

                    
                </View>
            </View>
        </View>
    </SafeAreaView>
  )
}

export default MainSearchScreen