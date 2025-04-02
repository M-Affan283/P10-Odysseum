import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import ActionSheet from "react-native-actions-sheet";
import { XMarkIcon } from "react-native-heroicons/outline";
import {
  UserCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarDaysIcon,
} from "react-native-heroicons/solid";
import { router } from "expo-router";
import useUserStore from "../context/userStore";
import axiosInstance from "../utils/axios";
import Toast from "react-native-toast-message";

const ServiceManageModal = ({ serviceId, visible, setVisible, refetch }) => {
  const actionSheetRef = React.useRef();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useUserStore((state) => state.user);

  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (visible) actionSheetRef.current?.setModalVisible(true);
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
      action: () => setShowDeleteConfirmation(true),
      danger: true,
    },
  ];

  const handleAction = (item) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.routeUrl) {
      router.push(item.routeUrl);
    }
  };

  const handleDeleteService = async () => {

      setIsDeleting(true);
      console.log(`Deleting service with ID: ${serviceId}`);

      //simulate a network request
      // setTimeout(() => {
      //   setIsDeleting(false);
      //   setShowDeleteConfirmation(false);
      //   onClose();
      //   Toast.show({
      //     type: "success",
      //     text1: "Success",
      //     text2: "Service deleted successfully",
      //     position: "bottom",
      //     visibilityTime: 2000,
      //   });
      // }, 2000);

      // return;

      axiosInstance.delete(`/service/delete?serviceId=${serviceId}&userId=${user._id}`)
      .then((response) => {
        setShowDeleteConfirmation(false);
        onClose();
        refetch(); // Refetch the services list after deletion

        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.message,
          position: "bottom",
          visibilityTime: 2000,
        });
      })
      .catch((error) => {
        console.error("Error deleting service:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to delete service",
          position: "bottom",
          visibilityTime: 2000,
        });
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <View className="flex-1">
      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{
          backgroundColor: "#070f1b",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: "90%",
        }}
        indicatorStyle={{
          width: 50,
          marginVertical: 10,
          backgroundColor: "black",
        }}
        gestureEnabled={true}
        onClose={onClose}
        statusBarTranslucent={true}
        keyboardHandlerEnabled={true}
      >
        <View className="px-4 pt-4 pb-2 flex-row justify-between items-center border-b border-gray-800">
          <View>
            <Text className="text-xl font-bold text-white">
              Service Actions
            </Text>
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
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleAction(item)}
              className="flex-row items-center p-6"
              activeOpacity={0.7}
            >
              <View className="mr-4">{item.icon}</View>
              <Text
                className={`text-base ${
                  item.danger ? "text-red-400 font-medium" : "text-gray-200"
                }`}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-gray-800 mx-4" />
          )}
        />
      </ActionSheet>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-[#131c2e] p-6 rounded-2xl w-[80%] shadow-lg">
            <Text className="text-white text-xl font-bold mb-4">
              Delete Service
            </Text>
            <Text className="text-gray-300 mb-6">
              Are you sure you want to delete this service? This action cannot
              be undone.
            </Text>
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setShowDeleteConfirmation(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-gray-700"
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteService}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 flex-row items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-medium ml-2">
                      Deleting...
                    </Text>
                  </>
                ) : (
                  <Text className="text-white font-medium">Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ServiceManageModal;
