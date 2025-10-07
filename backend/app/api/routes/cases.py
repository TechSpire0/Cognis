from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from app.db.deps import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.case_assignment import CaseAssignment
from app.utils.audit_utils import create_audit

router = APIRouter(prefix="/cases", tags=["Cases"])

# ---------- Schemas ----------
class CaseCreate(BaseModel):
    title: str
    description: str | None = None


class AssignPayload(BaseModel):
    case_id: str
    user_id: str


# ---------- Routes ----------

@router.post("/create", status_code=201)
async def create_case(
    payload: CaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin-only: Create a new case."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can create cases",
        )

    new_case = Case(
        title=payload.title,
        description=payload.description,
        created_by=current_user.id,
    )
    db.add(new_case)
    await db.commit()
    await db.refresh(new_case)

    return {
        "id": str(new_case.id),
        "title": new_case.title,
        "description": new_case.description,
        "created_by": str(new_case.created_by),
        "created_at": new_case.created_at.isoformat() if new_case.created_at else None,
    }


@router.get("/list")
async def list_cases(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List cases: Admins see all; Investigators see assigned ones."""
    if current_user.role == "admin":
        stmt = select(Case).order_by(Case.created_at.desc())
    else:
        stmt = (
            select(Case)
            .join(CaseAssignment, CaseAssignment.case_id == Case.id)
            .where(CaseAssignment.user_id == current_user.id)
            .order_by(Case.created_at.desc())
        )

    result = await db.execute(stmt)
    cases = result.scalars().all()

    return [
        {
            "id": str(c.id),
            "title": c.title,
            "description": c.description,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "created_by": str(c.created_by) if c.created_by else None,
        }
        for c in cases
    ]


# ---------- Admin: Assign / Unassign Investigator ----------

@router.post("/assign")
async def assign_case(
    payload: AssignPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin-only: Assign investigator to a case."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # ✅ FIXED: removed .value (they are plain strings)
    existing = await db.execute(
        select(CaseAssignment).where(
            CaseAssignment.case_id == payload.case_id,
            CaseAssignment.user_id == payload.user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This user is already assigned to this case")

    assignment = CaseAssignment(
        case_id=payload.case_id,
        user_id=payload.user_id,
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)

    await create_audit(
        db, str(current_user.id), None, "assign_case",
        "POST", "/cases/assign", 200
    )

    return {
        "message": "Case successfully assigned",
        "assignment_id": str(assignment.id),
        "case_id": str(assignment.case_id),
        "user_id": str(assignment.user_id),
    }


@router.post("/unassign")
async def unassign_case(
    payload: AssignPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin-only: Unassign investigator from a case."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # ✅ FIXED: removed .value (use plain strings)
    stmt = delete(CaseAssignment).where(
        CaseAssignment.case_id == payload.case_id,
        CaseAssignment.user_id == payload.user_id,
    )
    await db.execute(stmt)
    await db.commit()

    await create_audit(
        db, str(current_user.id), None, "unassign_case",
        "POST", "/cases/unassign", 200
    )

    return {"ok": True, "unassigned": True}


# ---------- Admin: View All Case Assignments ----------

@router.get("/assignments")
async def list_assignments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin-only: List all case assignments."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    stmt = (
        select(
            CaseAssignment,
            Case.title.label("case_title"),
            User.username.label("investigator_name"),
            User.email.label("investigator_email"),
        )
        .join(Case, Case.id == CaseAssignment.case_id)
        .join(User, User.id == CaseAssignment.user_id)
        .order_by(CaseAssignment.assigned_at.desc())
    )

    res = await db.execute(stmt)
    rows = res.fetchall()

    return [
        {
            "assignment_id": str(r.CaseAssignment.id),
            "case_id": str(r.CaseAssignment.case_id),
            "case_title": r.case_title,
            "investigator_id": str(r.CaseAssignment.user_id),
            "investigator_name": r.investigator_name,
            "investigator_email": r.investigator_email,
            "assigned_at": r.CaseAssignment.assigned_at.isoformat(),
        }
        for r in rows
    ]
