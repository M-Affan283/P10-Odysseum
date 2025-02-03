import React from "react";
import { useLocalSearchParams } from "expo-router";
import BusinessLocationScreen from "../../../src/screens/BusinessLocationScreen";
import { Text, View } from "react-native";

const LocationBusiness = () => {

  const { id, name } = useLocalSearchParams();

  // console.log('id:', id);
  // console.log('name:', name);

  return (
    <BusinessLocationScreen locationId={id} locationName={name}/>
  );
};

export default LocationBusiness;
