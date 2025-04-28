import ReviewsScreen from "../../../src/screens/ReviewsScreen";
import { useLocalSearchParams } from "expo-router";

const BusinessReviews = () => {
    const { id, name } = useLocalSearchParams();

    console.log("Id: ", id, " Name: ", name);

    return (
        <ReviewsScreen entityType={"Business"} entityId={id} entityName={name} />
    )
}

export default BusinessReviews