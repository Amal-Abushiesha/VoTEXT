import time
import json
import re
import google.generativeai as genai
from google.generativeai.types.generation_types import BlockedPromptException
from sep import sep, get_whisper

def count_words(text):
    cnt = 0
    for idx, x in enumerate(text):
        words = len(x.split())
        cnt += words
    return cnt

def extract_numbers(input_string):
    # Define the pattern to match numbers with optional decimal points
    pattern = r'\d+\.\d+'
    # Find all matches in the input string
    matches = re.findall(pattern, input_string)
    
    # Extract the first and second numbers from the matches
    if len(matches) >= 2:
        first_number = float(matches[0])
        second_number = float(matches[1])
        return first_number, second_number
    else:
        return None, None

def sec_to_min(time):
    if time < 60:
        return f"Second {round(time, 2)}"
    else:
        return f"min {round(time/60, 2)}"

link = "https://youtu.be/N9B59PHIFbA?si=qAboSwEQjLG5boTf"
video_script = get_whisper(link)

time_stamps, preprocessed_script = sep(str(video_script))

GOOGLE_API_KEY = 'AIzaSyCGVRysglCGzJF1JXKspXtxaE7u5aIPPHw'
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# get the segment length
script_word_count = count_words(preprocessed_script)
if script_word_count <= 500:
    segment_length = script_word_count
elif script_word_count >= 5000:
    segment_length = 1500
else:
    segment_length = 500

start = 0
end = 0
temp_str = ""
segment_list = []
count = 0
global_count = 0
chat = model.start_chat(history=[])
list_of_answers = []

for idx, sentence in enumerate(preprocessed_script):
    temp_str+= " " + sentence
    count += len(sentence.split(' '))
    global_count += len(sentence.split(' '))
    if count == 0:
        first, second = extract_numbers(time_stamps[idx])
        start = first
    if count >= segment_length or global_count == script_word_count:
        first, second = extract_numbers(time_stamps[idx])
        end = second

        # call model
       
        print(f"{sec_to_min(start)} to {sec_to_min(end)}")
        try:
            response = chat.send_message(
                "segment this preprocessed_transcript by topics and give a summary for each segment. no need to provide the segment text, summarization is enough, give summary in the same language as the input, here's the preprocessed_transcript: " + temp_str)
            list_of_answers.append(response.text)
            print(response.text)
            summary_text = response.text

        except BlockedPromptException:
            print("Skipping segment due to BlockedPromptException.")
            list_of_answers.append("segment has been skipped")

        except Exception as e:
            time.sleep(1)
            response = chat.send_message(
                "segment this preprocessed_transcript by topics and give a summary for each segment. no need to provide the segment text, summarization is enough, give summary in the same language as the input, here's the preprocessed_transcript: " + temp_str)
            list_of_answers.append(response.text)
            # print(response.text)
            summary_text = response.text
        print("_"*20)
        
        segment_dict = {
            "time_range": f"{sec_to_min(start)} to {sec_to_min(end)}",
            "summary": summary_text
        }
        list_of_answers.append(segment_dict)
        # resetting params
        temp_str = ""
        count = 0
        start = end
        
# Convert list of segment dictionaries to JSON
output_json = json.dumps(list_of_answers, indent=4)

# Save JSON to a file
with open('output.json', 'w') as json_file:
    json_file.write(output_json)

print("JSON file saved successfully!")
print(segment_dict)



