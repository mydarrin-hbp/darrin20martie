from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import ensure_module_access, get_current_admin_profile, get_current_admin_user
from app.models.user import User, UserRole
from app.schemas.admin_rbac import AdminInviteResponse, AdminProfileResponse, InviteAdminRequest
from app.services.admin_rbac_service import invite_admin, list_admin_profiles, revoke_admin_access


router = APIRouter(
    prefix="/backoffice",
    tags=["AdminTeam"],
    dependencies=[Depends(get_current_admin_user)],
)


def _require_team_access(current_admin: User, admin_profile) -> None:
    if current_admin.role == UserRole.SUPER_ADMIN.value:
        return
    ensure_module_access(current_admin, admin_profile, "team")


@router.get("/admins", response_model=list[AdminProfileResponse])
def list_admin_collaborators(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    _require_team_access(current_admin, admin_profile)
    return list_admin_profiles(db)


@router.post("/invite-admin", response_model=AdminInviteResponse, status_code=status.HTTP_201_CREATED)
def invite_admin_collaborator(
    payload: InviteAdminRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    _require_team_access(current_admin, admin_profile)
    try:
        return invite_admin(db, current_admin=current_admin, payload=payload)
    except ValueError as exc:
        if str(exc) == "unsupported_role":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported admin role") from exc
        raise


@router.post("/admins/{admin_id}/revoke", response_model=AdminProfileResponse)
def revoke_admin_collaborator(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    _require_team_access(current_admin, admin_profile)
    admin = revoke_admin_access(db, admin_id)
    if admin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin collaborator not found")
    return admin
