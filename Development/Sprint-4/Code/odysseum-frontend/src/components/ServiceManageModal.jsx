import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import ActionSheet from "react-native-actions-sheet";
import { XMarkIcon } from "react-native-heroicons/outline";
import { UserCircleIcon, PencilSquareIcon, TrashIcon, CalendarDaysIcon } from "react-native-heroicons/solid";
import { router } from "expo-router";

const ServiceManageModal = ({ serviceId, visible, setVisible }) => {
  const actionSheetRef = React.useRef();
  
  const onClose = () => {
    setVisible(false);
  };
  
  useEffect(() => {
    if(visible) actionSheetRef.current?.setModalVisible(true);
    else actionSheetRef.current?.setModalVisible(false);
  }, [visible]);

  const options = [
    {
      title: "View Profile",
      icon: <UserCircleIcon size={35} color="#60a5fa" />,
      routeUrl: `/service/profile/${serviceId}`,
    },
    {
      title: "View Bookings",
      icon: <CalendarDaysIcon size={35} color="#60a5fa" />,
      routeUrl: `/service/bookings/${serviceId}`,
    },
    {
      title: "Edit Service",
      icon: <PencilSquareIcon size={35} color="#60a5fa" />,
      routeUrl: `/settings/service/edit/${serviceId}`,
    },
    {
      title: "Delete Service",
      icon: <TrashIcon size={35} color="#ef4444" />,
      routeUrl: `/settings/service/delete/${serviceId}`,
      danger: true
    }
  ];

  const handleAction = (routeUrl) => {
    onClose();
    router.push(routeUrl);
  };

  return (
    <View className="flex-1">
      <ActionSheet 
        ref={actionSheetRef}
        containerStyle={{backgroundColor: '#070f1b', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '90%'}}
        indicatorStyle={{width: 50, marginVertical: 10, backgroundColor: 'black'}}
        gestureEnabled={true}
        onClose={onClose}
        statusBarTranslucent={true}
        keyboardHandlerEnabled={true}
      >
        <View className="px-4 pt-4 pb-2 flex-row justify-between items-center border-b border-gray-800">
          <View>
            <Text className="text-xl font-bold text-white">Service Actions</Text>
          </View>
          <TouchableOpacity 
            onPress={onClose}
            className="p-2 bg-gray-800 rounded-full"
          >
            <XMarkIcon size={20} color="#60a5fa" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={options}
          keyExtractor={(item) => item.title}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handleAction(item.routeUrl)}
              className="flex-row items-center p-6"
              activeOpacity={0.7}
            >
              <View className="mr-4">
                {item.icon}
              </View>
              <Text className={`text-base ${item.danger ? 'text-red-400 font-medium' : 'text-gray-200'}`}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-gray-800 mx-4" />
          )}
        />
      </ActionSheet>
    </View>
  );
}

export default ServiceManageModal;