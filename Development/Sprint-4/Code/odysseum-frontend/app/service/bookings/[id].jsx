import React from "react";
import { useLocalSearchParams } from "expo-router";
import ServiceBookingsScreen from "../../../src/screens/ServiceBookingsScreen";

const ServiceBookings = () => {
  const { id } = useLocalSearchParams();

  return (
    <ServiceBookingsScreen serviceId={id} />
  );
};

export default ServiceBookings;
