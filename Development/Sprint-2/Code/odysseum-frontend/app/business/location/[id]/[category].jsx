import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import BusinessCategoryScreen from '../../../../src/screens/BusinessCategoryScreen';

const BusinessCategory = () => {

  const { id, category, name } = useLocalSearchParams();


  return (
    <BusinessCategoryScreen locationId={id} locationName={name} category={category} />
  )
}

export default BusinessCategory