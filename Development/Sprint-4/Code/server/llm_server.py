from flask import Flask, request, jsonify, Blueprint
# from waitress import serve
import logging
import os
from pathlib import Path
from llm_component import review_summariser, ItineraryProcessor
from dotenv import load_dotenv

# Get the absolute path to the config.env file
ROOT_DIR = Path(__file__).resolve().parent
ENV_PATH = ROOT_DIR / "config.env"

# Load environment variables from the absolute path
load_dotenv(dotenv_path=str(ENV_PATH))

# Initialize Flask app
app = Flask(__name__)

# Set up logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
app.logger.setLevel(logging.INFO)

# Create a logger for the application
logger = logging.getLogger('flask.app')

# Create a Blueprint for the /api/llm/ prefix
llm_bp = Blueprint('llm', __name__, url_prefix='/api/llm')

# Home route
@llm_bp.route('/summary/')
def home():
    app.logger.info('Home page requested')
    review_summariser.connect_to_db()
    return jsonify({'message': 'Welcome to the LLM API!'})

# Route to handle business summary
@llm_bp.route('/summary/businessSummary')
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
@llm_bp.route('/summary/locationSummary')
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


@llm_bp.route('/itinerary/process', methods=['POST'])
def process_itinerary():
    try:
        itinerary_data = request.get_json()
        if not itinerary_data:
            app.logger.warning('No itinerary data in the request')
            return jsonify({'error': 'Itinerary data is required'}), 400
        
        optimization = itinerary_data.get('optimization')
        itinerary_requirements = ItineraryProcessor.run(itinerary_data, optimization)
        return jsonify({'i_reqs': itinerary_requirements}), 200

    except Exception as e:
        app.logger.error(f"Error in itinerary processing route: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Register the Blueprint with the Flask app
app.register_blueprint(llm_bp)

if __name__ == '__main__':
    # Log server start
    app.logger.info("Server is starting...")

    
    # Alternatively, if you want to use waitress:
    # from waitress import serve
    # serve(app, host='0.0.0.0', port=5000)
    # Run using Flask development server on all interfaces (0.0.0.0)
    app.run(host='0.0.0.0', port=5000, debug=True) 