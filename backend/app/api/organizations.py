from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.schemas.organization import OrganizationCreate, OrganizationResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("", response_model=list[OrganizationResponse])
async def list_organizations(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Organization)
        .join(OrganizationMember)
        .where(OrganizationMember.user_id == user.id)
    )
    orgs = result.scalars().all()
    return [OrganizationResponse.model_validate(o) for o in orgs]


@router.post("", response_model=OrganizationResponse)
async def create_organization(
    data: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Organization).where(Organization.slug == data.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already taken")
    org = Organization(name=data.name, slug=data.slug)
    db.add(org)
    await db.flush()
    db.add(OrganizationMember(organization_id=org.id, user_id=user.id, role=OrgRole.admin))
    await db.commit()
    await db.refresh(org)
    return OrganizationResponse.model_validate(org)
