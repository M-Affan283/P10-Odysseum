import React from "react";
import { View, Text, Image, FlatList } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import images from "../../assets/images/images";


const createList = [
    {
        img: images.UserSearchImg,
        title: 'Create Post',
        onPress: () => router.push(`/post`)
    },
    {
        img: images.DiscoverLocationImg,
        title: 'Create Itinerary',
        onPress: () => router.push(`/itinerary`)
    },

]

const MainCreateScreen = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-primary">
        <View className="space-y-4">
            <View className="gap-5 bg-primary">

                <FlatList 
                    data={createList}
                    keyExtractor={(item) => item.title}
                    contentContainerStyle={{ alignItems: 'center', padding: 20 }}
                    columnWrapperStyle={{ gap: 20 }}
                    numColumns={2}
                    ListHeaderComponent={()=> (
                        <View className="flex-row items-center justify-center" style={{marginBottom: 50, marginHorizontal:20}}>

                            <View style={{ alignItems: "center" }}>
                                <Text style={{ color: "white", fontSize: 30}} className="font-dsbold">Create</Text>
                                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Share your adventures!</Text>
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


export default MainCreateScreen