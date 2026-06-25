"""Daily-log CRUD. One log per user per date; payload is fully nested."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..auth import get_current_user
from ..db import get_db
from ..models import (
    DailyLog,
    Exercise,
    ExerciseSet,
    FoodItem,
    Meal,
    Note,
    PedTaken,
    TrainingSession,
    User,
)
from ..schemas import DailyLogIn, DailyLogOut, DailyLogSummary, DailyLogUpdate

router = APIRouter(prefix="/api/logs", tags=["logs"])

# Eager-load the whole tree so responses don't trigger N+1 lazy loads.
_FULL_TREE = (
    selectinload(DailyLog.meals).selectinload(Meal.food_items),
    selectinload(DailyLog.peds),
    selectinload(DailyLog.sessions)
    .selectinload(TrainingSession.exercises)
    .selectinload(Exercise.sets),
    selectinload(DailyLog.notes),
)


def _apply_children(log: DailyLog, payload) -> None:
    """Populate a log's child collections from a parsed payload.

    Used by both create and update — on update the caller clears the existing
    collections first so cascade-orphan deletes the old rows.
    """
    log.meals = [
        Meal(
            name=m.name,
            sort_order=m.sort_order,
            food_items=[FoodItem(**fi.model_dump()) for fi in m.food_items],
        )
        for m in payload.meals
    ]
    log.peds = [PedTaken(**p.model_dump()) for p in payload.peds]
    log.sessions = [
        TrainingSession(
            name=s.name,
            started_at=s.started_at,
            duration_min=s.duration_min,
            notes=s.notes,
            exercises=[
                Exercise(
                    name=e.name,
                    muscle_group=e.muscle_group,
                    sort_order=e.sort_order,
                    sets=[ExerciseSet(**st.model_dump()) for st in e.sets],
                )
                for e in s.exercises
            ],
        )
        for s in payload.sessions
    ]
    log.notes = [Note(**n.model_dump()) for n in payload.notes]


def _load_full(db: Session, user: User, log_date: date) -> DailyLog | None:
    return db.scalar(
        select(DailyLog)
        .where(DailyLog.user_id == user.id, DailyLog.log_date == log_date)
        .options(*_FULL_TREE)
    )


@router.post("", response_model=DailyLogOut, status_code=status.HTTP_201_CREATED)
def create_log(
    body: DailyLogIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    existing = db.scalar(
        select(DailyLog).where(
            DailyLog.user_id == user.id, DailyLog.log_date == body.log_date
        )
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"A log for {body.log_date} already exists. Use PUT to update it.",
        )

    log = DailyLog(user_id=user.id, log_date=body.log_date, bodyweight=body.bodyweight)
    _apply_children(log, body)
    db.add(log)
    db.commit()
    return _load_full(db, user, body.log_date)


@router.get("", response_model=list[DailyLogSummary])
def list_logs(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(
        select(DailyLog)
        .where(DailyLog.user_id == user.id)
        .order_by(DailyLog.log_date.desc())
    ).all()


@router.get("/{log_date}", response_model=DailyLogOut)
def get_log(
    log_date: date,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    log = _load_full(db, user, log_date)
    if log is None:
        raise HTTPException(status_code=404, detail=f"No log found for {log_date}")
    return log


@router.put("/{log_date}", response_model=DailyLogOut)
def update_log(
    log_date: date,
    body: DailyLogUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    log = _load_full(db, user, log_date)
    if log is None:
        raise HTTPException(status_code=404, detail=f"No log found for {log_date}")

    log.bodyweight = body.bodyweight
    # Clearing first lets cascade-orphan remove the old child rows; _apply_children
    # then attaches the replacements.
    log.meals.clear()
    log.peds.clear()
    log.sessions.clear()
    log.notes.clear()
    db.flush()
    _apply_children(log, body)
    db.commit()
    return _load_full(db, user, log_date)


@router.delete("/{log_date}", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(
    log_date: date,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    log = db.scalar(
        select(DailyLog).where(
            DailyLog.user_id == user.id, DailyLog.log_date == log_date
        )
    )
    if log is None:
        raise HTTPException(status_code=404, detail=f"No log found for {log_date}")
    db.delete(log)
    db.commit()
