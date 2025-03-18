import { View, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import ActionSheet, { ScrollView } from 'react-native-actions-sheet';
import useUserStore from '../context/userStore';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ReportModal = ({ reportType, entityId, visible, setVisible }) => {
  // Functionality for reporting a post or a user
  const [reportReason, setReportReason] = useState("");
  const [uploading, setUploading] = useState(false);
  const user = useUserStore((state) => state.user);
  const actionSheetRef = React.useRef();

  const closeForm = () => {
    setReportReason("");
    setVisible(false);
  }

  const submitReport = async () => {
    setUploading(true);

    if (reportReason.trim() === "") {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Please fill in all fields",
        visibilityTime: 2000,
      });
      setUploading(false);
      return;
    }

    try {
      const endpoint = reportType === "User" ? "/user/report" : "/post/report";
      const payload = {
        [reportType === "User" ? "reportedUserId" : "reportedPostId"]: entityId,
        reportingUserId: user._id,
        reason: reportReason
      };

      const response = await axiosInstance.post(endpoint, payload);

      if (response.data.success) {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Report submitted successfully',
          visibilityTime: 3000,
        });
        setUploading(false);
        closeForm();
      }
    } catch (error) {
      console.log('Error submitting report:', error.response?.data || error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Failed to submit report',
        text2: error.response?.data?.message || error.message,
        visibilityTime: 3000,
      });
      setUploading(false);
    }
  }

  useEffect(() => {
    if (visible) actionSheetRef.current?.setModalVisible(true);
    else actionSheetRef.current?.setModalVisible(false);
  }, [visible]);

  return (
    <View className="flex-1">
      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{ backgroundColor: '#0A0E1A', borderTopLeftRadius: 30, borderTopRightRadius: 30 }}
        indicatorStyle={{ width: 50, marginVertical: 10, backgroundColor: 'rgba(255,255,255,0.5)' }}
        gestureEnabled={true}
        onClose={closeForm}
        statusBarTranslucent={true}
        keyboardHandlerEnabled={true}
      >
        <LinearGradient
          colors={['#0A0E1A', '#101829']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-5 pb-10"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl text-white font-bold text-center ml-4">
              Report {reportType}
            </Text>
            <TouchableOpacity onPress={closeForm} className="p-2">
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="bg-[#1A1F2E] rounded-xl p-1 mt-4 border border-[#2A304A]">
            <TextInput
              placeholder="Describe why you're reporting this content..."
              placeholderTextColor={'#9CA3AF'}
              value={reportReason}
              onChangeText={(text) => setReportReason(text)}
              multiline={true}
              numberOfLines={6}
              className="p-3 rounded-xl text-white"
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
          </View>

          <TouchableOpacity 
            onPress={submitReport}
            disabled={uploading}
            className="mx-auto w-full rounded-full mt-10 overflow-hidden"
            style={{ maxWidth: width * 0.8 }}
          >
            <LinearGradient
              colors={['#8C00E3', '#5D00E6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="min-h-[56px] flex-row justify-center items-center"
            >
              {uploading ? (
                <LottieView
                  source={require('../../assets/animations/Loading2.json')}
                  autoPlay
                  loop
                  style={{ width: 50, height: 50 }}
                />
              ) : (
                <Text className="text-white font-semibold text-lg">Submit Report</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </ActionSheet>
    </View>
  );
};

export default ReportModal;