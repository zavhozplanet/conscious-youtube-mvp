from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    tg_id: int
    role: str
    parent_id: Optional[int] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    balance: int
    created_at: datetime

class TaskBase(BaseModel):
    video_id: str
    title: str
    reward_amount: int

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    status: str
    created_at: datetime

class SubmissionBase(BaseModel):
    task_id: int
    user_id: int
    audio_text: Optional[str] = None

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionResponse(SubmissionBase):
    id: int
    ai_score: Optional[int] = None
    verification_status: str
    created_at: datetime
