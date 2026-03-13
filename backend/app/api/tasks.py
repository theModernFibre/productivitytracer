from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.project import Project
from app.models.task import Task
from app.models.organization import OrganizationMember
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.api.deps import get_org_membership

router = APIRouter(
    prefix="/organizations/{org_id}/projects/{project_id}/tasks",
    tags=["tasks"],
)


async def _get_project(org_id: int, project_id: int, db: AsyncSession) -> Project:
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == org_id,
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    org_id: int,
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _member=Depends(get_org_membership),
):
    await _get_project(org_id, project_id, db)
    result = await db.execute(select(Task).where(Task.project_id == project_id))
    tasks = result.scalars().all()
    return [TaskResponse.model_validate(t) for t in tasks]


@router.post("", response_model=TaskResponse)
async def create_task(
    org_id: int,
    project_id: int,
    data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    _member=Depends(get_org_membership),
):
    await _get_project(org_id, project_id, db)
    task = Task(
        project_id=project_id,
        title=data.title,
        description=data.description,
        status=data.status,
        assignee_id=data.assignee_id,
        due_at=data.due_at,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    org_id: int,
    project_id: int,
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _member=Depends(get_org_membership),
):
    await _get_project(org_id, project_id, db)
    result = await db.execute(select(Task).where(Task.id == task_id, Task.project_id == project_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    org_id: int,
    project_id: int,
    task_id: int,
    data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    _member=Depends(get_org_membership),
):
    await _get_project(org_id, project_id, db)
    result = await db.execute(select(Task).where(Task.id == task_id, Task.project_id == project_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.status is not None:
        task.status = data.status
    if data.assignee_id is not None:
        task.assignee_id = data.assignee_id
    if data.due_at is not None:
        task.due_at = data.due_at
    await db.commit()
    await db.refresh(task)
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    org_id: int,
    project_id: int,
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _member=Depends(get_org_membership),
):
    await _get_project(org_id, project_id, db)
    result = await db.execute(select(Task).where(Task.id == task_id, Task.project_id == project_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await db.commit()
