
import re
from preprocess import normalize_text
import jax
from pytube import YouTube
from whisper_jax import FlaxWhisperPipline
import os
os.environ['XLA_FLAGS']='--xla_dump_to=/tmp/foo'
pipeline = FlaxWhisperPipline("openai/whisper-large-v2")
# openai/whisper-tiny-v2/

def get_whisper(video_url):
    yt = YouTube(video_url)
    audio_stream_url = yt.streams.filter(only_audio=True).first().url
    # print("stream url : " , audio_stream_url)
    
    # transcribe and return timestamps
    outputs = pipeline(audio_stream_url,  task="transcribe", return_timestamps=True)
    t= outputs["chunks"] 
    segments = t
    final_script =""

    for segment in segments:
        temp = "[%.2fs -> %.2fs] %s" % (segment["timestamp"][0], segment["timestamp"][1], segment["text"])
        final_script += " " + temp
    return final_script

def sep(script):

    clean_sentences = []

    # Regular expression pattern to match timestamps and sentences
    pattern = r'\[(\d+\.\d+s) -> (\d+\.\d+s)\] (.+?)(?=\[\d+\.\d+s|\Z)'

    # Extract timestamps and sentences using regular expressions
    matches = re.findall(pattern, script)

    # Separate timestamps and sentences into lists
    timestamps = [f"[{match[0]} -> {match[1]}]" for match in matches]
    sentences = [match[2] for match in matches]

    # Print the extracted timestamps and sentences
    for x in sentences:
        y = normalize_text(x)
        clean_sentences.append(y)

    return timestamps, clean_sentences
