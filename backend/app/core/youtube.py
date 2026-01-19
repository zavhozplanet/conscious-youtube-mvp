from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

def get_video_transcript(video_id: str) -> str:
    """
    Fetches the transcript of a YouTube video.
    Returns the concatenated text of the transcript.
    """
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        formatter = TextFormatter()
        text = formatter.format_transcript(transcript_list)
        return text
    except Exception as e:
        print(f"Error fetching transcript for {video_id}: {e}")
        return ""

def get_video_details(video_id: str):
    # Placeholder: In a real app, this would use YouTube Data API v3
    # to get title, description, etc. if needed.
    # For MVP reasoning, transcript is primary.
    pass
