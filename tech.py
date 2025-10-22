from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from cobutech import fetch_live_price
import os
import time

app = Flask(__name__, static_folder='.')
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
        return jsonify({
            "status": "error",
            "message": "Could not fetch price."
        }), 500

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'cobutech.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
