import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import ActionSheet from "react-native-actions-sheet";
import { XMarkIcon } from "react-native-heroicons/outline";
import { router } from "expo-router";

const BusinessManageModal = ({ business, visible, setVisible }) => 
{ 
    const actionSheetRef = React.useRef();

    const onClose = () => {
        setVisible(false);
    };

    
    useEffect(()=>
    {
        if(visible) actionSheetRef.current?.setModalVisible(true);
        else actionSheetRef.current?.setModalVisible(false);
    },[visible])

    const options = [
        {
            title: "View Profile",
            routeUrl: `/business/profile/${business._id}`,
        },
        {
            title: "Manage Services",
            routeUrl: `/settings/service/manage/${business._id}`,
        },
        {
            title: "Create Service",
            icon: "create-service",
            routeUrl: `/settings/service/create/${business._id}`, //settnigs/service/create/[createId] to create a new service for the business
        }
        //make one for editing business and deleting business later
    ];

  return (
    <View className="flex-1">
      <ActionSheet 
        ref={actionSheetRef}
        containerStyle={{backgroundColor: '#070f1b', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '90%'}}
        indicatorStyle={{width: 50, marginVertical: 10, backgroundColor: 'black'}}
        gestureEnabled={true} //check if disabling this and adding a cancel button is better UI
        onClose={onClose}
        statusBarTranslucent={true}
        keyboardHandlerEnabled={true}
      >

        <View className="flex-row items-center justify-between gap-x-3">
            <Text className="text-white text-3xl font-dsbold p-4 mt-2">Business Actions: {business.name}</Text>
            <TouchableOpacity onPress={onClose} className="p-3">
            <XMarkIcon size={30} color="white" />
            </TouchableOpacity>
        </View>

        <FlatList
            data={options}
            keyExtractor={(item) => item.title}
            renderItem={({item}) => (
              <TouchableOpacity className="flex-row items-center ml-5 mt-5" onPress={() => {onClose(); router.push(item.routeUrl)}}>
                <Text className="text-lg text-neutral-200 ">{item.title}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => (<View className="bg-gray-600 h-0.5 w-[90%] mx-auto mt-4" />)}
        />

      </ActionSheet>
    </View>
  );

}

export default BusinessManageModal;