import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import LocationDetailsScreen from '../../../src/screens/LocationDetailsScreen';

const SingleLocation = () => {
    const { id } = useLocalSearchParams();

  return (
    <LocationDetailsScreen locationId={id} />
  )
}

export default SingleLocation