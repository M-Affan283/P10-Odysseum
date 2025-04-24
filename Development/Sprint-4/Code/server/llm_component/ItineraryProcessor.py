import pymongo
from langchain_groq import ChatGroq
from langchain.schema import SystemMessage, HumanMessage
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont
import random
import json
import re
import os
from openai import AzureOpenAI

load_dotenv(dotenv_path="../config.env")

CATEGORIES = ['restaurant', 'entertainment', 'services', 'hotel', 'other']

def create_llm_client():
    return AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version="2025-03-01-preview",
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
    )

def connect_to_db():
    db_client = pymongo.MongoClient(os.getenv("MONGODB_URI_REMOTE"))
    return db_client

def extract_locations_data(db):
    collection = db["Location"]
    locations_data = {doc["name"]: doc["coordinates"]["coordinates"] for doc in collection.find()}
    locations_data = {f"[{index}]": value for index, value in locations_data.items()}
    return locations_data

def extract_business_data(db):
    collection = db["Business"]
    business_data = {doc["name"]: [doc["address"], doc["category"], doc["coordinates"]["coordinates"], doc["averageRating"]] for doc in collection.find()}
    business_data = {f"[{index}]": value for index, value in business_data.items()}
    return business_data

def extract_business_category_metadata(db):
    collection = db["Business"]
    business_metadata = []
    for doc in collection.find():
        if doc["category"] not in business_metadata:
            business_metadata.append(doc["category"])
    return business_metadata

def generate_business_location_data_algorithm(locations_data, business_data):
    # Initialize result dictionary with empty lists for each location
    result = {location_name.strip("[]"): [] for location_name in locations_data.keys()}
    
    # Convert location coordinates to a more accessible format
    location_coords = {}
    for loc_name, coords in locations_data.items():
        clean_name = loc_name.strip("[]")
        location_coords[clean_name] = coords
    
    # Process each business
    for business_key, business_value in business_data.items():
        business_name = business_key.strip("[]")
        business_address = business_value[0] if len(business_value) > 0 else ""
        business_category = business_value[1] if len(business_value) > 1 else ""
        business_coords = business_value[2] if len(business_value) > 2 else None
        business_rating = business_value[3] if len(business_value) > 3 else "N/A"
        
        # Find the closest location based on coordinates if available
        if business_coords:
            closest_location = find_closest_location(business_coords, location_coords)
            
            # Add business to the matched location
            if closest_location:
                result[closest_location].append({
                    "name": business_name,
                    "address": business_address,
                    "category": business_category,
                    "rating": business_rating,
                    "coordinates": business_coords
                })
    
    return result

def find_closest_location(business_coords, location_coords):
    if not business_coords:
        return None
    
    closest_location = None
    min_distance = float('inf')
    
    for location_name, coords in location_coords.items():
        if coords:
            # Calculate Euclidean distance
            distance = calculate_distance(business_coords, coords)
            
            if distance < min_distance:
                min_distance = distance
                closest_location = location_name
    
    return closest_location

def calculate_distance(coords1, coords2):
    if not coords1 or not coords2:
        return float('inf')
    
    try:
        # Assuming coordinates are [longitude, latitude]
        return ((coords1[0] - coords2[0]) ** 2 + (coords1[1] - coords2[1]) ** 2) ** 0.5
    except (TypeError, IndexError):
        return float('inf')
    
def generate_optimized_business_data(locations_data, business_data, optimization, top_n=5):
    # First, grouping all businesses by location
    all_businesses_by_location = generate_business_location_data_algorithm(locations_data, business_data)
    result = {}
    
    # For each location, filter the top N businesses based on optimization criteria
    for location, businesses in all_businesses_by_location.items():
        result[location] = {category: [] for category in CATEGORIES}

        if not businesses:
            continue
        
        for category in CATEGORIES:
            filtered = [
                b for b in businesses if b.get('category', '').lower() == category
            ]

            # Sorting businesses based on optimization criteria
            if optimization.lower() == 'ratings':
                sorted_businesses = sorted(filtered, key=lambda x: float(x.get('rating', 0) or 0), reverse=True)

            elif optimization.lower() == 'distance':
                central_point = find_central_point(location, locations_data)
                sorted_businesses = sorted(filtered, key=lambda x: calculate_distance(x.get('coordinates'), central_point))
            
            else:
                sorted_businesses = sorted(filtered, key=lambda x: float(x.get('rating', 0) or 0), reverse=True)
            
            result[location][category] = sorted_businesses[:top_n]
    return result

def find_central_point(location_name, locations_data):
    for loc_name, coords in locations_data.items():
        clean_name = loc_name.strip("[]")
        if clean_name == location_name and coords:
            return coords
    return [0, 0]  

def get_itinerary_recommendations(itinerary, optimized_data):
    result = {}
    for dst in itinerary.get('destinations', ''):
        location = dst.get('name')
        result[location] = {}

        stops = dst.get('stops')
        for stop in stops:
            stop_category = stop.get('category')
            top_n_stops = optimized_data[location][stop_category]
            result[location][stop_category] = top_n_stops
    return result

def run(itinerary, optimization):
    db_client = connect_to_db()
    db = db_client["OdysseumDatabase"]

    locations_data = extract_locations_data(db)
    business_data = extract_business_data(db)
    optimized_data = generate_optimized_business_data(locations_data, business_data, optimization)
    itinerary_recommendations = get_itinerary_recommendations(itinerary, optimized_data)
    return itinerary_recommendations