from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.project import Project
from app.models.organization import OrganizationMember
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.api.deps import get_current_user, get_org_membership

router = APIRouter(prefix="/organizations/{org_id}/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    _member=Depends(get_org_membership),
):
    result = await db.execute(select(Project).where(Project.organization_id == org_id))
    projects = result.scalars().all()
    return [ProjectResponse.model_validate(p) for p in projects]


@router.post("", response_model=ProjectResponse)
async def create_project(
    org_id: int,
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    _member=Depends(get_org_membership),
):
    project = Project(organization_id=org_id, name=data.name, description=data.description)
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    org_id: int,
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _member=Depends(get_org_membership),
):
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == org_id,
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    org_id: int,
    project_id: int,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    _member=Depends(get_org_membership),
):
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == org_id,
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if data.name is not None:
        project.name = data.name
    if data.description is not None:
        project.description = data.description
    await db.commit()
    await db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    org_id: int,
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _member=Depends(get_org_membership),
):
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.organization_id == org_id,
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
