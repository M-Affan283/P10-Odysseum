import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import SingleUserProfileScreen from '../../src/screens/SingleUserProfileScreen';

const SingleUser = () => {
    const { id } = useLocalSearchParams();


  return (
    <SingleUserProfileScreen userId={id} />
  )
}

export default SingleUser