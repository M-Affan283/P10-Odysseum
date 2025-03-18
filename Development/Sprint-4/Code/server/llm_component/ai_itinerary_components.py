import pymongo
from langchain_groq import ChatGroq
from langchain.schema import SystemMessage, HumanMessage
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont
import random
import json
import re
import os
import sys

load_dotenv()

def connect_to_db():
    db_client = pymongo.MongoClient(os.getenv("MONGODB_URI_REMOTE"))
    return db_client


def extract_locations_data(db):
    collection = db["Location"]
    locations_data = {doc["name"]: doc["coordinates"]["coordinates"] for doc in collection.find()}
    locations_data = {f"[{index}]": value for index, value in locations_data.items()}
    return locations_data


def extract_business_category_metadata(db):
    collection = db["Business"]
    business_metadata = []
    for doc in collection.find():
        if doc["category"] not in business_metadata:
            business_metadata.append(doc["category"])
    return business_metadata

def extract_business_data(db):
    collection = db["Business"]
    business_data = {doc["name"]: [doc["address"], doc["category"], doc["coordinates"]["coordinates"], doc["averageRating"]] for doc in collection.find()}
    business_data = {f"[{index}]": value for index, value in business_data.items()}
    return business_data

def clean_json_response(response):
    return re.sub(r"```json\n(.*?)\n```", r"\1", response, flags=re.DOTALL).strip()

# Need bigger model for larger capacity
def trim_business_data(business_data, max_tokens=5000):
    all_businesses = [(location, business) for location, business in business_data.items()]
    random.shuffle(all_businesses)    

    estimated_tokens = 0
    filtered_data = {}
    for location, business in all_businesses:
        if location not in filtered_data:
            business_tokens =  len(json.dumps(business))
            if estimated_tokens + business_tokens > max_tokens:
                break

            filtered_data[location] = business
            estimated_tokens += business_tokens

    return filtered_data


def generate_business_location_data(locations_data, business_data, llm_client):
    system_prompt = f"""
    You are an expert in data extraction. Your task is to group businesses under their respective cities.

    Input Data:
    - List of locations: {json.dumps(locations_data, indent=2, ensure_ascii=False)}
    - Dictionary of businesses: {json.dumps(business_data, indent=2, ensure_ascii=False)}

    Instructions:
    - Match businesses to their corresponding location.
    - If a location does not have any businesses, return an empty list.

    Output Format (Strict dictionary):
    Respond with only a valid dictionary, structured like this:
    {{
        "location_name": [
            {{
                "name": "Business Name",
                "address": "Business Address",
                "category": "Business Category",
                "rating": "Business Rating"
                "cooridates": "Location Coordinates"
            }},
            ...
        ]
    }}
    DO NOT return any code, STRICTLY return a DICTIONARY OBJECT
    """

    user_prompt = "Generate the dictionary as instructed."

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]

    response = llm_client.invoke(messages).content
    response = clean_json_response(response)
    return response


def generate_path(question, business_location_data, business_category_data, llm_client):
    system_prompt = f"""
    You are a travel route planner AI that determines the best travel path between locations 
    based on user preferences like distance, rating, and category.

    Input Data:
    - List of locations and businesses: {json.dumps(business_location_data, indent=2, ensure_ascii=False)}
    - List of businesses categories: {json.dumps(business_category_data, indent=2, ensure_ascii=False)}

    Instructions:
    - Analyze the question: "{question}"
    - Determine the [starting location] and [destination].
    - Consider the user's preference (e.g., shortest distance, highest-rated places, specific category) based on the question.
    - Construct a travel path that fits the user's requirements.
    - Each path should have a valid category.
    
    Output Format (Strict Dictionary):
    Respond ONLY with a valid Dictionary object like this:
    {{
        "route": [
            {{  
                "location_number": 1
                "location_name": "Next Stop"
                "address": "Location Address"
                "rating": "Business rating"
                "cooridates": "Location Coordinates"
                "category": "Business Category"
                "from": "Previous Location"
                "distance_km": 12.5
            }},
            {{
               "location_number": 2
                "location_name": "Next Stop"
                "address": "Location Address"
                "rating": "Business rating"
                "cooridates": "Location Coordinates"
                "category": "Business Category"
                "from": "Previous Location"
                "distance_km": 10.5
            }}
        ],
        "total_distance_km": 21.2
    }}
    ```
    DO NOT add explanations. Only return the Dictionary.
    """

    user_prompt = "Generate the travel path based on the given question."

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]

    response = llm_client.invoke(messages).content
    response = clean_json_response(response)
    return response

def format_route(generated_path):
    route_dict = json.loads(generated_path) 
    route = ""
    for key, value in route_dict.items():
        if isinstance(value, list): 
            for route_metadata in value:
                route += f"\n    [Stop {route_metadata['location_number']}]:"
                route += f"\n        Location: {route_metadata['location_name']}"
                route += f"\n        Address: {route_metadata['address']}"
                route += f"\n        Category: {route_metadata['category']}"
                route += f"\n        Rating: {route_metadata['rating']}"
                route += f"\n        Distance from previous stop: {route_metadata['distance_km']} km\n"
        else:  
            route += f"\nTotal Distance: {value} km\n"
    return route

def overlay_text_on_template(route, template_path):
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template image not found: {template_path}")

    template = Image.open(template_path)  
    draw = ImageDraw.Draw(template)
    font = ImageFont.truetype("verdana.ttf", 30)
    x, y = 50, 250
    for line in route.split("\n"):
        draw.text((x, y), line, fill="black", font=font)
        y += 35
    output_path = "user_itinerary.png"
    template.save(output_path)
    return output_path


TEMPLATES = {
    "1": "./templates\Doc1.png",
    "2": "./templates/Doc2.png",
    "3": "./templates/Doc3.png",
}

if __name__ == "__main__":
    question = sys.argv[1]
    template_idx = sys.argv[2]
    
    template_path = TEMPLATES.get(template_idx)

    # Connecting to DB
    db_client = connect_to_db()
    db = db_client["OdysseumDatabase"]

    # LLM model
    model_name="llama-3.1-8b-instant"
    llm_client = ChatGroq(model=model_name)

    # Extracting data and useful metadata
    locations_data = extract_locations_data(db)
    business_data = extract_business_data(db)
    business_category_data = extract_business_category_metadata(db)

    business_data = trim_business_data(business_data)   # Comment out when we have bigger model

    business_location_data = generate_business_location_data(locations_data, business_data, llm_client)
    generated_path = generate_path(question, business_location_data, business_category_data, llm_client)

    route = format_route(generated_path)
    itineray_path = overlay_text_on_template(route, template_path)

    print(json.dumps({"image_path": os.path.abspath(itineray_path)}))