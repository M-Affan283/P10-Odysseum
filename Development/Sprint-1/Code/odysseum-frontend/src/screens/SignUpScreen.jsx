import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../components/FormField";
import Toast from "react-native-toast-message";
import axios from "axios"; //change to custom axios instance later


const SignUpScreen = () => {
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false); //to show loading spinner and disable button
  const [error, setError] = useState("");

  const submitForm = () => {
    console.log(form);

    // if (!form.firstName || !form.lastName || !form.email || !form.username || !form.password) {
    //   setError("All fields are required");
    //   return;
    // }

    setSubmitting(true);

    axios.post("http://192.168.68.67:8000/api/user/register", form)

    .then((res) =>
    {
        if (res.data.success) 
        {
            //navigate to login screen
            console.log(res.data);

            Toast.show({
              type: "success",
              position: "top",
              text1: "Sign Up Successful",
              text2: "You can now login to your account. Redirecting...",
              visibilityTime: 3000,
            })

            setTimeout(() => {
              router.replace("/sign-in");
            }, 3000);
        }
        setSubmitting(false);
    })
    .catch((err) => 
    {
        //display error message in screen
        console.log(err);
        // setError(err.response.message);
        Toast.show({
          type: "error",
          position: "bottom",
          text1: "Sign Up Failed",
          text2: "Please try again later",
          visibilityTime: 3000,
        })
        setSubmitting(false);
    });
  };

  return (
    <SafeAreaView className="h-full" style={{ backgroundColor: "#161622" }}>
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          {/* change min-h-[85vh] to h-full if not working */}
          <Text className="text-2xl font-semibold text-white mt-10">
            Sign Up Odysseum
          </Text>

          <FormField
            title="First Name"
            placeholder="First Name"
            value={form.firstName}
            handleChangeText={(text) => setForm({ ...form, firstName: text })}
            otherStyles="mt-10"
          />

          <FormField
            title="Last Name"
            placeholder="Last Name"
            value={form.lastName}
            handleChangeText={(text) => setForm({ ...form, lastName: text })}
            otherStyles="mt-7"
            keyboardType="default"
          />

          <FormField
            title="Email"
            placeholder="Email"
            value={form.email}
            handleChangeText={(text) => setForm({ ...form, email: text })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Username"
            placeholder="Username"
            value={form.username}
            handleChangeText={(text) => setForm({ ...form, username: text })}
            otherStyles="mt-7"
            keyboardType="default"
          />

          <FormField
            title="Password"
            placeholder="Password"
            value={form.password}
            handleChangeText={(text) => setForm({ ...form, password: text })}
            otherStyles="mt-7"
            keyboardType="default"
          />

          <TouchableOpacity
            className="bg-[#8C00E3] rounded-xl min-h-[62px] flex flex-row justify-center items-center mt-10"
            onPress={submitForm}
            disabled={submitting}
          >
            <Text className={`text-primary font-semibold text-lg`}>
              {submitting ? "Signing Up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-regular">
              Have an account?
            </Text>
            <Link
              href="sign-in"
              className="text-lg font-semibold text-[#8C00E3]"
            >
              Sign in
            </Link>
          </View>

        {error && (
            <Text className="text-red-500 text-center mt-5">{error}</Text>
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;