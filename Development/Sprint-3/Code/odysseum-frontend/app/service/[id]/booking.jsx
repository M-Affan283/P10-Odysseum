import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import ServiceBookingScreen from '../../../src/screens/ServiceBookingScreen';

const ServiceBooking = () => {

    const { id } = useLocalSearchParams();

    console.log("ServiceBookingScreen id: ", id);

  return (
    <ServiceBookingScreen serviceId={id} />
  )
}

export default ServiceBooking