import React from "react";
import { useLocalSearchParams } from "expo-router";
import BusinessProfileScreen from "../../../src/screens/BusinessProfileScreen";

const SingleBusiness = () => {

  const { id } = useLocalSearchParams();

  return (
    <BusinessProfileScreen businessId={id} />
  );
};

export default SingleBusiness;
