from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.models import TaskResponse, SubmissionResponse, SubmissionCreate
from typing import List

router = APIRouter()

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel 
from app.database import get_db
from app.models import TaskResponse, SubmissionResponse
from app.core import youtube, ai_verifier
import shutil
import os
import uuid

router = APIRouter()

@router.get("/tasks", response_model=list[TaskResponse])
async def get_tasks():
    supabase = get_db()
    response = supabase.table("tasks").select("*").execute()
    return response.data

@router.post("/submit") # Return type dynamic or generic for now due to file complication
async def submit_task(
    background_tasks: BackgroundTasks,
    task_id: int = Form(...),
    user_id: int = Form(...),
    file: UploadFile = File(...)
):
    supabase = get_db()
    
    # 1. Save file temporarily
    file_ext = file.filename.split(".")[-1]
    temp_filename = f"/tmp/{uuid.uuid4()}.{file_ext}"
    
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 2. Get Task Details (Video ID)
    task_res = supabase.table("tasks").select("video_id").eq("id", task_id).execute()
    if not task_res.data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    video_id = task_res.data[0]['video_id']
    
    # 3. Create Pending Submission
    data = {
        "task_id": task_id,
        "user_id": user_id,
        "verification_status": "processing"
    }
    submission_res = supabase.table("submissions").insert(data).execute()
    submission_id = submission_res.data[0]['id']
    
    # 4. Trigger AI Processing in Background
    background_tasks.add_task(
        process_submission, 
        submission_id, 
        video_id, 
        temp_filename,
        user_id
    )
    
    return {"status": "processing", "submission_id": submission_id}

async def process_submission(submission_id: int, video_id: str, file_path: str, user_id: int):
    try:
        print(f"Processing submission {submission_id} for video {video_id}")
        
        # A. Get Transcript (Reference)
        transcript = youtube.get_video_transcript(video_id)
        if not transcript:
            print("Failed to get transcript, using empty reference.")
            transcript = "No transcript available."
            
        # B. AI Verification
        score, feedback, text = await ai_verifier.verify_submission(file_path, transcript)
        
        # C. Update DB
        status = "approved" if score > 70 else "rejected"
        
        supabase = get_db()
        supabase.table("submissions").update({
            "ai_score": score,
            "audio_text": text + f"\n\n[AI Feedback]: {feedback}",
            "verification_status": status
        }).eq("id", submission_id).execute()
        
        # D. Reward User if Approved
        if status == "approved":
            # Simple increment, ideally transactional but OK for MVP
            # Get current balance
            user_res = supabase.table("users").select("balance").eq("tg_id", user_id).execute()
            if user_res.data:
                current_bal = user_res.data[0]['balance']
                # Get reward amount
                task_res = supabase.table("tasks").select("reward_amount").eq("id", submission_id).execute() 
                # Wait, submission_id is not task_id. Need to join or just use constant/lookup. 
                # Let's re-fetch task info or pass it.
                # Simplification: Fetch task reward again or pass it.
                # Re-querying task to be safe.
                submission_data = supabase.table("submissions").select("task_id").eq("id", submission_id).execute()
                task_id_val = submission_data.data[0]['task_id']
                task_data = supabase.table("tasks").select("reward_amount").eq("id", task_id_val).execute()
                reward = task_data.data[0]['reward_amount']
                
                new_bal = current_bal + reward
                supabase.table("users").update({"balance": new_bal}).eq("tg_id", user_id).execute()
        
    except Exception as e:
        print(f"Background processing error: {e}")
        # Update status to failed?
    finally:
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)

# --- Parent / Channel Endpoints ---

@router.get("/channels")
async def get_channels():
    supabase = get_db()
    # In a real app, filter by user_id (parent)
    response = supabase.table("channels_whitelist").select("*").execute()
    return response.data

class ChannelCreate(BaseModel):
    channel_id: str
    title: str
    added_by: int

@router.post("/channels")
async def add_channel(channel: ChannelCreate):
    supabase = get_db()
    data = channel.dict()
    response = supabase.table("channels_whitelist").insert(data).execute()
    return response.data[0] if response.data else {}
