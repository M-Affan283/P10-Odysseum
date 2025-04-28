import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import ServiceProfileScreen from "../../../src/screens/ServiceProfileScreen";

const ServiceProfile = () => {
  const { id } = useLocalSearchParams();

  return (
    <ServiceProfileScreen serviceId={id} />
  );
};

export default ServiceProfile;
