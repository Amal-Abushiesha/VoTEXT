from flask import Flask, send_from_directory, request, jsonify
from comment_analysis_module import fetch_video_comments, process_comments_data, classify_comments, analyze_comment_sentiment
import re
from video_summarizer import summarize_video
import requests

# Initialize Flask application
app = Flask(__name__)

# YouTube Data API key (Replace with your actual API key)

# Routes to serve static HTML files
@app.route('/')
def loading():
    return send_from_directory('dorang/public_html', 'loading.html')

@app.route('/index.html')
def index():
    return send_from_directory('dorang/public_html', 'index.html')

@app.route('/History.html')
def serve_history():
    return send_from_directory('dorang/public_html', 'History.html')

# Serve static assets like CSS, JavaScript, and images
@app.route('/assets/<path:path>')
def serve_assets(path):
    return send_from_directory('dorang/public_html/assets', path)

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    youtube_link = data.get('youtube_link')
    api_key = 'AIzaSyAXFK0M-gb4CRvflGZ8sNw-NImVIcuc8Dw'
    summaries = summarize_video(youtube_link, api_key)
    base_url = "https://project-yhx7.onrender.com/addData2"
    params = {
        "youtube_link": youtube_link,
        "result": summaries
    }

    headers = {
        'Authorization': request.headers.get('Authorization')
    }
    try:
        response = requests.post(base_url, json=params,headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:   
        return jsonify({"error": f"Failed to send data to external API: {e}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({'summaries': summaries})

@app.route('/analyze_comments', methods=['POST'])
def analyze_comments():
    # Get JSON data from POST request
    data = request.get_json()
    youtube_link = data.get('youtube_link')
    api_key = "AIzaSyC1MVdcRmxOuDBECZl8GK8bRma5HRZ_vI4"
    # request.headers.get('Authorization')
     # Extract token from header
    # access_token = 'Barear eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFtcjFAZ21haWwuY29tIiwiaWQiOiI2NjJhYzRkMDkwMDU1YTcyNmMzYTMwNjMiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcxNjkyMjUzNH0.EAZpF7b1swQcm9rpP62fjym-UrO6AJINxxqfQ8WAthE'  # Extract token from header

    # Validate the YouTube link
    link_pattern = r'(?:youtu\.be/|youtube\.com/watch\?v=)([a-zA-Z0-9_-]+)'
    match = re.search(link_pattern, youtube_link)

    if not match:
        return jsonify({"error": "Invalid YouTube video link. Please provide a valid link."})

    video_id = match.group(1)

    # Initialize a list to store cleaned comments
    all_comments = []

    # Fetch and process comments using the YouTube Data API key
    video_comments = fetch_video_comments(video_id, api_key)
    if video_comments is not None:
        process_comments_data(video_comments, all_comments)
        next_page_token = video_comments.get("nextPageToken")

        # Fetch all pages of comments, if there are more
        while next_page_token:
            next_page_comments = fetch_video_comments(video_id, api_key, page_token=next_page_token)
            if next_page_comments is not None:
                process_comments_data(next_page_comments, all_comments)
                next_page_token = next_page_comments.get("nextPageToken")

    # Classify and analyze comments
    classified_comments = classify_comments(all_comments, api_key)
    results = analyze_comment_sentiment(all_comments, classified_comments)
    base_url = "https://project-yhx7.onrender.com/addData2"

    # Include the access token in the headers
    headers = {
        'Authorization': request.headers.get('Authorization')
    }

    params = {
        "youtube_link": youtube_link,
        "result": results
    }
    try:
        response = requests.post(base_url, json=params, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to send data to external API: {e}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(results)

# Run the Flask server
if __name__ == "__main__":
    # Listen on localhost and port 7860 for development
    app.run(host='127.0.0.1', port=5000, debug=True)