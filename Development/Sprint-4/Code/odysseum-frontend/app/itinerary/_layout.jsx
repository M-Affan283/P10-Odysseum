import { Tabs } from 'expo-router';
import { MapIcon, PencilIcon, SparklesIcon, ClipboardIcon } from "react-native-heroicons/solid";
import React, { createContext, useState } from "react";

export const TemplateContext = createContext();

const ItineraryLayout = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <TemplateContext.Provider value={{ selectedTemplate, setSelectedTemplate }}>
      <Tabs
        screenOptions={{
          tabBarStyle: { backgroundColor: "#1b2738", borderTopWidth: 0 },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Templates",
            tabBarIcon: ({ color }) => <MapIcon size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create_itinerary"
          options={{
            title: "Itinerary",
            tabBarIcon: ({ color }) => <PencilIcon size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create_itinerary_with_ai"
          options={{
            title: "ItineraryAI",
            tabBarIcon: ({ color }) => <PencilIcon size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create_itinerary_planner"
          options={{
            title: "Itinerary Planner",
            tabBarIcon: ({ color }) => <ClipboardIcon size={24} color={color} />,
          }}
        />
      </Tabs>
    </TemplateContext.Provider>
  );
};

export default ItineraryLayout;
