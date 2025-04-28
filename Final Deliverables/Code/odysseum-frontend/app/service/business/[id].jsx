import { View, Text } from "react-native";
import React from "react";
import BusinessServiceScreen from "../../../src/screens/BusinessServiceScreen";
import { useLocalSearchParams } from "expo-router";

const BusinessServices = () => {
    const { id, name } = useLocalSearchParams();

  return (
    <BusinessServiceScreen businessId={id} businessName={name} />
  );
};

export default BusinessServices;
