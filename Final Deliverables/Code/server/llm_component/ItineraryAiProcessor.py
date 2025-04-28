import os
import re
import json
import pymongo
from openai import AzureOpenAI
from geopy.distance import geodesic
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="../config.env")

STOP_CATEGORIES = ["hotel", "restaurant", "entertainment", "services"]

def create_llm_client():
    """Create an Azure OpenAI client."""
    return AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version="2025-03-01-preview",
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
    )

def connect_to_db():
    """Connect to MongoDB database."""
    return pymongo.MongoClient(os.getenv("MONGODB_URI_REMOTE"))

def extract_locations_data(db):
    """Extract location data from the database."""
    collection = db["Location"]
    locations_data = {doc["name"]: doc["coordinates"]["coordinates"] for doc in collection.find()}
    locations_data = {f"[{index}]": value for index, value in locations_data.items()}
    return locations_data

def extract_business_data(db):
    """Extract business data from the database."""
    collection = db["Business"]
    business_data = {doc["name"]: [doc["address"], doc["category"], 
                                  doc["coordinates"]["coordinates"], doc["averageRating"]] 
                     for doc in collection.find()}
    business_data = {f"[{index}]": value for index, value in business_data.items()}
    return business_data

def extract_business_category_metadata(db):
    """Extract unique business categories from the database."""
    collection = db["Business"]
    business_metadata = []
    for doc in collection.find():
        if doc["category"] not in business_metadata:
            business_metadata.append(doc["category"])
    return business_metadata

def clean_json_response(response):
    """Clean JSON responses from the LLM."""
    return re.sub(r"```json\n(.*?)\n```", r"\1", response, flags=re.DOTALL).strip()

def predict_user_locations_and_optimization(locations_data, query, llm_client, optimization_type="rating"):
    """Use LLM to predict locations and optimization preferences from query."""
    valid_optimization_types = ["rating", "cost", "distance"]

    system_prompt = f"""
    You are an expert in data extraction and natural language processing. Your task is to figure out the most likely destinations for the user based on their query and the provided list of locations.
    The user wants to prioritize destinations based on {optimization_type}.

    Input Data:
    - List of locations: {json.dumps(locations_data, indent=2, ensure_ascii=False)}
    - User query: "{query}"
    - Optimization Types: {valid_optimization_types}

    Instructions:
    - Analyze the query to determine which locations from the list are most relevant to the user's request.
    - Return a list of the most likely destinations based on the query
    - Return the optimization type. If you cannot figure it out, default to "rating".
    - The response should be a dictionary with the optimization type as key, and a dictionary of location names with coordinates as value.

    Output Format (Strict):
    {{  
        "optimization": "optimization_type"
        "locations": {{
            "Location Name 1": [Latitude1, Longitude1],
            "Location Name 2": [Latitude2, Longitude2],
            ...
        }}
    }}
    """

    response = llm_client.chat.completions.create(
        model="o3-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ]
    )

    return clean_json_response(response.choices[0].message.content)

def predict_stops_and_categories(location_predictions, query, llm_client):
    """Use LLM to predict stop categories and count from query."""
    system_prompt = f"""
    You are a travel assistant. Your task is to extract the number of stops, specific stops (locations), and the types of stops based on the provided query and the list of location predictions.

    Input Data:
    - List of predicted locations: {json.dumps(location_predictions, indent=2, ensure_ascii=False)}
    - User query: "{query}"

    Instructions:
    - Based on the query, identify how many stops the user intends to make.
    - Identify the specific stops (locations) from the predicted locations list that match the query.
    - Determine the types of stops (e.g., "hotel", "restaurant", "entertainment", "services") based on the query.

    Output Format (Strict dictionary):
    - A dictionary with the following structure:
    {{
        "number_of_stops": <int>,
        "stops": [
            {{
                "category": "Type of Stop (e.g., hotel, restaurant, entertainment, services)"
            }},
            ...
        ]
    }}
    """

    user_prompt = f"""
    Query: {query}
    Based on the list of predicted locations, please identify:
    1. The number of stops the user intends to make.
    2. The specific stops (locations) from the list that match the user's query.
    3. The category or type of each stop (e.g., hotel, restaurant, entertainment, services).
    """

    response = llm_client.chat.completions.create(
        model="o3-mini", 
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    return clean_json_response(response.choices[0].message.content)

def get_top_businesses_by_category(business_data, optimization_criteria='rating', top_n=5):
    """Generate a dictionary of top businesses by category."""
    categorized_businesses = {}
    
    # Group businesses by category
    for business_name, details in business_data.items():
        address, category, coordinates, rating = details
        
        if category not in categorized_businesses:
            categorized_businesses[category] = []
        
        categorized_businesses[category].append({
            'name': business_name.strip('[]'),
            'address': address,
            'category': category,
            'rating': rating,
            'coordinates': coordinates
        })
    
    # Sort businesses by optimization criteria
    top_businesses = {}
    for category, businesses in categorized_businesses.items():
        if optimization_criteria.lower() == 'rating':
            sorted_businesses = sorted(businesses, key=lambda x: x['rating'], reverse=True)
        else:
            # Default to rating if criteria not supported
            sorted_businesses = sorted(businesses, key=lambda x: x['rating'], reverse=True)
        
        top_businesses[category] = sorted_businesses[:top_n]
    
    return top_businesses

def generate_itinerary(optimization, location_predictions, stop_predictions, top_businesses):
    """Generate a formatted itinerary avoiding duplicate locations."""
    # Parse stop_predictions if it's a string
    if isinstance(stop_predictions, str):
        try:
            stop_predictions = json.loads(stop_predictions)
        except json.JSONDecodeError:
            stop_predictions = {
                "number_of_stops": 1,
                "stops": [{"category": "restaurant"}]
            }
    
    # Extract route locations
    route_locations = list(location_predictions.keys())
    start_location = route_locations[0].strip('[]').split(',')[0]  
    end_location = route_locations[1].strip('[]').split(',')[0] if len(route_locations) > 1 else None
    
    # Get coordinates
    start_coords = location_predictions[route_locations[0]]
    end_coords = location_predictions[route_locations[1]] if len(route_locations) > 1 else None
    
    # Calculate midpoint
    if end_coords:
        midpoint = [(start_coords[1] + end_coords[1])/2, (start_coords[0] + end_coords[0])/2]
    else:
        midpoint = [start_coords[1], start_coords[0]] 
    
    # Select stops avoiding duplicates
    selected_stops = []
    used_locations = set()
    
    for stop in stop_predictions["stops"]:
        category = stop["category"].capitalize()
        
        if category in top_businesses:
            scored_candidates = []
            
            for business in top_businesses[category]:
                # Skip if already used
                location_key = f"{business['coordinates'][0]},{business['coordinates'][1]}"
                if location_key in used_locations:
                    continue
                
                # Calculate distance score
                business_coords = [business['coordinates'][1], business['coordinates'][0]]
                try:
                    distance = geodesic(midpoint, business_coords).km
                    normalized_distance = distance / 100 if distance > 0 else 0
                except:
                    normalized_distance = 10
                
                # Combined score (rating - distance penalty)
                score = business['rating'] - normalized_distance
                scored_candidates.append((business, score))
            
            # Sort by score
            scored_candidates.sort(key=lambda x: x[1], reverse=True)
            
            # Select best candidate
            if scored_candidates:
                best_business = scored_candidates[0][0]
                selected_stops.append(best_business)
                
                # Mark as used
                location_key = f"{best_business['coordinates'][0]},{best_business['coordinates'][1]}"
                used_locations.add(location_key)
    
    # Calculate total route distance
    total_distance = None
    if end_coords:
        try:
            start_geopy = [start_coords[1], start_coords[0]]
            end_geopy = [end_coords[1], end_coords[0]]
            total_distance = geodesic(start_geopy, end_geopy).km
        except:
            pass
    
    # Build itinerary text
    itinerary = f"✨ Journey from {start_location} to {end_location} ✨\n\n"
    itinerary += f"🚩 Starting Point: {start_location}\n"
    itinerary += f"🏁 Destination: {end_location}\n"
    
    if total_distance:
        itinerary += f"📏 Total Distance: {round(total_distance, 1)} km\n"
    
    itinerary += "\n"
    
    if selected_stops:
        itinerary += "📍 Recommended Stops:\n"
        
        for i, stop in enumerate(selected_stops, 1):
            # Calculate distance from start
            stop_coords = [stop['coordinates'][1], stop['coordinates'][0]]
            start_geopy = [start_coords[1], start_coords[0]]
            
            try:
                distance_from_start = geodesic(start_geopy, stop_coords).km
                distance_text = f"(~{round(distance_from_start, 1)} km from start)"
            except:
                distance_text = ""
            
            # Format stop details
            itinerary += f"  {i}. {stop['name']} ({stop['category']}) {distance_text}\n"
            itinerary += f"     Rating: {'⭐' * round(stop['rating'])} ({stop['rating']}/5)\n"
            itinerary += f"     Address: {stop['address']}\n\n"
    else:
        itinerary += "No stops were selected for this itinerary.\n"
    
    itinerary += "Happy travels! 🚗💨"
    
    return itinerary

def run(query):
    """Main function to generate an itinerary from a user query."""
    # Connect to resources
    db_client = connect_to_db()
    db = db_client["OdysseumDatabase"]
    llm_client = create_llm_client()

    # Extract data
    locations_data = extract_locations_data(db)
    business_data = extract_business_data(db)

    # Generate predictions
    predictions = predict_user_locations_and_optimization(locations_data, query, llm_client)
    predictions = json.loads(predictions)
    optimization = predictions["optimization"]
    location_predictions = predictions["locations"]  

    # Predict stops and categories
    stop_predictions = predict_stops_and_categories(location_predictions, query, llm_client)
    stop_predictions = json.loads(stop_predictions)

    # Get business data and generate itinerary
    top_businesses = get_top_businesses_by_category(business_data, optimization)
    generated_itinerary = generate_itinerary(optimization, location_predictions, stop_predictions, top_businesses)

    # Close database connection
    db_client.close()

    return generated_itinerary