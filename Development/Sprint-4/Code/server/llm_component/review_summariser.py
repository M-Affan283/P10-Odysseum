import pymongo
from bson import ObjectId
import os
import sys
from pathlib import Path
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

# Get the absolute path to the root directory (server folder)
ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT_DIR / "config.env"

# Load the .env file using absolute path
load_dotenv(dotenv_path=str(ENV_PATH))

# setup mongodb connection
def connect_to_db():
    mongo_uri = os.getenv("MONGODB_URI_REMOTE")
    if not mongo_uri:
        print("WARNING: MONGODB_URI_REMOTE environment variable not found!")
    
    db_client = pymongo.MongoClient(mongo_uri)
    # print(f"MongoDB URI: {mongo_uri}")
    # print(f"GROQ API Key exists: {'Yes' if os.getenv('GROQ_API_KEY') else 'No'}")
    db = db_client['OdysseumDatabase']
    return db

#get latest 20 reviews
def get_reviews_by_business(business_id):
    db = connect_to_db()
    collection = db['Review']
    reviews = list(collection.find({"entityId": ObjectId(business_id)}).sort([("createdAt", -1)]).limit(20))
    return reviews

def get_reviews_by_location(location_id):
    db = connect_to_db()
    collection = db['Review']
    reviews = list(collection.find({"entityId": ObjectId(location_id)}).sort([("createdAt", -1)]).limit(20))
    return reviews


def initialize_llm_client():
    # api_key = get_langchain_api_key()
    # chat_groq = ChatGroq(api_key)
    model_name="llama-3.1-8b-instant"
    llm_client = ChatGroq(model=model_name)
    return llm_client

def summarise_reviews(reviews):
    llm_client = initialize_llm_client()
    
    review_texts = []
    for review in reviews:
        # Format each review with relevant information
        review_text = f"Rating: {review.get('rating', 'N/A')}/5, Title: {review.get('title', 'N/A')}, Content: {review.get('reviewContent', 'N/A')}"
        # print(review_text)
        review_texts.append(review_text)
    
    # Join all review texts
    all_reviews = "\n\n".join(review_texts)

    # print(all_reviews)
    
    # # Create a proper prompt template with input variables
    prompt_template = PromptTemplate(
        input_variables=["reviews"],
        template="""\
        You are an expert summariser of user reviews for businesses and tourist destinations.
        You are tasked with summarising the reviews of a business or tourist destination. The summary should be short and concise. It should also provide an overview of user sentiments towards the business or destination.
        The reviews are written by users who have visited the business or destination. If you find some user with an interesting opinion, be sure to include it in the summary in a way that reflects the overall sentiment of the reviews.
        
        Input:
        List of reviews related to the business or destination: {reviews}

        Output:
        A maximum of 6-7 lines paragraph summarising the reviews and user sentiments towards the business or destination.

        DO NOT add any extra information. Only the summary is required.
        """
    )
    
    # Invoke the LLM with the reviews
    chain = prompt_template | llm_client
    summary = chain.invoke({"reviews": all_reviews})
    
    return summary.content


def run_summariser_business(business_id):
    reviews = get_reviews_by_business(business_id)
    summary = summarise_reviews(reviews)
    return summary

def run_summariser_location(location_id):
    reviews = get_reviews_by_location(location_id)
    summary = summarise_reviews(reviews)
    return summary


# businessid = '67ccc753451d0a11fb7c307a'

# get_reviews_by_business(businessid)