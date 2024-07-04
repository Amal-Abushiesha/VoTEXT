
import re
from preprocess import normalize_text
from langdetect import detect
from pytube import YouTube
# import whisper

# # Loading Whisper Small model
# model = whisper.load_model("small")

def get_whisper(video_url):
    
    final_script ="" 
    try:
        #Feteching Video URL
        yt = YouTube(video_url)
        #Fetching audio Stram of the video
        audio_stream_url = yt.streams.filter(only_audio=True).first().url
        print(audio_stream_url)
    except:
        get_whisper(video_url)
    #transcripting using whisper
    # result = model.transcribe(audio_stream_url ,word_timestamps=True)
    # chunks = result["segments"] 
    # segments = chunks

    # # Gerenrate final script with specific pattern
    # for segment in segments:
    #     temp = "[%.2fs -> %.2fs] %s" % (segment["start"], segment["end"], segment["text"])
    #     final_script += " " + temp
        
    # return final_script

def sep(script):

    clean_sentences = []

    # Regular expression pattern to match timestamps and sentences
    pattern = r'\[(\d+\.\d+s) -> (\d+\.\d+s)\] (.+?)(?=\[\d+\.\d+s|\Z)'

    # Extract timestamps and sentences using regular expressions
    matches = re.findall(pattern, script)

    # Separate timestamps and sentences into lists
    timestamps = [f"[{match[0]} -> {match[1]}]" for match in matches]
    sentences = [match[2] for match in matches]

    # detect the language of the scentences and if english clean them
     # Detect language for each string and count occurrences
    languages = {}
    for text in sentences:
        language = detect(text)
        languages[language] = languages.get(language, 0) + 1

    # Check if English is the majority language
    is_english = languages.get('en', 0) > (len(sentences) * 0.7)

    if is_english:
        # clean the sentences
        for x in sentences:
            y = normalize_text(x)
            clean_sentences.append(y)
        return timestamps, clean_sentences
    else:
        return timestamps, sentences
