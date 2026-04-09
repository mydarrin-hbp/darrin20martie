from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.deviz_engine.schemas import (
    DevizLevelRuleCreate,
    DevizLevelRuleResponse,
    DevizLevelRuleUpdate,
)
from app.modules.deviz_engine.service import (
    create_admin_deviz_rule,
    delete_admin_deviz_rule,
    get_admin_deviz_rule,
    list_admin_deviz_rules,
    update_admin_deviz_rule,
)

router = APIRouter(
    prefix="/deviz/admin-configs",
    tags=["deviz-engine-admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=list[DevizLevelRuleResponse])
def list_rules(db: Session = Depends(get_db)):
    return list_admin_deviz_rules(db)


@router.get("/{rule_id}", response_model=DevizLevelRuleResponse)
def get_rule(rule_id: int, db: Session = Depends(get_db)):
    result = get_admin_deviz_rule(db, rule_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deviz rule not found")
    return result


@router.post("", response_model=DevizLevelRuleResponse, status_code=status.HTTP_201_CREATED)
def create_rule(data: DevizLevelRuleCreate, db: Session = Depends(get_db)):
    result = create_admin_deviz_rule(db, data)
    if result == "duplicate_context":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A deviz rule already exists for this context",
        )
    return result


@router.put("/{rule_id}", response_model=DevizLevelRuleResponse)
def update_rule(rule_id: int, data: DevizLevelRuleUpdate, db: Session = Depends(get_db)):
    result = update_admin_deviz_rule(db, rule_id, data)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deviz rule not found")
    return result


@router.delete("/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    deleted = delete_admin_deviz_rule(db, rule_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deviz rule not found")
    return {"message": "Deviz rule deleted"}
