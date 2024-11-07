import { View, Text, Image } from "react-native";
import { Tabs, Redirect } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

//In the main screen we will have 5 bottom tabs. Home, Inbox, Createm and Profile and one extra which will come later.
// Like tiktok, the progile page will have the user profile data and then tabs in them for the user to look at their post, saved posts, liked posts, etc.

const TabIcon = ({ icon, name, color, focused }) => {
  return (
    <View className="items-center justify-center gap-2">
      <MaterialIcons name={icon} size={24} color={color} className="w-6 h-6" />
      <Text className={`${focused ? "font-semibold" : "font-normal"} text-xs`}>
        {name}
      </Text>
    </View>
  );
};

const tabs = [
  {
    name: "Home",
    icon: "home",
    // component: Home,
  },
  {
    name: "Inbox",
    icon: "message",
    // component: Inbox,
  },
  {
    name: "Create",
    icon: "add",
    // component: Create,
  },
  {
    name: "Profile",
    icon: "person",
    // component: Profile,
  },
]

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false, // Hide labels as they are being shown in the TabIcon component
           
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon="home"
                name="Home"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
