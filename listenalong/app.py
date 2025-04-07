import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests from your frontend

# Global variable to store current media info
current_track = {}

@app.route('/update_media', methods=['POST'])
def update_media():
    """
    Receives a JSON payload with a 'media_url', sets it as the current track,
    and returns a success response.
    """
    data = request.get_json()
    media_url = data.get('media_url')
    if not media_url:
        return jsonify({"error": "No media URL provided"}), 400
    
    # Store the media URL (or additional media data if needed)
    current_track['media_url'] = media_url
    return jsonify({"success": True, "media_url": media_url})

@app.route('/current_media', methods=['GET'])
def get_current_media():
    """Returns the currently stored media info."""
    return jsonify(current_track)

if __name__ == '__main__':
    # Bind to the address 0.0.0.0 and the PORT provided in the environment
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
