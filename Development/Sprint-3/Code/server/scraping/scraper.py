import requests
import json
import os
import time
import pandas as pd

API_KEY = "AIzaSyASOKlU5NHD3TRfUYSsxnGIN3kHsE_B2MY"

#  Locations to search
locations = [
    "hotels in Chitral, KPK",
    "restaurants in Chitral, KPK",
    "tourist attractions in Chitral, KPK",
    "hotels in Nathia Gali, KPK",
    "restaurants in Nathia Gali, KPK",
    "tourist attractions in Nathia Gali, KPK",
    "hotels in Murree, Punjab",
    "restaurants in Murree, Punjab",
    "tourist attractions in Murree, Punjab",
    "hotels in Fairy Meadows, Gilgit-Baltistan",
    "restaurants in Fairy Meadows, Gilgit-Baltistan",
    "tourist attractions in Fairy Meadows, Gilgit-Baltistan",
    "hotels in Swat, KPK",
    "restaurants in Swat, KPK",
    "tourist attractions in Swat, KPK"
]

# Create folder for photos
os.makedirs("photos", exist_ok=True)

#  API URLs
PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places/{}"

#  Store business details
businesses = []

#  Function to fetch businesses
def get_businesses(query):
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.formattedAddress,places.types,places.photos"
    }

    payload = {"textQuery": query}

    response = requests.post(PLACES_SEARCH_URL, headers=headers, json=payload)
    data = response.json()

    if "places" in data:
        for place in data["places"]:
            business_info = {
                "place_id": place["id"],
                "name": place["displayName"]["text"],
                "address": place.get("formattedAddress", "N/A"),
                "lat": place["location"]["latitude"],
                "lng": place["location"]["longitude"],
                "category": place["types"][0] if "types" in place else "N/A",
                "photo_reference": place["photos"][0]["name"] if "photos" in place else None,
                "rating": None,
                "phone": None,
                "website": None,
                "reviews": []
            }
            businesses.append(business_info)

    #  Avoid hitting API rate limits
    time.sleep(1)

#  Fetch businesses for all locations
for location in locations:
    print(f"Fetching businesses for: {location}")
    get_businesses(location)

print(f"Collected {len(businesses)} businesses!")

#  Function to fetch extra details (ratings, reviews, phone no., website)
def get_business_details(place_id):
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "rating,reviews,internationalPhoneNumber,websiteUri"
    }

    url = PLACES_DETAILS_URL.format(place_id)
    response = requests.get(url, headers=headers)
    data = response.json()

    reviews = []
    if "reviews" in data:
        for review in data["reviews"]:
            review_text = review.get("text", {}).get("text", "No Review Text")
            reviews.append(review_text)

    return {
        "rating": data.get("rating", "N/A"),
        "phone": data.get("internationalPhoneNumber", "N/A"),
        "website": data.get("websiteUri", "N/A"),
        "reviews": reviews
    }


# Fetch extra details for each business
for i, business in enumerate(businesses):
    print(f"Fetching details for: {business['name']}")
    details = get_business_details(business["place_id"])
    businesses[i].update(details)
    time.sleep(1)

print("Business details updated!")

# Function to download photos
def download_photo(photo_reference, name):
    if not photo_reference:
        return None

    photo_url = f"https://places.googleapis.com/v1/{photo_reference}/media?maxWidthPx=800&key={API_KEY}"
    response = requests.get(photo_url)

    if response.status_code == 200:
        filename = f"photos/{name.replace(' ', '_')}.jpg"
        with open(filename, "wb") as file:
            file.write(response.content)
        return filename
    return None

#  Download photos for businesses
for i, business in enumerate(businesses):
    print(f"Downloading photo for: {business['name']}")
    if business["photo_reference"]:
        filename = download_photo(business["photo_reference"], business["name"])
        businesses[i]["photo_path"] = filename

print("Photos downloaded!")

#  Save data to CSV
df = pd.DataFrame(businesses)
df.to_csv("businesses___data.csv", index=False)

print("Data saved to businesses___data.csv!")
