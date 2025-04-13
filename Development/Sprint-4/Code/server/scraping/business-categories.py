import pymongo

def list_unique_categories():
    MONGO_URI = "mongodb+srv://group10sproj:9kThEps69Fj3hOHM@odysseummaincluster.luwmn.mongodb.net/OdysseumDatabase?retryWrites=true&w=majority&appName=OdysseumMainCluster"
    
    client = pymongo.MongoClient(MONGO_URI)
    db = client["OdysseumDatabase"]
    collection = db["Business"]  
    
    unique_categories = collection.distinct("category")
    
    print("Unique categories found in the collection:")
    for category in unique_categories:
        print(f" - {category}")

if __name__ == "__main__":
    list_unique_categories()
