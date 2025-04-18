import os
import logging
import traceback
import json
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging.handlers

# --- Improved Logger Configuration ---
# Determine log level based on environment
log_level = logging.DEBUG if os.getenv('FLASK_ENV') != 'production' else logging.INFO

# Configure root logger
logger = logging.getLogger(__name__)
logger.setLevel(log_level)

# Create formatter with more detailed information for production
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(process)d - %(thread)d - %(message)s')

# Ensure logs directory exists
os.makedirs('logs', exist_ok=True)

# Only add handlers if they haven't been added already
if not logger.handlers:
    # File Handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        "logs/api.log", 
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Stream Handler (to console)
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

logger.info(f"Starting application in {os.getenv('FLASK_ENV', 'development')} mode")
# --- End Logger Configuration ---

from assistant_core import run_chat
from vote_manager import record_vote, init_db, fetch_votes, get_vote_statistics


app = Flask(__name__)
# logger = logging.getLogger(__name__) # Already got logger above
CORS(app) # Apply CORS *after* getting logger

# Initialize the database (use the logger we just configured)
logger.info("Initializing database...") # This should now log correctly
init_db() # Assuming init_db doesn't configure logging itself
logger.info("Database initialized successfully")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring and container orchestration"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "version": "1.0.0"
    })

@app.route('/chat', methods=['POST']) # Removed /api prefix
def chat():
    logger.info("Received /chat request") # Updated log message
    data = request.json
    logger.debug(f"Request data: {data}")
    
    query = data.get('query', '')
    logger.info(f"Query: {query}")
    
    if not query:
        logger.warning("No query provided in request")
        return jsonify({"error": "No query provided"}), 400
    
    try:
        logger.info("Calling run_chat function...")
        result = run_chat(query)
        logger.info("run_chat completed successfully")
        logger.debug(f"Result: {json.dumps(result, default=str)[:500]}...")  # Log first 500 chars of result
        
        # Ensure all required fields are present
        if 'answer' not in result:
            logger.error("Missing 'answer' field in result")
            result['answer'] = "Sorry, I couldn't generate a proper response."
        
        if 'sources' not in result:
            logger.warning("Missing 'sources' field in result")
            result['sources'] = []
            
        if 'evaluation' not in result:
            logger.warning("Missing 'evaluation' field in result")
            result['evaluation'] = {"raw_text": "No evaluation available"}
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

@app.route('/votes', methods=['GET'])
def get_votes():
    """Endpoint to retrieve votes with optional filtering and pagination"""
    logger.info("Received /votes request")
    
    # Parse query parameters
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', 0, type=int)
    vote_filter = request.args.get('vote')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if vote_filter and vote_filter not in ['yes', 'no']:
        logger.warning(f"Invalid vote filter: {vote_filter}")
        return jsonify({"error": "Vote filter must be 'yes' or 'no'"}), 400

    # Validate date formats
    for date_label, date_value in [('start_date', start_date), ('end_date', end_date)]:
        if date_value:
            try:
                datetime.datetime.strptime(date_value, "%Y-%m-%d")
            except Exception as e:
                logger.warning(f"Invalid {date_label} format: {date_value} - {e}")
                return jsonify({"error": f"{date_label} must be in YYYY-MM-DD format"}), 400

    try:
        logger.info(f"Fetching votes with limit={limit}, offset={offset}, vote_filter={vote_filter}, start_date={start_date}, end_date={end_date}")
        votes = fetch_votes(limit=limit, offset=offset, vote_filter=vote_filter, start_date=start_date, end_date=end_date)
        logger.info(f"Retrieved {len(votes)} votes")
        return jsonify({"votes": votes})
    except Exception as e:
        logger.error(f"Error fetching votes: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

@app.route('/votes/statistics', methods=['GET'])
def get_statistics():
    """Endpoint to retrieve vote statistics"""
    logger.info("Received /votes/statistics request")
    
    try:
        logger.info("Fetching vote statistics")
        statistics = get_vote_statistics()
        logger.info("Retrieved vote statistics successfully")
        return jsonify(statistics)
    except Exception as e:
        logger.error(f"Error fetching vote statistics: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

@app.route('/feedback', methods=['POST']) # Removed /api prefix
def feedback():
    logger.info("Received /feedback request") # Updated log message
    data = request.json
    logger.debug(f"Feedback data: {data}")
    
    required_fields = ['user_query', 'bot_response', 'evaluation_json', 'vote']
    for field in required_fields:
        if field not in data:
            logger.warning(f"Missing required field in feedback: {field}")
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:
        logger.info(f"Recording vote: {data['vote']}")
        record_vote(
            data['user_query'],
            data['bot_response'],
            data['evaluation_json'],
            data['vote'],
            data.get('comment', '')
        )
        logger.info("Vote recorded successfully")
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error recording vote: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server on port 5001...")
    # Note: Flask's internal logger might still print startup messages to stderr before our handlers attach
    try:
        # Run without Flask's reloader, as start_app.sh handles restarts
        app.run(debug=False, port=5001, use_reloader=False) # Keep reloader false
    except Exception as e:
        logger.error(f"Error starting Flask server: {str(e)}")
        logger.error(traceback.format_exc())
