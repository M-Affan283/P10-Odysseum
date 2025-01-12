import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import ActionSheet, { ScrollView } from 'react-native-actions-sheet';
import useUserStore from '../context/userStore';
import Toast from 'react-native-toast-message';
import StarRating from 'react-native-star-rating-widget';
import { PhotoIcon } from 'react-native-heroicons/solid';

const AddReviewModal = ({entityId, entityType, entityName, visible, setVisible}) => {

  const FormData = global.FormData
  const user = useUserStore((state) => state.user);
  const actionSheetRef = React.useRef();

  const [form, setForm] = useState({
    title: "",
    reviewContent: "",
    rating: 0,
    media: []
  })
  const [uploading, setUploading] = useState(false);

  const closeForm = () =>
  {
    setForm({ title: "", reviewContent: "", rating: 0, media: [] });
    setVisible(false);
  }

  const pickMedia = async () => {}

  const submitReview = async () =>
  {
    if(form.title === "" || form.reviewContent === "" || form.rating === 0)
    {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error",
        text2: "Please fill in all fields",
        visibilityTime: 2000,
      });
      return;
    }  

    setUploading(true);

    let formData = new FormData();

    formData.append("creatorId", user._id);
    formData.append("entityType", entityType);
    formData.append("entityId", entityId);
    formData.append("title", form.title);
    formData.append("reviewContent", form.reviewContent);
    formData.append("rating", form.rating);

    form.media.forEach((media)=>
    {
      formData.append('media', {
        uri: Platform.OS === 'android' ? media.uri : media.uri.replace('file://', ''),
        type: media.mimeType,
        name: media.fileName
      })
    });

    axiosInstance.post("/review/add", formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((res) => {
      console.log(res.data);
      setUploading(false);
      setForm({ title: "", reviewContent: "", rating: 0, media: [] });
      Toast.show({
        type: "success",
        position: "bottom",
        text1: "Success",
        text2: "Review Posted successfully",
        visibilityTime: 2000,
      });
      setVisible(false);
    })
    .catch((err) => {
      console.log(err);
      setUploading(false);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error",
        text2: "An error occurred. Please try again.",
        visibilityTime: 2000,
      });

      setUploading(false);
    })
  }


  useEffect(()=>
  {
    if(visible) actionSheetRef.current?.setModalVisible(true);
    else actionSheetRef.current?.setModalVisible(false);
  },[visible])

  useEffect(()=>
  {
    console.log("Form: ", form);
  }, [form])

  return (
    <View className="flex-1">

      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30}}
        indicatorStyle={{width: 50, marginVertical: 10, backgroundColor: 'black'}}
        gestureEnabled={true} //check if disabling this and adding a cancel button is better UI
        onClose={closeForm}
        statusBarTranslucent={true}
        keyboardHandlerEnabled={true}
      >

        <ScrollView className="p-2">

          <Text className="text-2xl font-bold text-center mt-5">Add Review</Text>
          <Text className="text-center text-gray-500">Reviewing {entityName}</Text>

          <View className="flex flex-row justify-between items-center mt-5 px-5">
            <Text className="text-lg">Rating</Text>
            <StarRating rating={form.rating} onChange={(rating) => setForm({...form, rating})} />
          </View>

          <View className="mt-5">
            <TextInput
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })} 
              placeholder="Add a title..."
              placeholderTextColor={"gray"}
              className="w-full p-3 text-lg font-semibold"
              // multiline={true}
              maxLength={15}
              style={{textAlignVertical: 'top', borderRadius: 15}}
            />

          </View>

          <View className="mt-5">
            <TextInput
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })} 
                placeholder="Add your thoughts..."
                placeholderTextColor={"gray"}
                className="w-full p-3 text-base"
                multiline={true}
                maxLength={150}
                style={{textAlignVertical: 'top', borderRadius: 15}}
              />
          </View>

          {
            form.media.length === 0 ? (
              <View className="gap-4 mt-5 px-3">
                <TouchableOpacity onPress={pickMedia} className="justify-center items-center">
                  <View className="p-2 rounded-full bg-[#c389e8]">
                    <PhotoIcon size={30} color="black" />
                  </View>
                  <Text className="font-medium">Add your photos</Text>
                </TouchableOpacity>
              </View>
            )
            :
            (
              <Text className="text-center mt-5">Media added</Text>
            )
          }

          <TouchableOpacity
            className="bg-[#8C00E3] mx-auto w-3/4 min-h-[50px] rounded-full flex-row justify-center items-center mt-10"
            // onPress={submitForm}
            disabled={uploading}
          >
            <Text className={`text-white font-semibold text-lg`}>
              {uploading ? "Sharing..." : "Share Review"}
            </Text>
          </TouchableOpacity>

        </ScrollView>
        
      </ActionSheet>

    </View>
  )
}

export default AddReviewModal