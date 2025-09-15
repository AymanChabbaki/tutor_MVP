import os
import logging
import asyncio
from flask import Flask, jsonify
from flask_cors import CORS
from config.settings import get_config
from routes.api import api_bp
from db.database import db_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def create_app(config_name=None):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    config = get_config()
    app.config.from_object(config)
    
    # Enable CORS
    CORS(app, origins=config.CORS_ORIGINS if hasattr(config, 'CORS_ORIGINS') else '*')
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            'error': 'Not found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        logger.error(f"Unhandled exception: {error}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500
    
    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'service': 'AI Bootcamp Tutor MVP',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'health': '/api/health',
                'summarize': '/api/summarize',
                'explain': '/api/explain',
                'generate_exercises': '/api/generate_exercises',
                'create_user': '/api/users',
                'get_user_sessions': '/api/users/<email>/sessions'
            }
        })
    
    # Health check endpoint at root level
    @app.route('/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'AI Bootcamp Tutor MVP',
            'version': '1.0.0'
        })
    
    # Database initialization using modern Flask pattern
    def initialize_database():
        """Initialize database connection."""
        try:
            # Initialize database connection - will connect when first used
            logger.info("Database service initialized - will connect on first use")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    # Initialize database when app is created
    with app.app_context():
        initialize_database()
    
    # Cleanup on app teardown
    @app.teardown_appcontext
    def shutdown_db(error):
        """Cleanup database connections."""
        if error:
            logger.error(f"Application context error: {error}")
    
    return app

def run_app():
    """Run the Flask application."""
    try:
        # Get configuration
        config = get_config()
        
        # Create Flask app
        app = create_app()
        
        # Set up logging level
        if config.DEBUG:
            app.logger.setLevel(logging.DEBUG)
        else:
            app.logger.setLevel(logging.INFO)
        
        logger.info("Starting AI Bootcamp Tutor MVP server...")
        logger.info(f"Debug mode: {config.DEBUG}")
        logger.info(f"Database URL: {config.DATABASE_URL[:30]}..." if config.DATABASE_URL else "Not configured")
        
        # Run the application
        app.run(
            host='0.0.0.0',
            port=int(os.getenv('PORT', 5000)),
            debug=config.DEBUG,
            threaded=True
        )
        
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise

if __name__ == '__main__':
    run_app()
