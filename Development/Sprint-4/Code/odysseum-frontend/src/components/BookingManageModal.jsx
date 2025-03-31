import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import ActionSheet from "react-native-actions-sheet";
import { XMarkIcon } from "react-native-heroicons/outline";
import { TrashIcon, CheckCircleIcon, XCircleIcon } from "react-native-heroicons/solid";
import useUserStore from "../context/userStore";
import axiosInstance from "../utils/axios";
import Toast from "react-native-toast-message";

const BookingManageModal = ({ booking, visible, setVisible }) => {
  const actionSheetRef = React.useRef();
  const [currentView, setCurrentView] = useState('main'); // 'main', 'approve', 'reject', 'cancel'
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  const user = useUserStore((state) => state.user);

  console.log(user._id)

  const onClose = () => {
    if (currentView !== 'main') {
      // Return to main options
      setCurrentView('main');
      setStatusMessage(null);
    } else {
      setVisible(false);
    }
  };

  useEffect(() => {
    if (visible) {
      actionSheetRef.current?.setModalVisible(true);
    } else {
      actionSheetRef.current?.setModalVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    // Reset state when modal is closed
    if (!visible) {
      setCurrentView('main');
      setLoading(false);
      setStatusMessage(null);
    }
  }, [visible]);

  // Approve booking
  const handleApprove = async () => {
    setLoading(true);
    try {
      console.log("Approving booking: ", booking._id);
      const response = await axiosInstance.post('/booking/approve', {
        bookingId: booking._id,
        userId: user._id,
        serviceId: booking.serviceId,
      });
      
      console.log("Booking approved: ", response.data.booking);
      Toast.show({
        type: 'success',
        text1: 'Booking Approved',
        text2: `Booking ${response.data.booking._id} has been approved.`,
      });
      
      setStatusMessage({
        type: 'success',
        text: 'Booking approved successfully!'
      });
      
      // Close modal after successful action
      setTimeout(() => {
        setVisible(false);
      }, 1500);
    } 
    catch (error) {
      console.log("Error approving booking: ", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to approve booking.',
      });
      
      setStatusMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to approve booking.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reject booking
  const handleReject = async () => {
    setLoading(true);
    try {
      console.log("Rejecting booking: ", booking._id);
      const response = await axiosInstance.post('/booking/reject', {
        bookingId: booking._id,
        userId: user._id,
        serviceId: booking.serviceId,
      });
      
      console.log("Booking rejected: ", response.data.booking);
      Toast.show({
        type: 'success',
        text1: 'Booking Rejected',
        text2: `Booking ${response.data.booking._id} has been rejected.`,
      });
      
      setStatusMessage({
        type: 'success',
        text: 'Booking rejected successfully!'
      });
      
      // Close modal after successful action
      setTimeout(() => {
        setVisible(false);
      }, 1500);
    } catch (error) {
      console.log("Error rejecting booking: ", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to reject booking.',
      });
      
      setStatusMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reject booking.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Main options view
  const renderMainView = () => (
    <>
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center border-b border-gray-800">
        <View>
          <Text className="text-xl font-bold text-white">Booking Actions</Text>
          <Text className="text-blue-400 text-sm">{booking?.service || booking?._id || 'Booking'}</Text>
        </View>
        <TouchableOpacity 
          onPress={onClose}
          className="p-2 bg-gray-800 rounded-full"
        >
          <XMarkIcon size={20} color="#60a5fa" />
        </TouchableOpacity>
      </View>

      <View className="py-4">
        <TouchableOpacity
          onPress={() => setCurrentView('approve')}
          className="flex-row items-center p-6"
          activeOpacity={0.7}
        >
          <View className="mr-4">
            <CheckCircleIcon size={35} color="#34d399" />
          </View>
          <Text className="text-base text-gray-200">
            Approve Booking
          </Text>
        </TouchableOpacity>
        
        <View className="h-px bg-gray-800 mx-4" />
        
        <TouchableOpacity
          onPress={() => setCurrentView('reject')}
          className="flex-row items-center p-6"
          activeOpacity={0.7}
        >
          <View className="mr-4">
            <XCircleIcon size={35} color="#ef4444" />
          </View>
          <Text className="text-base text-red-400 font-medium">
            Reject Booking
          </Text>
        </TouchableOpacity>
        
        <View className="h-px bg-gray-800 mx-4" />
        
      </View>
    </>
  );

  // Approve confirmation view
  const renderApproveView = () => (
    <>
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center border-b border-gray-800">
        <View>
          <Text className="text-xl font-bold text-white">Confirm Approval</Text>
          <Text className="text-blue-400 text-sm">{booking?._id || 'Booking'}</Text>
        </View>
        <TouchableOpacity 
          onPress={onClose}
          className="p-2 bg-gray-800 rounded-full"
        >
          <XMarkIcon size={20} color="#60a5fa" />
        </TouchableOpacity>
      </View>

      <View className="p-6 items-center">
        <View className="mb-4">
          <CheckCircleIcon size={35} color="#34d399" />
        </View>
        
        <Text className="text-lg text-white text-center mb-6">
          Are you sure you want to approve this booking?
        </Text>

        {statusMessage && (
          <View className={`p-3 rounded-lg mb-6 w-full ${statusMessage.type === 'success' ? 'bg-green-900' : 'bg-red-900'}`}>
            <Text className={`text-center ${statusMessage.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
              {statusMessage.text}
            </Text>
          </View>
        )}

        <View className="flex-row w-full justify-center space-x-4">
          {!loading && statusMessage?.type !== 'success' && (
            <>
              <TouchableOpacity 
                onPress={onClose}
                className="px-6 py-3 rounded-lg bg-gray-800"
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleApprove}
                className="px-6 py-3 rounded-lg bg-blue-600"
              >
                <Text className="text-white font-medium">Confirm</Text>
              </TouchableOpacity>
            </>
          )}
          
          {loading && (
            <View className="p-3">
              <ActivityIndicator size="large" color="#60a5fa" />
            </View>
          )}
        </View>
      </View>
    </>
  );

  // Reject confirmation view
  const renderRejectView = () => (
    <>
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center border-b border-gray-800">
        <View>
          <Text className="text-xl font-bold text-white">Confirm Rejection</Text>
          <Text className="text-blue-400 text-sm">{booking?._id || 'Booking'}</Text>
        </View>
        <TouchableOpacity 
          onPress={onClose}
          className="p-2 bg-gray-800 rounded-full"
        >
          <XMarkIcon size={20} color="#60a5fa" />
        </TouchableOpacity>
      </View>

      <View className="p-6 items-center">
        <View className="mb-4">
          <XCircleIcon size={35} color="#ef4444" />
        </View>
        
        <Text className="text-lg text-white text-center mb-6">
          Are you sure you want to reject this booking?
        </Text>

        {statusMessage && (
          <View className={`p-3 rounded-lg mb-6 w-full ${statusMessage.type === 'success' ? 'bg-green-900' : 'bg-red-900'}`}>
            <Text className={`text-center ${statusMessage.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
              {statusMessage.text}
            </Text>
          </View>
        )}

        <View className="flex-row w-full justify-center space-x-4">
          {!loading && statusMessage?.type !== 'success' && (
            <>
              <TouchableOpacity 
                onPress={onClose}
                className="px-6 py-3 rounded-lg bg-gray-800"
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleReject}
                className="px-6 py-3 rounded-lg bg-red-600"
              >
                <Text className="text-white font-medium">Confirm</Text>
              </TouchableOpacity>
            </>
          )}
          
          {loading && (
            <View className="p-3">
              <ActivityIndicator size="large" color="#60a5fa" />
            </View>
          )}
        </View>
      </View>
    </>
  );

  // Render the appropriate view based on current state
  const renderContent = () => {
    switch (currentView) {
      case 'approve':
        return renderApproveView();
      case 'reject':
        return renderRejectView();
      default:
        return renderMainView();
    }
  };

  return (
    <View className="flex-1">
      <ActionSheet 
        ref={actionSheetRef}
        containerStyle={{backgroundColor: '#070f1b', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '90%'}}
        indicatorStyle={{width: 50, marginVertical: 10, backgroundColor: 'black'}}
        gestureEnabled={currentView === 'main'} // Only enable gesture on main view
        onClose={onClose}
        statusBarTranslucent={true}
        keyboardHandlerEnabled={true}
      >
        {renderContent()}
      </ActionSheet>
    </View>
  );
};

export default BookingManageModal;