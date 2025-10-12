# backend/app/api/routes/admin.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from datetime import datetime, timedelta
import os
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.ufdrfile import UFDRFile
from app.utils.audit_utils import create_audit
from app.core.cache import del_pattern
from app.models.user import User, UserRole
from app.schemas.user import AdminCreate, UserOut
from app.core.security import get_password_hash
import secrets

router = APIRouter(prefix="/admin", tags=["admin"])

@router.patch("/ufdr/{ufdr_id}/soft_delete")
async def soft_delete_ufdr(ufdr_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin required")
    result = await db.execute(select(UFDRFile).where(UFDRFile.id == ufdr_id))
    ufdr = result.scalars().first()
    if not ufdr:
        raise HTTPException(status_code=404, detail="UFDR not found")
    ufdr.is_deleted = True
    ufdr.deleted_at = datetime.utcnow()
    db.add(ufdr)
    await db.commit()
    await create_audit(db, str(current_user.id), None, "soft_delete", "PATCH", f"/api/v1/admin/ufdr/{ufdr_id}/soft_delete", 200, None)
    return {"ok": True}

@router.delete("/ufdr/{ufdr_id}")
async def hard_delete_ufdr(ufdr_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin required")
    result = await db.execute(select(UFDRFile).where(UFDRFile.id == ufdr_id))
    ufdr = result.scalars().first()
    if not ufdr:
        raise HTTPException(status_code=404, detail="UFDR not found")
    # Remove file from disk if exists
    try:
        if ufdr.storage_path and os.path.exists(ufdr.storage_path):
            os.remove(ufdr.storage_path)
    except Exception:
        pass
    # delete DB record (cascade deletes artifacts)
    await db.execute(delete(UFDRFile).where(UFDRFile.id == ufdr_id))
    await db.commit()
    # Clear Redis caches for this ufdr
    try:
        await del_pattern(f"llm:{ufdr_id}:*")
        await del_pattern(f"search:{ufdr_id}:*")
    except Exception:
        pass
    await create_audit(db, str(current_user.id), None, "hard_delete", "DELETE", f"/api/v1/admin/ufdr/{ufdr_id}", 200, None)
    return {"ok": True}

@router.post("/retention")
async def run_retention(days: int = Body(..., embed=True), mode: str = Body("soft", embed=True), db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Trigger retention sweep: soft or hard delete UFDRFiles older than `days`.
    mode: "soft" or "hard"
    """
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin required")
    threshold = datetime.utcnow() - timedelta(days=days)
    q = select(UFDRFile).where(UFDRFile.uploaded_at < threshold, UFDRFile.is_deleted == False)
    res = await db.execute(q)
    rows = res.scalars().all()
    affected = []
    for ufdr in rows:
        if mode == "soft":
            ufdr.is_deleted = True
            ufdr.deleted_at = datetime.utcnow()
            db.add(ufdr)
        else:
            # hard delete: remove file then delete record
            try:
                if ufdr.storage_path and os.path.exists(ufdr.storage_path):
                    os.remove(ufdr.storage_path)
            except Exception:
                pass
            await db.execute(delete(UFDRFile).where(UFDRFile.id == ufdr.id))
            try:
                await del_pattern(f"llm:{ufdr.id}:*")
                await del_pattern(f"search:{ufdr.id}:*")
            except Exception:
                pass
        affected.append(str(ufdr.id))
    await db.commit()
    await create_audit(db, str(current_user.id), None, "retention", "POST", "/api/v1/admin/retention", 200, None)
    return {"deleted": affected, "mode": mode}


@router.post("/users/create", response_model=UserOut)
async def create_user_admin(
    payload: AdminCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin-only: Create new admin or investigator accounts."""
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Admin required")

    q = await db.execute(
        select(User).where(
            (User.email == payload.email) | (User.username == payload.username)
        )
    )
    if q.scalars().first():
        raise HTTPException(status_code=400, detail="Username or email already exists")

    temp_password = payload.temp_password or secrets.token_urlsafe(8)
    hashed = get_password_hash(temp_password)

    new_user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hashed,
        role=payload.role,
        force_password_change=True,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    await create_audit(
        db,
        str(current_user.id),
        None,
        "user_create",
        "POST",
        "/api/v1/admin/users/create",
        201,
        None,
    )

    # Return temp password ONLY once to admin
    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role,
        "force_password_change": new_user.force_password_change,
        "temp_password": temp_password,
    }
