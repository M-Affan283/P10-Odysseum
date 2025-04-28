import React from "react";
import { useLocalSearchParams } from "expo-router";
import UserBookingProfileScreen from "../../../src/screens/UserBookingProfileScreen";

const UserBookingProfile = () => {
  const { id } = useLocalSearchParams();

  return (
    <UserBookingProfileScreen bookingId={id} />
  );
};

export default UserBookingProfile;
