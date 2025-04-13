import os
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd
from geopy.distance import geodesic  # Used for coordinate-based matching

# Load environment variables

# Connect to MongoDB
MONGO_URI = "mongodb+srv://group10sproj:9kThEps69Fj3hOHM@odysseummaincluster.luwmn.mongodb.net/OdysseumDatabase?retryWrites=true&w=majority&appName=OdysseumMainCluster"
client = MongoClient(MONGO_URI)
db = client["OdysseumDatabase"]
business_collection = db["Business"]
location_collection = db["Location"]
csv_file_path = "businesses___data.csv"
df = pd.read_csv(csv_file_path)
# Fetch all locations & create a mapping with coordinates
locations = list(location_collection.find({}, {"_id": 1, "name": 1, "coordinates": 1}))
location_map = {
    loc["name"]: {
        "id": loc["_id"],
        "coords": tuple(loc["coordinates"]["coordinates"][::-1])  # Convert GeoJSON [lng, lat] -> (lat, lng)
    }
    for loc in locations
}

# Function to get `locationId` based on closest coordinates
def get_closest_location(lat, lng):
    if pd.isna(lat) or pd.isna(lng):  # If missing lat/lng, return None
        return None
    
    business_coords = (lat, lng)
    closest_location = min(
        location_map.items(),
        key=lambda loc: geodesic(business_coords, loc[1]["coords"]).meters
    )
    return closest_location[1]["id"]

# Update Businesses with Correct `locationId`
updated_count = 0
for _, row in df.iterrows():
    if pd.notna(row["lat"]) and pd.notna(row["lng"]):  # Ensure coordinates exist
        location_id = get_closest_location(row["lat"], row["lng"])

        if location_id:
            result = business_collection.update_many(
                {"coordinates.coordinates": [row["lng"], row["lat"]]},  # Match businesses using coordinates
                {"$set": {"locationId": location_id}}
            )
            updated_count += result.modified_count

print(f" Updated {updated_count} businesses with `locationId` using coordinates!")

# Close Connection
client.close()