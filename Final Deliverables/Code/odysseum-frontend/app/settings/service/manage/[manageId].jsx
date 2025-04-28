import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import ServiceManageScreen from '../../../../src/screens/ServiceManageScreen'

const ManageService = () => {

  const { manageId } = useLocalSearchParams()

  return (
    <ServiceManageScreen businessId={manageId} />
  )
}

export default ManageService