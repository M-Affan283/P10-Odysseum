import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../components/FormField";
import Toast from "react-native-toast-message";
import useUserStore from "../context/userStore";
import axiosInstance from "../utils/axios";


const LoginScreen = () => {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const setUser = useUserStore((state)=> state.setUser);
  // const user = useUserStore((state)=> state.user);
  // const logout = useUserStore((state)=> state.logout);

  const [submitting, setSubmitting] = useState(false); //to show loading spinner and disable button
  const [error, setError] = useState("");

  const submitForm = () => {
    console.log(form);

    setSubmitting(true);

    axiosInstance.post("/user/login", form)
    .then(async (res) => {
      if (res.data.success) {
        //get user from zustand store and update it
        //store access token in secure store
        //navigate to home screen

        await setUser(res.data.user);
        
        // await logout();
        // router.dismissAll(); //dismiss all screens
        router.replace("/home");
        console.log("LOGGED IN USER")

        //if user ie new take to screen where user can update profile (add bio, profile picture etc) otherwise take to home screen
        // res.data.user.newUser ? router.replace("/update-profile") : router.replace("/home");
      }
    })
    .catch((err) => {
      //display error message in screen
      console.log(err);
      setError(err.response.data.message);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: err.response.data.message,
        visibilityTime: 3000,
      })
    })
    .finally(() => {
      setSubmitting(false);
    });
  };

  return (
    <SafeAreaView className="h-full" style={{ backgroundColor: "#161622" }}>
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          {/* change min-h-[85vh] to h-full if not working */}
          <Text className="text-2xl font-semibold text-white mt-10">
            Log in to Odysseum
          </Text>

          <FormField
            title="Email/Username"
            placeholder="Enter your email or username"
            value={form.identifier}
            handleChangeText={(text) => setForm({ ...form, identifier: text })}
            otherStyles="mt-7"
            // keyboardType=
          />
          <FormField
            title="Password"
            placeholder="Password"
            value={form.password}
            handleChangeText={(text) => setForm({ ...form, password: text })}
            otherStyles="mt-7"
            keyboardType="password"
          />

          <TouchableOpacity
            className="bg-[#8C00E3] rounded-xl min-h-[62px] flex flex-row justify-center items-center mt-10"
            onPress={submitForm}
            disabled={submitting}
          >
            <Text className={`text-white font-semibold text-lg`}>
              {submitting ? "Logging in..." : "Log in"}
            </Text>
          </TouchableOpacity>

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-regular">
              Don't have an account?
            </Text>
            <Link
              href="sign-up"
              className="text-lg font-semibold text-[#8C00E3]"
            >
              Sign up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
