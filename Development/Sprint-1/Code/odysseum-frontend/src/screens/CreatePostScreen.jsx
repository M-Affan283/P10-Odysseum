import { View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native'
import {useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '../components/FormField'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Toast from 'react-native-toast-message';
import axiosInstance from '../utils/axios';
import useUserStore from '../context/userStore';
import Carousel from '../components/Carousel';

const CreatePostScreen = () => {
  const FormData = global.FormData;
  // const [firstImage, setFirstImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    caption: "",
    media: []
  });

  const user = useUserStore((state) => state.user); //for id

  const removeAllMedia = () =>
  {
    // setFirstImage(null);
    setForm({ ...form, media: [] });
    console.log("Media Removed")
  }

  const removeSingleMedia = (index) =>
  {
    let newMedia = form.media.filter((media, i) => i !== index);
    setForm({ ...form, media: newMedia });
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

    // console.log(result);
    if (!result.canceled)
    {
      // console.log(result);
      //old code
      // if(form.media.length===0) setFirstImage(result.assets[0].uri);
      // setForm({ ...form, media: [...form.media, ...result.assets] });
      //

      try
      {
        //compress images
        const compressedImages = await Promise.all(result.assets.map(async (asset) => {
          //if size > 6mb, compress or maybe compress based on image dimensions.
          if(asset.fileSize > 3*1024*1024)
          {
            let compressedImage = await ImageManipulator.manipulateAsync(
              asset.uri,
              [],
              { compress: 0.5 }
            );

            // console.log("Compressed Image: ", compressedImage);
            return {...asset, uri: compressedImage.uri};
          };
          return asset;
        }));
          
        //if no media, set first image
        // if(form.media.length === 0) setFirstImage(result.assets[0].uri);
        setForm({ ...form, media: [...form.media, ...compressedImages] });
      }
      catch(error)
      {
        console.log(error);
        alert("An error occurred: " + error.message);
        setForm({ ...form, media: [] });
      }
    }
  }

  const submitForm = async () =>
  {
    if(form.caption === "" || form.media.length === 0)
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
    formData.append("caption", form.caption);

    //later change to handle multiple media
    // formData.append('media', {
    //   uri: Platform.OS === 'android' ? form.media[0].uri : form.media[0].uri.replace('file://', ''),
    //   type: form.media[0].mimeType,
    //   name: form.media[0].fileName
    // })

    //for multiple media
    form.media.forEach((media)=>
    {
      formData.append('media', {
        uri: Platform.OS === 'android' ? media.uri : media.uri.replace('file://', ''),
        type: media.mimeType,
        name: media.fileName
      })
    })

    try
    {
      axiosInstance.post("/post/create", formData, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((res) => {
        console.log(res.data);
        // setUploading(false);
        setForm({ caption: "", media: [] });

        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Success",
          text2: "Post created successfully",
          visibilityTime: 2000,
        });

      })
      .catch((err) => {
        console.log(err);
        alert("An error occurred: " + err.response.data.message);
        // setUploading(false);

        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error",
          text2: err.response.data.message,
          visibilityTime: 2000,
        });
      })
      .finally(() => {
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

            {/* if no form media then show button */}
            { form.media.length === 0 ? (
              <TouchableOpacity onPress={pickMedia} className="mt-4">
                <View className="w-full h-40 px-4 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center">
                  <View className="w-14 h-14 border border-dashed border-secondary-100 flex justify-center items-center">
                    <MaterialIcons name="file-upload" size={24} color="black" />
                  </View>
                </View>
              </TouchableOpacity>
            ):
              (
                //convert this into carousel instead of showing only first image.
                <>
                  <View className="my-5">
                    <Carousel imagesUri={form.media.map((media) => media.uri)} />
                  </View>
                  {/* <Image source={{uri: firstImage}} style={{width: "100%", height: 200, borderRadius: 10}} resizeMode='contain'/> */}
                  <Text className="text-gray-100">
                    {form.media.length > 1 ? `${form.media.length} media files` : '1 media file'}
                    {/* display total size too in MB*/}
                    {/* {form.media.reduce((acc, curr) => acc + curr.fileSize, 0)/(1024*1024)} MB */}
                  </Text>
                  
                  <Text className="text-[#8C00E3] mt-2 font-medium" onPress={removeAllMedia}>Remove all media</Text>
                </>
              )
            }

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