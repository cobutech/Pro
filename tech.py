from flask import Flask, jsonify, render_template
from flask_cors import CORS
from cobutech import fetch_live_price
import os
import time

# Update the constructor to use the standard 'static' folder
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

@app.route('/api/price', methods=['GET'])
def get_current_price():
    try:
        price = fetch_live_price()
        return jsonify({
            "status": "success",
            "symbol": "XAUUSD",
            "price": price,
            "timestamp": time.time()
        }), 200
        
    except Exception as e:
        # Log the error for debugging on the server
        print(f"Error fetching price: {e}") 
        return jsonify({
            "status": "error",
            "message": "Could not fetch price."
        }), 500

@app.route('/')
def serve_index():
    # Flask looks for 'volume .html' inside a folder named 'templates'
    return render_template('cobutech.html') 

# Static files will be served automatically from 'static' folder

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
