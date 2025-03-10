import { Tabs } from 'expo-router';
import { MapIcon } from "react-native-heroicons/solid";
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
                }}
            >
                <Tabs.Screen
                    name="templates"
                    options={{
                        title: "Templates",
                        tabBarIcon: ({ color }) => <MapIcon size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="create"
                    options={{
                        title: "Create",
                        tabBarIcon: ({ color }) => <MapIcon size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="AI_create"
                    options={{
                        title: "AI Create",
                        tabBarIcon: ({ color }) => <MapIcon size={24} color={color} />,
                    }}
                />
            </Tabs>
        </TemplateContext.Provider>
    );
};

export default ItineraryLayout;