import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import BookingCreateScreen from '../../../src/screens/BookingCreateScreen';

const ServiceBooking = () => {

    const { id } = useLocalSearchParams();

    console.log("ServiceBookingScreen id: ", id);

  return (
    <BookingCreateScreen serviceId={id} />
  )
}

export default ServiceBooking