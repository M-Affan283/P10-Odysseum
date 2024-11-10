import { View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native'
import {useState, useEffect} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '../components/FormField'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import useUserStore from '../context/userStore';

const CreatePostScreen = () => {
  const FormData = global.FormData;
  const [firstImage, setFirstImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    caption: "",
    media: []
  });

  const user = useUserStore((state) => state.user); //for id

  const removeAllMedia = () =>
  {
    setFirstImage(null);
    setForm({ ...form, media: [] });
  }

  const pickMedia = async () =>
  {

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync(); //ask for permission. if already granted, it will return granted

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });

    console.log(result);
    if (!result.canceled)
    {
      // console.log(result);
      if(form.media.length === 0)
      {
        setFirstImage(result.assets[0].uri);
      }

      setForm({ ...form, media: [...form.media, ...result.assets] });
    }

  }

  const submitForm = async () =>
  {
    if(form.caption === "" || form.media.length === 0)
    {
      alert("Please fill all fields");
      return;
    }

    setUploading(true);
  
    let formData = new FormData();

    formData.append("creatorId", user._id);
    formData.append("caption", form.caption);

    //later change to handle multiple media
    formData.append('media', {
      uri: Platform.OS === 'android' ? form.media[0].uri : form.media[0].uri.replace('file://', ''),
      type: form.media[0].mimeType,
      name: form.media[0].fileName
    })

    try
    {
      axios.post("http://192.168.68.67:8000/api/post/create", formData, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((res) => {
        console.log(res.data);
        setUploading(false);
        setForm({ caption: "", media: [] });
      })
      .catch((error) => {
        console.log(error);
        alert("An error occurred: " + error.message);
        setUploading(false);
      })
      
    }
    catch(error)
    {
      console.log(error);
      alert("An error occurred: " + error.message);
      setUploading(false);
    }
    
  }

  return (
    <SafeAreaView className="bg-primary h-full">

      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-semibold">
          Create a new post
        </Text>

        <FormField title="Caption" placeholder="Write a caption" value={form.caption} handleChangeText={(text) => setForm({ ...form, caption: text })} otherStyles="mt-10" />

        <View className="mt-10">
          <Text className="text-base text-gray-100 font-medium">Upload media</Text>

          <TouchableOpacity onPress={pickMedia} className="mt-4">
            {/* if no form media then show button */}
            { form.media.length === 0 ? (
                <View className="w-full h-40 px-4 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center">
                  <View className="w-14 h-14 border border-dashed border-secondary-100 flex justify-center items-center">
                    <MaterialIcons name="file-upload" size={24} color="black" />
                  </View>
                </View>
            ):
              (
                <>
                  <Image source={{uri: firstImage}} style={{width: "100%", height: 200, borderRadius: 10}} />
                  <Text className="text-gray-100">
                    {form.media.length > 1 ? `${form.media.length} media files` : '1 media file'}
                  </Text>
                  
                  <Text className="text-[#8C00E3] mt-2 font-medium" onPress={removeAllMedia}>Remove all media</Text>
                </>
              )
            }
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#8C00E3] rounded-xl min-h-[62px] flex flex-row justify-center items-center mt-10"
            onPress={submitForm}
            disabled={uploading}
          >
            <Text className={`text-white font-semibold text-lg`}>
              {uploading ? "Uploading..." : "Create post"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
        
    </SafeAreaView>
  )
}

export default CreatePostScreen