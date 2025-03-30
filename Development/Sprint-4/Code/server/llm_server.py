from flask import Flask, request, jsonify
from waitress import serve
import logging
from llm_component import review_summariser
from dotenv import load_dotenv
import os

# Initialize Flask app
load_dotenv(dotenv_path="./config.env")
app = Flask(__name__)

# Set up logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
app.logger.setLevel(logging.INFO)

# Create a logger for the application
logger = logging.getLogger('flask.app')

# Home route
@app.route('/')
def home():
    app.logger.info('Home page requested')
    review_summariser.connect_to_db()
    return jsonify({'message': 'Welcome to the LLM API!'})


# Route to handle business summary
@app.route('/businessSummary')
def businessSummary():
    try:
        # Log the incoming request
        app.logger.info('Received request to /businessSummary')

        # Get businessId from the request JSON
        business_id = request.args.get('businessId')
        
        if not business_id:
            app.logger.warning('businessId is missing in the request')
            return jsonify({'error': 'businessId is required'}), 400
        
        summary = review_summariser.run_summariser_business(business_id)

        return jsonify({'summary': summary})

    except Exception as e:
        app.logger.error(f"Error in /businessSummary route: {str(e)}")
        return jsonify({'error': str(e)}), 500


# Route to handle location summary
@app.route('/locationSummary')
def locationSummary():
    try:
        # Log the incoming request
        app.logger.info('Received request to /locationSummary')

        # Get locationId from the request JSON
        location_id = request.args.get('locationId')
        
        if not location_id:
            app.logger.warning('locationId is missing in the request')
            return jsonify({'error': 'locationId is required'}), 400
        
        # Call function to summarize location (you'll need to implement this logic)
        summary = review_summariser.run_summariser_location(location_id)

        return jsonify({'summary': summary})

    except Exception as e:
        app.logger.error(f"Error in /locationSummary route: {str(e)}")
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    # Log server start
    app.logger.info("Server is starting...")

    # Run using waitress server
    serve(app, host='0.0.0.0', port=5000)
