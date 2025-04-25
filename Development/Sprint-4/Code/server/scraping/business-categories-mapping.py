import pymongo

def update_business_categories():
    # Allowed target categories 
    ALLOWED_CATEGORIES = [
        "Restaurant", "Hotel", "Shopping", "Fitness",
        "Health", "Beauty", "Education", "Entertainment",
        "Services", "Other"
    ]
    
    # Mapping from raw category values to the allowed target categories.
    category_mapping = {
        "Restaurant": "Restaurant",
        "restaurant": "Restaurant",
        "asian_restaurant": "Restaurant",
        "fast_food_restaurant": "Restaurant",
        "pizza_restaurant": "Restaurant",
        "steak_house": "Restaurant",
        "bar": "Restaurant",
        "cafe": "Restaurant",
        "coffee_shop": "Restaurant",
        "amusement_park": "Entertainment",
        "historical_landmark": "Entertainment",
        "hiking_area": "Entertainment",
        "museum": "Entertainment",
        "national_park": "Entertainment",
        "park": "Entertainment",
        "tourist_attraction": "Entertainment",
        "guest_house": "Hotel",
        "hostel": "Hotel",
        "hotel": "Hotel",
        "resort_hotel": "Hotel",
        "lodging": "Hotel",
        "motel": "Hotel",
        "cottage": "Hotel",
        "car_rental": "Services",
        "food_court": "Restaurant",
        "point_of_interest": "Other",
        "natural_feature": "Other"
    }
    
    MONGO_URI = "mongodb+srv://group10sproj:9kThEps69Fj3hOHM@odysseummaincluster.luwmn.mongodb.net/OdysseumDatabase?retryWrites=true&w=majority&appName=OdysseumMainCluster"
    
    print("Connecting to MongoDB instance...")
    client = pymongo.MongoClient(MONGO_URI)
    db = client["OdysseumDatabase"]
    collection = db["Business"]  
    
    print("Retrieving documents from the collection...")
    cursor = collection.find({})
    docs = list(cursor)
    total_docs = len(docs)
    print(f"Total documents found: {total_docs}\n")
    
    updated_count = 0
    processed_count = 0
    
    print("=== Starting Document Updates ===\n")
    
    for doc in docs:
        processed_count += 1
        doc_id = doc.get("_id")
        old_category = doc.get("category")
        
        # Determine new category using mapping (defaulting to "Other" if not found)
        new_category = category_mapping.get(old_category, "Other")
        
        # Perform update if required
        if new_category != old_category:
            result = collection.update_one(
                {"_id": doc_id},
                {"$set": {"category": new_category}}
            )
            if result.modified_count == 1:
                print(f"[{processed_count}/{total_docs}] Updated Document _id={doc_id}: '{old_category}' -> '{new_category}'")
                updated_count += 1
            else:
                print(f"[{processed_count}/{total_docs}] Document _id={doc_id} update unsuccessful.")
        else:
            print(f"[{processed_count}/{total_docs}] No update needed for Document _id={doc_id} (category: '{old_category}').")
        
        # Progress update every 10 documents
        if processed_count % 10 == 0:
            print(f"Processed {processed_count} of {total_docs} documents...\n")
    
    print("\n=== Update Process Complete ===")
    print(f"Total documents processed: {processed_count}")
    print(f"Total documents updated: {updated_count}")

if __name__ == "__main__":
    update_business_categories()
