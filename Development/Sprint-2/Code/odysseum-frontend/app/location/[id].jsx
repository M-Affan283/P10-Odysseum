import { View, Text } from 'react-native'
import React from 'react'
import axiosInstance from '../../src/utils/axios'
import { useLocalSearchParams } from 'expo-router'
import LocationDetailsScreen from '../../src/screens/LocationDetailsScreen'

const SingleLocation = () => {
    const { id } = useLocalSearchParams();

  return (
    <LocationDetailsScreen locationId={id} />
  )
}

export default SingleLocation