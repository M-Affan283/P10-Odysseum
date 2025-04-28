import { View, Text } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import ServiceCreateScreen from "../../../../src/screens/ServiceCreateScreen";

const CreateService = () => {

  const { createId } = useLocalSearchParams();

  return (
    <ServiceCreateScreen businessId={createId} />
  );

};

export default CreateService;
