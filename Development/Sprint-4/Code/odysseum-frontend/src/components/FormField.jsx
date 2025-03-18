import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';


const FormField = ({title, value, placeholder, handleChangeText, otherStyles, ...props}) => {

    const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-4 ${otherStyles}`}>
      <Text className="text-base text-gray-100 font-medium">{title}</Text>

        <View className="border-2 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-purple-400 items-center flex-row">
            <TextInput
                value={value}
                className="flex-1 text-white font-semibold text-base"
                placeholder={placeholder}
                placeholderTextColor={"#7b7b8b"}
                onChangeText={handleChangeText}
                autoCapitalize='none'
                secureTextEntry={title === "Password" && !showPassword}
                {...props}
            />

            {title === "Password" && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {/* if showpassword is true, show the eye icon, else show the eye-off icon */}
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="#7b7b8b" className="w-6 h-6"/>
                </TouchableOpacity>
            )}
        </View>   
    </View>
  )
}

export default FormField