import os
import firebase_admin
from firebase_admin import credentials, storage
from pymongo import MongoClient
import glob
from urllib.parse import quote

# Firebase setup
def initialize_firebase():
    cred = credentials.Certificate("./config/firebaseConfig.json")
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'odysseumstorage.appspot.com'
    })
    bucket = storage.bucket()
    return bucket

# MongoDB setup
def connect_to_mongodb():
    MONGO_URI = "mongodb+srv://group10sproj:9kThEps69Fj3hOHM@odysseummaincluster.luwmn.mongodb.net/OdysseumDatabase?retryWrites=true&w=majority&appName=OdysseumMainCluster"
    client = MongoClient(MONGO_URI)
    db = client["OdysseumDatabase"]
    collection = db["Business"]
    return collection

# Upload images to Firebase and update MongoDB
def upload_images_and_update_db(image_directory, bucket, collection):
    # Get all image files from directory
    image_files = glob.glob(os.path.join(image_directory, "*.*"))
    
    # Track the progress
    total_files = len(image_files)
    processed = 0
    updated_businesses = 0
    duplicate_businesses = {}
    
    print(f"Found {total_files} images to process")
    
    for image_path in image_files: #temporarily limit to 1 for testing
        processed += 1
        # Extract business name from filename
        file_name = os.path.basename(image_path)
        business_name_with_underscores = os.path.splitext(file_name)[0]
        
        # Replace underscores with spaces for matching in database
        business_name = business_name_with_underscores.replace('_', ' ')

        # print("new business name: ", business_name)
        # break
        
        # Upload to Firebase
        try:
            # Create a clean destination path in Firebase
            destination_blob_name = f"businesses/{file_name}"
            blob = bucket.blob(destination_blob_name)
            
            # Upload the file
            blob.upload_from_filename(image_path)
            
            # Make the blob publicly accessible
            blob.make_public()
            
            # Get the public URL
            image_url = blob.public_url
            
            print(f"[{processed}/{total_files}] Uploaded {file_name} to Firebase: {image_url}")
            
            # Find all businesses in MongoDB by name and update them
            matching_businesses = list(collection.find({"name": {"$regex": business_name, "$options": "i"}}))
            
            if len(matching_businesses) > 0:
                # If multiple businesses match, record as duplicates
                if len(matching_businesses) > 1:
                    duplicate_businesses[business_name] = len(matching_businesses)
                    print(f"WARNING: Found {len(matching_businesses)} matches for business: {business_name}")
                
                # Update all matching businesses
                update_count = 0
                for business in matching_businesses:
                    result = collection.update_one(
                        {"_id": business["_id"]},
                        {"$push": {"mediaUrls": image_url}}
                    )
                    if result.modified_count > 0:
                        update_count += 1
                
                updated_businesses += update_count
                print(f"Updated {update_count} MongoDB documents for business: {business_name}")
            else:
                print(f"No MongoDB document found matching business: {business_name}")
                
        except Exception as e:
            print(f"Error processing {file_name}: {str(e)}")
    
    print(f"\nSummary:")
    print(f"Total images processed: {processed}")
    print(f"Businesses updated in database: {updated_businesses}")
    
    if duplicate_businesses:
        print("\nDuplicate businesses detected:")
        for business, count in duplicate_businesses.items():
            print(f"  - '{business}': {count} instances")

# Main execution
if __name__ == "__main__":
    # Directory containing images
    image_directory = "./photos2/photos"
    
    # Check if directory exists
    if not os.path.exists(image_directory):
        print(f"Error: Directory {image_directory} not found")
        exit(1)
    
    print("Initializing Firebase connection...")
    bucket = initialize_firebase()
    
    print("Connecting to MongoDB...")
    collection = connect_to_mongodb()
    
    print("Starting upload process...")
    upload_images_and_update_db(image_directory, bucket, collection)
    
    print("Process completed!")
