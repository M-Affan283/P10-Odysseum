import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../components/FormField";
import axios from "axios"; //change to custom axios instance later
import useUserStore from "../context/userStore";
import { setAccessToken } from '../utils/tokenUtils';
import axiosInstance from "../utils/axios";


const LoginScreen = () => {
    const [form, setForm] = useState({
        identifier: "",
        password: "",
    });

    const setUser = useUserStore((state) => state.setUser);
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
                    // Store the access token
                    await setAccessToken(res.data.accessToken);

                    // Set user in store
                    await setUser(res.data.user);

                    router.dismissAll();
                    router.replace("/home"); 
                    console.log("LOGGED IN USER")
                }
                setSubmitting(false);
            })
            .catch((err) => {
                console.log(err);
                setError(err.response.data.message);
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

                    {error && (
                        <Text className="text-red-500 text-center mt-5">{error}</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default LoginScreen;
