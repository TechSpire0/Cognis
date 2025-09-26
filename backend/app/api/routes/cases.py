from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_current_user
from app.models.user import User
from app.db.deps import get_db   

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("/create")
async def create_case(
    case_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can create cases"
        )

    return {"message": f"Case '{case_name}' created successfully by {current_user.username}"}


@router.get("/list")
async def list_cases(
    db: AsyncSession = Depends(get_db),   # ✅ use get_db
    current_user: User = Depends(get_current_user)
):
    # All roles can list cases
    return {"cases": ["Case A", "Case B", "Case C"], "user": current_user.username}
