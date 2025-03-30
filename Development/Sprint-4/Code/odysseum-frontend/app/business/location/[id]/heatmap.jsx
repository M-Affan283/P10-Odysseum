import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import BusinessLocationHeatmapScreen from '../../../../src/screens/BusinessLocationHeatmapScreen';

const BusinessLocationHeatmap = () => {

  const { id, name } = useLocalSearchParams();

  return (
    <BusinessLocationHeatmapScreen locationId={id} locationName={name} />
  )
}

export default BusinessLocationHeatmap