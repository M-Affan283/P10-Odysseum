import { View, Text, Image } from "react-native";
import { Tabs, Redirect } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

//In the main screen we will have 5 bottom tabs. Home, Inbox, Createm and Profile and one extra which will come later.
// Like tiktok, the progile page will have the user profile data and then tabs in them for the user to look at their post, saved posts, liked posts, etc.

const TabIcon = ({ icon, name, color, focused }) => {
  return (
    <View className="items-center justify-center gap-2">
      <MaterialIcons name={icon} size={24} color={color} className="w-6 h-6" />
      <Text className={`${focused ? "font-semibold" : "font-normal"} text-xs items-center justify-center`} style={{color: color}}>
        {name}
      </Text>
    </View>
  );
};

const tabs = [
  {
    name: "home",
    icon: "home",
    // component: Home,
  },
  {
    name: "inbox",
    icon: "inbox",
    // component: Inbox,
  },
  {
    name: "create",
    icon: "add",
    // component: Create,
  },
  {
    name: "profile",
    icon: "person",
    // component: Profile,
  },
];

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false, // Hide labels as they are being shown in the TabIcon component
          tabBarActiveTintColor: "#800080",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarStyle: {
            backgroundColor: "#161622",
            borderTopWidth: 1,
            borderTopColor: "#232533",
            height: 50,
          }
        }}
      >
        {tabs.map((tab, index) => (
          <Tabs.Screen
            key={index}
            name={tab.name}
            options={{
              title: tab.name.charAt(0).toUpperCase() + tab.name.slice(1),
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={tab.icon}
                  name={tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
                  color={color}
                  focused={focused}
                />
              ),
            }}
          />
        ))}
      </Tabs>
    </>
  );
};

export default TabsLayout;
