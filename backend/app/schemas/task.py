from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.models.task import TaskStatus


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.todo
    assignee_id: Optional[int] = None
    due_at: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    assignee_id: Optional[int] = None
    due_at: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    assignee_id: Optional[int] = None
    due_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
