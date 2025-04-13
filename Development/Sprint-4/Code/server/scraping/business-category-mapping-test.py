import pymongo

def preview_update_business_categories():
    # Allowed target categories
    ALLOWED_CATEGORIES = [
        "Restaurant", "Hotel", "Shopping", "Fitness",
        "Health", "Beauty", "Education", "Entertainment",
        "Services", "Other"
    ]
    

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
    
    changes_count = 0
    processed_count = 0
    
    print("=== Starting Dry-Run Update Preview ===\n")
    
    for doc in docs:
        processed_count += 1
        doc_id = doc.get("_id")
        old_category = doc.get("category")
        
        # if not found in mapping, default to "Other".
        new_category = category_mapping.get(old_category, "Other")
        
        # Check if the category would be changed.
        if new_category != old_category:
            changes_count += 1
            print(f"[{processed_count}/{total_docs}] Document _id={doc_id}: Change would be applied:")
            print(f"    Old category: {old_category}")
            print(f"    New category: {new_category}\n")
        else:
            print(f"[{processed_count}/{total_docs}] Document _id={doc_id}: No change needed (category remains: {old_category}).")
        
        # Print a progress summary every 10 documents.
        if processed_count % 10 == 0:
            print(f"Processed {processed_count} of {total_docs} documents so far...\n")
    
    print("\n=== Dry-Run Update Preview Complete ===")
    print(f"Total documents processed: {processed_count}")
    print(f"Total documents that would be updated: {changes_count}")

if __name__ == "__main__":
    preview_update_business_categories()
