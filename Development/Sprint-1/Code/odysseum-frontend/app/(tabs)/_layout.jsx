import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons'; // imporing icons from Expo's vector icons

// Importing screens
import HomeScreen from './HomeScreen';

export default function TabLayout() {
  return (
    <Tabs
        screenOptions={{
            // tabBarShowLabel: false,             // hides the labels. Only icons will be displayed.
            tabBarActiveTintColor: 'blue',      // changes the color of the active tab icon.
            tabBarInactiveTintColor: 'gray',    // changes the color of remaining inactive tab icons.
        }}
    >
        {/* Home Screen Tab */}
        <Tabs.Screen 
            name="HomeScreen"   // .jsx file name for screen
            options={{
                title: 'Home',  // title that will be shown in the header (if headerShown: true)
                headerShown: false, 
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="home" size={size} color={color} />
                )
            }}
        />

        {/* Inbox Screen Tab */}
        <Tabs.Screen 
            name="InboxScreen" 
            options={{
                title: 'Inbox',   
                headerShown: false, 
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="mail" size={size} color={color} />
                )
            }}
        />

        {/* Create Screen Tab */}
        <Tabs.Screen 
            name="CreateScreen" 
            options={{
                title: 'Create',   
                headerShown: false, 
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="photo" size={size} color={color} />
                )
            }}
        />

        {/* Profile Screen Tab */}
        <Tabs.Screen 
            name="ProfileScreen" 
            options={{
                title: 'Profile',   
                headerShown: false, 
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="person" size={size} color={color} />
                )
            }}
        />
    </Tabs>
  );
}
