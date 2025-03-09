import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import MapView, {Heatmap, Marker, PROVIDER_GOOGLE} from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import axiosInstance from '../utils/axios'
import Toast from 'react-native-toast-message'
import { useQuery } from '@tanstack/react-query';
import LottieView from 'lottie-react-native'
import { ChevronLeftIcon } from 'react-native-heroicons/solid'
import themes from '../../assets/themes/themes'

const getQueryHeatmapData = async ({locationId}) =>
{
  try
  {
    const res = await axiosInstance.get(`/business/getMapData?locationId=${locationId}`);
    // console.log(res.data)
    return res.data;
  }
  catch (error)
  {
    throw new Error("Failed to fetch heatmap data");
  }
}

const BusinessLocationHeatmapScreen = ({ locationId, locationName }) => {

  const [showMarkers, setShowMarkers] = useState(false);

  const { data, isFetching, error, refetch} = useQuery({
    queryKey: ['heatmapData', locationId],
    queryFn: () => getQueryHeatmapData({locationId}),
    enabled: true
  })

  const locationCoordinates = data?.locationCoords || null;
  const mapData = data?.businesses || [];

  // console.log(locationCoordinates)
  // console.log(mapData)

  if(error)
  {
    Toast.show({
      type: "error",
      position: "bottom",
      text1: "Failed to fetch heatmap data",
      text2: "Error occurred server side",
      visibilityTime: 2000
    });

    return (
      <SafeAreaView className="flex-1 bg-[#28154e]">
        <View className="flex-1 items-center justify-center">
          <Text className="font-dsbold text-white text-lg">Failed to fetch heatmap data</Text>
        </View>
      </SafeAreaView>
    )
  }

  if(isFetching)
  {
    return (
      <View className="flex-1 bg-[#28154e] justify-center items-center">
        <LottieView
          source={require('../../assets/animations/Loading1.json')}
          style={{
            width: 150,
            height: 150,
          }}
          autoPlay
          loop
        />
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">

      <View className="py-9 bg-[#28154e] w-full rounded-b-3xl">
        <View className="px-4 flex-row ">

          <TouchableOpacity onPress={() => router.back()} className="mr-4 py-4">
              <ChevronLeftIcon size={30} strokeWidth={4} color="white" />
          </TouchableOpacity>

          <View className="flex-col">
            <Text className="font-dsbold text-white text-2xl">Business Heatmap</Text>
            <Text className="font-dsbold text-white text-lg">{locationName}</Text>
          </View>


        </View>
      </View>


        {
          mapData.length > 0 && locationCoordinates!==null ?
          (
            <View className="flex-1 mt-4 items-center justify-center">
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ height: '100%', width: '99%' }}
                customMapStyle={themes.dark}
                initialRegion={{
                  // if locationCoordinates is null, set to world center
                  latitude: locationCoordinates ? locationCoordinates[1] : 0.0,
                  longitude: locationCoordinates ? locationCoordinates[0] : 0.0,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                showsMyLocationButton={true}
              >
                {/* Conditionally render heatmap based on toggle */}
                {!showMarkers && mapData.length > 0 && (
                  <Heatmap
                    points={mapData.map(item => ({
                      latitude: item.coordinates[1],
                      longitude: item.coordinates[0],
                      weight: item.heatmapScore,
                    }))}
                    radius={40}
                    opacity={0.7}
                    gradient={{
                      colors: ['black', 'purple', 'red', 'yellow', 'white'],
                      startPoints: [0.01, 0.04, 0.1, 0.45, 5],
                      colorMapSize: 256
                    }}
                  />
                )}
                
                {/* Conditionally render markers based on toggle */}
                {showMarkers && mapData.map((item, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: item.coordinates[1],
                      longitude: item.coordinates[0],
                    }}
                    title={item.name || "Business"}
                    description={`Rating: ${item.averageRating || "N/A"}`}
                    pinColor="blue"
                  />
                ))}
              </MapView>

              
              
              {/* Floating legend */}
              <View style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 8 }}>
                
                <TouchableOpacity 
                  style={{
                    backgroundColor: '#28154e', 
                    padding: 10, 
                    borderRadius: 8,
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                  }}
                  onPress={() => setShowMarkers(!showMarkers)}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    {showMarkers ? "Show Heatmap" : "Show Markers"}
                  </Text>
                </TouchableOpacity>
                
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Business Density</Text>
                <View style={{ width: 150, height: 20, flexDirection: 'row' }}>
                  {['black', 'purple', 'red', 'yellow', 'white'].map((color, i) => (
                    <View key={i} style={{ flex: 1, height: '100%', backgroundColor: color }} />
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 150 }}>
                  <Text style={{ fontSize: 12 }}>Low</Text>
                  <Text style={{ fontSize: 12 }}>High</Text>
                </View>
              </View>
              
              {/* Stats panel */}
              <View style={{ position: 'absolute', top: 20, left: 20, backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 8 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Area Statistics</Text>
                <Text>• {mapData.length} businesses in view</Text>
                <Text>• Avg rating: {(mapData.reduce((sum, item) => sum + (item.averageRating || 0), 0) / mapData.length).toFixed(1)}★</Text>
                <Text>• Hottest zone: {locationName} Center</Text>
              </View>

            </View>
          )
          :
          (
            <View className="flex-1 items-center justify-center">
              <Text className="font-dsbold text-white text-lg">No heatmap data available</Text>
            </View>
          )
        }


    </SafeAreaView>
  )
}

export default BusinessLocationHeatmapScreen