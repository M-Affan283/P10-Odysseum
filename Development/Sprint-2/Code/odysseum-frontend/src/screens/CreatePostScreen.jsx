import { View, Text, ScrollView, TouchableOpacity, Image, Platform, TextInput } from 'react-native';
import {useState, useRef} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Toast from 'react-native-toast-message';
import axiosInstance from '../utils/axios';
import useUserStore from '../context/userStore';
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { FolderPlusIcon, MapIcon, TrashIcon } from 'react-native-heroicons/solid';
import { useSharedValue } from 'react-native-reanimated';
import LocationsModal from '../components/LocationsModal';
import LottieView from 'lottie-react-native';

const CreatePostScreen = () => {
  const FormData = global.FormData;
  const [uploading, setUploading] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  
  const [form, setForm] = useState({
    caption: "",
    media: [],
    location: null,
  });

  const carouselRef = useRef(null);
  const progress = useSharedValue(0);

  const onPressPagination = (index) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true
    })
  }

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

    if (permissionResult.granted === false)
    {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });


    if (!result.canceled)
    {

      try
      {
        //compress images
        const compressedImages = await Promise.all(result.assets.map(async (asset) => {
          //if size > 3mb, compress or maybe compress based on image dimensions.
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
          

        setForm({ ...form, media: [...compressedImages] });
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
    if(form.caption === "" || form.media.length === 0 || form.location === null)
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
    formData.append("locationId", form.location._id);

    // handles single media
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

    // console.log("Form Data: ", formData);
    // setUploading(false);

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
        
        setForm({ caption: "", media: [], location: null });

        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Success",
          text2: "Post created successfully",
          visibilityTime: 2000,
        });

        setUploading(false);

      })
      .catch((err) => {
        console.log(err.response.data);

        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Error",
          text2: err.response.data.message,
          visibilityTime: 2000,
        });

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
    <SafeAreaView className="bg-[#070f1b] h-full">
      
      <ScrollView className="px-4 py-6" contentContainerStyle={{paddingBottom: 40}}>

        <Text className="text-xl text-white font-semibold text-center mb-4">Create Post</Text>

        <View className="mt-5">

          { form.media.length === 0 ? (
            <TouchableOpacity onPress={pickMedia} className="p-4 rounded-lg flex items-center justify-center">
              <FolderPlusIcon size={70} color="#fff" />
              <Text className="text-white text-center font-bold">Add Media</Text>
            </TouchableOpacity>
          )
          :
          (
            <>
              <View className="flex-1 items-center my-5">
                  <Carousel
                    data={form.media.map((media) => media.uri)}
                    loop={true}
                    ref={carouselRef}
                    width={250}
                    height={300}
                    scrollAnimationDuration={100}
                    style={{alignItems: 'center',justifyContent: 'center'}}
                    onProgressChange={progress}
                    onConfigurePanGesture={(panGesture) => {
                        panGesture.activeOffsetX([-5, 5]);
                        panGesture.failOffsetY([-5, 5]);
                    }}
                    renderItem={({item,index}) => (
                        <View className="items-center">
                            <Image
                                source={{uri: item}}
                                style={{width: 250,height: 300, borderRadius: 15}}
                                resizeMode="cover"
                                />
                            <TouchableOpacity onPress={() => removeSingleMedia(index)} className="absolute top-2 right-2">
                              <TrashIcon size={30} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}
                  />

                  <Pagination.Basic 
                    progress={progress}
                    data={form.media.map((media) => media.uri)}
                    onPress={onPressPagination}
                    size={5}
                    dotStyle={{backgroundColor: 'gray', borderRadius: 100}}
                    activeDotStyle={{backgroundColor: 'white', overflow: 'hidden', aspectRatio: 1, borderRadius: 15}}
                    containerStyle={{gap: 5, marginTop: 20}}
                    horizontal
                  />

                  <View className="flex-row gap-2 mt-5">
                    
                    <Text onPress={pickMedia} className="text-blue-500 font-semibold m-5">Change</Text>

                    <Text className="text-red-600 font-medium" onPress={removeAllMedia}>Remove all</Text>

                  </View>
              </View>
            </>
          )
          }

          <View className="mt-10">
            <TextInput
              value={form.caption}
              onChangeText={(text) => setForm({ ...form, caption: text })}
              placeholder="Add a caption..."
              placeholderTextColor={"gray"}
              className="w-full p-3 text-white text-base"
              multiline={true}
              maxLength={100}
              style={{textAlignVertical: 'top', borderRadius: 15}}
            />

            {
              form.location === null ? (
                <TouchableOpacity className="flex-row mt-2 p-3" onPress={() => setLocationModalVisible(true)}>
                  <MapIcon size={20} color="#fff" />
                  <Text className="text-gray-500 ml-2">Add location</Text>
                </TouchableOpacity>
              )
              :
              (
                <View className="flex-row mt-2 p-3">
                  <MapIcon size={25} color="#fff" />
                  <Text className="text-gray-500 text-base ml-2">{form.location?.name}</Text>

                  <TouchableOpacity onPress={() => setForm({ ...form, location: null })} className="ml-auto">
                    <TrashIcon size={25} color="red" />
                  </TouchableOpacity>
                </View>
              )
            }
          </View>


        </View>

        <TouchableOpacity
          className="bg-[#8C00E3] mx-auto w-1/2 min-h-[50px] rounded-md flex-row justify-center items-center mt-10"
          onPress={submitForm}
          disabled={uploading}
        >
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
              <Text className={`text-white font-semibold text-lg`}>Share Review</Text>
            )

          }
        </TouchableOpacity>
      </ScrollView>

      <LocationsModal visible={locationModalVisible} setVisible={setLocationModalVisible} setForm={setForm} />

    </SafeAreaView>
  )
}

export default CreatePostScreen