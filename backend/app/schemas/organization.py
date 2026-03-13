from pydantic import BaseModel
from app.models.organization import OrgRole


class OrganizationCreate(BaseModel):
    name: str
    slug: str


class OrganizationResponse(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class MemberResponse(BaseModel):
    id: int
    user_id: int
    role: OrgRole

    class Config:
        from_attributes = True
