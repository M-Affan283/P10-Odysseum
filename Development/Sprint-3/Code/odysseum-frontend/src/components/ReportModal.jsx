import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import ActionSheet, { ScrollView } from 'react-native-actions-sheet';
import useUserStore from '../context/userStore';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';

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

  const submitReport = async () =>
  {
      setUploading(true);

      if(reportReason === "")
      {
        Toast.show({
          type: "error",
          position: "top",
          text1: "Error",
          text2: "Please fill in all fields",
          visibilityTime: 2000,
        });
        return;
      }

      if(reportType === "User")
      {
        try
        {
          const response = await axiosInstance.post("/user/report", {
            reportedUserId: entityId,
            reportingUserId: user._id,
            reason: reportReason
          });

          if (response.data.success) 
          {
            Toast.show({
                type: 'success',
                position: 'bottom',
                text1: 'Report submitted successfully',
                visibilityTime: 3000,
            });

            setUploading(false);
            closeForm();
          }
        }
        catch(error)
        {
          console.log('Error submitting report:', error.response?.data || error);
          Toast.show({
              type: 'error',
              position: 'bottom',
              text1: 'Failed to submit report',
              text2: error.response?.data?.message || error.message,
              visibilityTime: 3000,
          });
          setUploading(false);
          closeForm();
        }
      }
      else
      {
        try
        {
          const response = await axiosInstance.post("/post/report", {
            reportedPostId: entityId,
            reportingUserId: user._id,
            reason: reportReason
          });

          if (response.data.success)
          {
            Toast.show({
                type: 'success',
                position: 'bottom',
                text1: 'Report submitted successfully',
                visibilityTime: 3000,
            });

            setUploading(false);
            closeForm();
          }
      }
      catch(error)
      {
        console.log('Error submitting report:', error.response?.data || error);
        Toast.show({
            type: 'error',
            position: 'bottom',
            text1: 'Failed to submit report',
            text2: error.response?.data?.message,
            visibilityTime: 3000,
        });
        setUploading(false);
        closeForm();
      }
    }
  }

  useEffect(()=>
  {
    if(visible) actionSheetRef.current?.setModalVisible(true);
    else actionSheetRef.current?.setModalVisible(false);
  },[visible])

  return (
    <View className="flex-1">
      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{backgroundColor: '#070f1b', borderTopLeftRadius: 30, borderTopRightRadius: 30}}
        indicatorStyle={{width: 50, marginVertical: 10, backgroundColor: 'white'}}
        gestureEnabled={true} //check if disabling this and adding a cancel button is better UI
        onClose={closeForm}
        statusBarTranslucent={true}
        keyboardHandlerEnabled={true}
      >
        <ScrollView className="p-5">

          <Text className="text-2xl text-white font-bold text-center mt-5">Report {reportType}</Text>

          <TextInput
            placeholder="Reason for reporting"
            placeholderTextColor={'gray'}
            value={reportReason}
            onChangeText={(text)=>setReportReason(text)}
            multiline={true}
            numberOfLines={4}
            className="p-2 mt-5 rounded-xl border-2 border-gray-400 text-white"
          />

          <TouchableOpacity onPress={submitReport} disabled={uploading} className="bg-[#8C00E3] mx-auto w-3/4 min-h-[50px] rounded-full flex-row justify-center items-center mt-10">
            {
              uploading ?
              (
                <LottieView
                  source={require('../../assets/animations/Loading2.json')}
                  autoPlay
                  loop
                  style={{width: 50, height: 50}}
                />
              )
              :
              (
                <Text className={`text-white font-semibold text-lg`}>Submit Report</Text>
              )
            }
          </TouchableOpacity>
        </ScrollView>

      </ActionSheet>
    </View>
  )
}

export default ReportModal