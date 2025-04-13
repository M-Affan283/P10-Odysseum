import os
from pymongo import MongoClient
from dotenv import load_dotenv
import pandas as pd


MONGO_URI = "mongodb+srv://group10sproj:9kThEps69Fj3hOHM@odysseummaincluster.luwmn.mongodb.net/OdysseumDatabase?retryWrites=true&w=majority&appName=OdysseumMainCluster"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["OdysseumDatabase"]
location_collection = db["Location"]


locations_data = {
    "Chitral, KPK": [71.7864, 35.8516],  # [longitude, latitude]
    "Nathia Gali, KPK": [73.3833, 34.0667],
    "Murree, Punjab": [73.3943, 33.9070],
    "Fairy Meadows, Gilgit-Baltistan": [74.5821, 35.4383],
    "Swat, KPK": [72.4258, 35.2220]
}

# Update each location
for location_name, coordinates in locations_data.items():
    result = location_collection.update_one(
        {"name": location_name},
        {"$set": {"coordinates": {"type": "Point", "coordinates": coordinates}}}
    )
    print(f" Updated {result.modified_count} document(s) for {location_name}")

client.close()
print(" All locations successfully updated with correct coordinates!")