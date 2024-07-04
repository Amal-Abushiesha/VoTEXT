# comment_analysis_module.py
import requests
import re
import json
from bs4 import BeautifulSoup
import time
import textwrap
from IPython.display import display, Markdown
import google.generativeai as genai

# Function to clean comment text
def clean_comment_text(text):
    soup = BeautifulSoup(text, 'html.parser')
    for a in soup.find_all('a'):
        a.extract()
    cleaned_text = ' '.join(re.sub(r"[^a-zA-Z0-9\s]", "", soup.get_text()).split())
    return cleaned_text

# Function to fetch video comments
def fetch_video_comments(video_id, api_key, page_token=None):
    base_url = "https://www.googleapis.com/youtube/v3/commentThreads"
    params = {
        "part": "snippet",
        "videoId": video_id,
        "key": api_key,
        "pageToken": page_token,
    }

    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        comments_data = response.json()
        return comments_data
    else:
        print(f"API request error: Status code {response.status_code}")
        return None

# Function to process comments data
def process_comments_data(comments_data, all_comments):
    for item in comments_data.get("items", []):
        user = item["snippet"]["topLevelComment"]["snippet"]["authorDisplayName"]
        comment_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
        cleaned_comment_text = clean_comment_text(comment_text)
        all_comments.append(cleaned_comment_text)

# Function to convert text to Markdown
def to_markdown(text):
    text = text.replace('•', ' *')
    return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))

# Function to classify comments
def classify_comments(all_comments, api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
    classified_comments = []

    for comment in all_comments:
        try:
            response = model.generate_content("Classify this comment as positive, negative, or neutral, give your answer as only one word" + str(comment))
            text = response.candidates[0].content.parts[0].text
            classified_comments.append(text)
        except:
            time.sleep(1)
            response = model.generate_content("Classify this comment as positive, negative, or neutral, give your answer as only one word" + str(comment))
            text = response.candidates[0].content.parts[0].text
            classified_comments.append(text)

    return classified_comments

# Function to analyze comment sentiment
def analyze_comment_sentiment(all_comments, classified_comments):
    positive_count = 0
    negative_count = 0
    neutral_count = 0

    for comment, classified_comment in zip(all_comments, classified_comments):
        if classified_comment.lower() == 'positive':
            positive_count += 1
        elif classified_comment.lower() == 'negative':
            negative_count += 1
        elif classified_comment.lower() == 'neutral':
            neutral_count += 1

    total_comments = len(all_comments)
   
    positive_percentage = round((positive_count / total_comments) * 100)
    negative_percentage = round((negative_count / total_comments) * 100)
    neutral_percentage = round((neutral_count / total_comments) * 100)
    print(positive_count)

    ''' results = {
        "positive_percentage": positive_percentage,
        "negative_percentage": negative_percentage,
        "neutral_percentage": neutral_percentage
    }'''
    
   # return results

# Function to save results to a JSON file
def save_results_to_json(results, output_file_path):
    with open(output_file_path, "w") as json_file:
        json.dump(results, json_file)
    print("Results saved to:", output_file_path)