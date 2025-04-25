import pandas as pd
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://group10sproj:9kThEps69Fj3hOHM@odysseummaincluster.luwmn.mongodb.net/OdysseumDatabase?retryWrites=true&w=majority&appName=OdysseumMainCluster"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["OdysseumDatabase"]
collection = db["Business"]

csv_file_path = "businesses___data.csv"
df = pd.read_csv(csv_file_path)

# Convert CSV Data into MongoDB Format
businesses_to_upload = []
for _, row in df.iterrows():
    business = {
        "name": row["name"],
        "address": row["address"],
        "category": row["category"],
        "coordinates": {
            "type": "Point",
            "coordinates": [row["lng"], row["lat"]]
        },
        "averageRating": row["rating"] if pd.notna(row["rating"]) else 0.0,
        "contactInfo": {
            "phone": row["phone"] if pd.notna(row["phone"]) else None,
            "website": row["website"] if pd.notna(row["website"]) else None
        },
        "mediaUrls": [],
        "status": "Approved",
        "locationId": None
    }
    businesses_to_upload.append(business)

# Insert Data in Batches
BATCH_SIZE = 100
for i in range(0, len(businesses_to_upload), BATCH_SIZE):
    batch = businesses_to_upload[i : i + BATCH_SIZE]
    collection.insert_many(batch)
    print(f" Inserted batch {i // BATCH_SIZE + 1} ({len(batch)} records)")

client.close()
print(" All data successfully uploaded to MongoDB!")
