import ReviewsScreen from "../../../src/screens/ReviewsScreen";
import { useLocalSearchParams } from "expo-router";

const LocationReviews = () => {
    const { id, name } = useLocalSearchParams();

    console.log("Id: ", id, " Name: ", name);

    return (
        <ReviewsScreen entityType={"Location"} entityId={id} entityName={name} />
    )
}

export default LocationReviews