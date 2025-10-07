# backend/app/utils/dynamic_enums.py
from enum import Enum
from typing import Type
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.case import Case
from app.models.user import User

async def generate_case_enum(db: AsyncSession) -> Type[Enum]:
    """Generate Enum of cases for Swagger dropdown."""
    res = await db.execute(select(Case.id, Case.title))
    cases = res.all()
    values = {c.title.replace(" ", "_"): str(c.id) for c in cases}
    return Enum("CaseEnum", values)

async def generate_investigator_enum(db: AsyncSession) -> Type[Enum]:
    """Generate Enum of investigators for Swagger dropdown."""
    res = await db.execute(select(User.id, User.username).where(User.role == "investigator"))
    users = res.all()
    values = {u.username.replace(" ", "_"): str(u.id) for u in users}
    return Enum("InvestigatorEnum", values)
