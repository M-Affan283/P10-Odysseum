import { StyleSheet, Text, View } from 'react-native'
import React from 'react'


//We are creating another layout for auth so that the menu and other components are not displayed when the user is not logged in.

const AuthLayout = () => {
  return (
    <View>
      <Text>AuthLayout</Text>
    </View>
  )
}

export default AuthLayout

const styles = StyleSheet.create({})