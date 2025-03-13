import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import BusinessViewAllScreen from '../../../../src/screens/BusinessViewAllScreen'

const BusinessViewAll = () => {

  const { id, name } = useLocalSearchParams()

  return (
    <BusinessViewAllScreen locationId={id} locationName={name} />
  )
}

export default BusinessViewAll