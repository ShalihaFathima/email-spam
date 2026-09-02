"""
Flask API for Spam Detection Model
Loads trained model.pkl and vectorizer.pkl
Provides /predict endpoint for email classification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import re
import os

# ============================================================================
# INITIALIZE FLASK APP
# ============================================================================
app = Flask(__name__)

# Enable CORS for all routes (important for frontend connection)
CORS(app, resources={r"/*": {"origins": "*"}})

# ============================================================================
# GLOBAL VARIABLES FOR MODEL & VECTORIZER
# ============================================================================
model = None
vectorizer = None

# ============================================================================
# LOAD MODEL AND VECTORIZER ON STARTUP
# ============================================================================
def load_model_and_vectorizer():
    """Load model.pkl and vectorizer.pkl from disk"""
    global model, vectorizer
    
    print("=" * 70)
    print("LOADING MODEL AND VECTORIZER")
    print("=" * 70)
    
    # Check if files exist
    if not os.path.exists('model.pkl'):
        print("❌ ERROR: model.pkl not found!")
        raise FileNotFoundError("model.pkl not found. Please run spam_detection.py first.")
    
    if not os.path.exists('vectorizer.pkl'):
        print("❌ ERROR: vectorizer.pkl not found!")
        raise FileNotFoundError("vectorizer.pkl not found. Please run spam_detection.py first.")
    
    # Load model
    try:
        with open('model.pkl', 'rb') as f:
            model = pickle.load(f)
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise
    
    # Load vectorizer
    try:
        with open('vectorizer.pkl', 'rb') as f:
            vectorizer = pickle.load(f)
        print("✅ Vectorizer loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading vectorizer: {e}")
        raise
    
    print("=" * 70)
    print("✅ MODEL AND VECTORIZER READY")
    print("=" * 70)

# ============================================================================
# PREPROCESSING FUNCTION (SAME AS TRAINING)
# ============================================================================
def preprocess_text(text):
    """
    Preprocess text by:
    - Converting to lowercase
    - Removing punctuation using regex
    
    Parameters:
        text (str): Raw email text
    
    Returns:
        str: Cleaned text
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove punctuation and special characters (keep only alphanumeric and spaces)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================
@app.route('/health', methods=['GET'])
def health():
    """
    Health check endpoint
    Returns OK if server is running and model is loaded
    """
    return jsonify({
        "status": "OK",
        "message": "Spam detection API is running",
        "model_loaded": model is not None,
        "vectorizer_loaded": vectorizer is not None
    }), 200

# ============================================================================
# PREDICT ENDPOINT
# ============================================================================
@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict if an email is spam or not.
    
    POST /predict
    Content-Type: application/json
    
    Request body:
    {
        "email": "text to classify"
    }
    
    Response:
    {
        "prediction": 0 or 1,
        "label": "Spam" or "Not Spam",
        "confidence": 0.0 to 1.0,
        "probabilities": {
            "ham": 0.xx,
            "spam": 0.xx
        }
    }
    """
    
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({
                "error": "No JSON data provided",
                "message": "Please send JSON with 'email' field"
            }), 400
        
        if 'email' not in data:
            return jsonify({
                "error": "Missing 'email' field",
                "message": "Request must include 'email' field"
            }), 400
        
        email_text = data['email']
        
        # Validate email text
        if not isinstance(email_text, str):
            return jsonify({
                "error": "Invalid email type",
                "message": "'email' field must be a string"
            }), 400
        
        if len(email_text.strip()) == 0:
            return jsonify({
                "error": "Empty email",
                "message": "'email' field cannot be empty"
            }), 400
        
        # ====================================================================
        # PROCESS: Clean, Transform, Predict
        # ====================================================================
        
        # Step 1: Apply preprocessing (same as training)
        cleaned_text = preprocess_text(email_text)
        
        # Step 2: Transform using vectorizer
        text_vectorized = vectorizer.transform([cleaned_text])
        
        # Step 3: Predict using model
        prediction = model.predict(text_vectorized)[0]
        probabilities = model.predict_proba(text_vectorized)[0]
        
        # Convert prediction to label
        label = "Spam" if prediction == 1 else "Not Spam"
        confidence = float(max(probabilities))
        
        # Return response
        return jsonify({
            "success": True,
            "prediction": int(prediction),
            "label": label,
            "confidence": round(confidence, 4),
            "probabilities": {
                "ham": round(float(probabilities[0]), 4),
                "spam": round(float(probabilities[1]), 4)
            },
            "email_preview": email_text[:100] + "..." if len(email_text) > 100 else email_text
        }), 200
    
    except Exception as e:
        print(f"❌ Error in prediction: {str(e)}")
        return jsonify({
            "error": "Prediction failed",
            "message": str(e)
        }), 500

# ============================================================================
# INFO ENDPOINT
# ============================================================================
@app.route('/info', methods=['GET'])
def info():
    """Get information about the model and API"""
    return jsonify({
        "app": "Spam Detection API",
        "version": "1.0",
        "description": "Classifies SMS/emails as Spam or Not Spam",
        "endpoints": {
            "GET /health": "Health check",
            "GET /info": "API information",
            "POST /predict": "Predict spam/ham for email text"
        },
        "model": {
            "type": "Multinomial Naive Bayes",
            "accuracy": "96.95%"
        },
        "vectorizer": {
            "type": "TF-IDF",
            "max_features": 5000
        },
        "usage": {
            "method": "POST",
            "endpoint": "/predict",
            "content_type": "application/json",
            "request_body": {
                "email": "Your email text here"
            },
            "example_response": {
                "success": True,
                "prediction": 1,
                "label": "Spam",
                "confidence": 0.9456,
                "probabilities": {
                    "ham": 0.0544,
                    "spam": 0.9456
                }
            }
        }
    }), 200

# ============================================================================
# ROOT ENDPOINT
# ============================================================================
@app.route('/', methods=['GET'])
def root():
    """Root endpoint - displays API information"""
    return jsonify({
        "app": "🚀 Spam Detection API",
        "status": "✅ Running",
        "version": "1.0",
        "description": "Classifies SMS/emails as Spam or Not Spam using Machine Learning",
        "available_endpoints": {
            "GET /": "This page - API information",
            "GET /health": "Health check status",
            "GET /info": "Detailed API documentation",
            "POST /predict": "Classify email as spam or not spam"
        },
        "quick_start": {
            "method": "POST",
            "url": "http://localhost:5000/predict",
            "content_type": "application/json",
            "request_example": {
                "email": "FREE MONEY NOW!!! CLICK HERE!!!"
            },
            "success_response": {
                "success": True,
                "prediction": 1,
                "label": "Spam",
                "confidence": 0.9456
            }
        },
        "model_info": {
            "type": "Multinomial Naive Bayes",
            "accuracy": "96.95%",
            "features": "TF-IDF (5000 max features)",
            "training_data": "UCI SMS Spam Collection (5,572 messages)"
        }
    }), 200

# ============================================================================
# ERROR HANDLERS
# ============================================================================
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "❌ Endpoint not found",
        "message": "Visit GET / or GET /info for available endpoints",
        "available_endpoints": ["/", "/health", "/info", "/predict"]
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors (wrong HTTP method)"""
    return jsonify({
        "error": "Method not allowed",
        "message": "Please use the correct HTTP method"
    }), 405

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal server error",
        "message": str(error)
    }), 500

# ============================================================================
# MAIN - START FLASK SERVER
# ============================================================================
if __name__ == '__main__':
    try:
        # Load model and vectorizer before starting server
        load_model_and_vectorizer()
        
        # Start Flask app
        print("\n" + "=" * 70)
        print("🚀 STARTING FLASK API SERVER")
        print("=" * 70)
        print("\n📍 Server running at:")
        print("   Local:   http://localhost:5000")
        print("   Network: http://<your-ip>:5000")
        print("\n📚 Available endpoints:")
        print("   GET /health  - Health check")
        print("   GET /info    - API information")
        print("   POST /predict - Spam detection")
        print("\n📖 Documentation: http://localhost:5000/info")
        print("\n" + "=" * 70)
        print("Press CTRL+C to stop the server")
        print("=" * 70 + "\n")
        
        # Run app on port 5000
        app.run(
            host='127.0.0.1',       # Listen on localhost only
            port=5000,              # Port 5000
            debug=True,             # Enable debug mode
            use_reloader=False      # No auto-reload of pickled objects
        )
    
    except FileNotFoundError as e:
        print(f"❌ ERROR: {e}")
        print("Please run spam_detection.py first to create model.pkl and vectorizer.pkl")
        exit(1)
    except Exception as e:
        print(f"❌ FATAL ERROR: {e}")
        exit(1)
