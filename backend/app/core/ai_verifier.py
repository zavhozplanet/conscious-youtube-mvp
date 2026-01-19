import os
import google.generativeai as genai
from typing import Tuple

# Configure Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Use a model that supports multimodal input (audio/video)
model = genai.GenerativeModel('gemini-1.5-flash')

async def verify_submission(audio_file_path: str, reference_text: str) -> Tuple[int, str, str]:
    """
    Analyzes the child's audio submission against the video transcript.
    
    Args:
        audio_file_path: Path to the temporary audio file.
        reference_text: Transcript of the YouTube video.
        
    Returns:
        Tuple[score (0-100), feedback_text, transcribed_text]
    """
    
    # 1. Upload file to Gemini (for processing)
    # Note: For efficiency in production, might want to reuse uploads or delete them.
    # Here we assume a fresh upload for each check.
    try:
        uploaded_file = genai.upload_file(audio_file_path)
        
        # 2. Construct Prompt
        prompt = f"""
        You are a kind and encouraging teacher.
        
        Task:
        1. Transcribe the audio file provided.
        2. Compare the content of the child's retelling (audio) with the original video transcript provided below.
        3. Evaluate if the child understood the video.
        4. Check if the child is just reading text (unnatural pauses, reading tone) or speaking naturally.
        
        Reference Video Transcript:
        {reference_text[:10000]} ... (truncated if too long)
        
        Output Format (JSON):
        {{
            "transcription": "The text of what the child said...",
            "score": <integer 0-100>,
            "feedback": "A short, encouraging comment for the child (max 2 sentences).",
            "is_reading": <boolean>
        }}
        """
        
        # 3. Generate Content
        response = model.generate_content([prompt, uploaded_file])
        
        # 4. Parse Response (Keep it simple for MVP, assume valid JSON or rough parsing)
        # Using simple string cleaning for resilience
        text_resp = response.text.strip()
        
        # Clean markdown code blocks if present
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:-3]
        
        import json
        result = json.loads(text_resp)
        
        score = result.get("score", 0)
        feedback = result.get("feedback", "Good effort!")
        transcription = result.get("transcription", "")
        
        # Adjust score if reading (optional logic, but instruction said "Check if... reading")
        if result.get("is_reading", False):
            feedback += " (Try to tell it in your own words next time!)"
            score = max(0, score - 20) # Penalty for reading
            
        return score, feedback, transcription

    except Exception as e:
        print(f"AI Verification Error: {e}")
        return 0, "Error processing submission.", ""
