import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import WelcomeScreen from "../src/screens/WelcomeScreen";
import UserProfileScreen from "../src/screens/UserProfileScreen";

export default function App() {
  return (
    <>
      <WelcomeScreen />
      {/* <UserProfileScreen /> */}
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
}
