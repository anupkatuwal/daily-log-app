"""Pydantic schemas for the nested daily-log payload."""
from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class _ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Food / meals ─────────────────────────────────────────────────────────
class FoodItemIn(BaseModel):
    name: str
    quantity: float = 1
    unit: str = "serving"
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    sort_order: int = 0


class FoodItemOut(_ORM, FoodItemIn):
    id: int


class MealIn(BaseModel):
    name: str
    sort_order: int = 0
    food_items: list[FoodItemIn] = Field(default_factory=list)


class MealOut(_ORM):
    id: int
    name: str
    sort_order: int
    food_items: list[FoodItemOut] = Field(default_factory=list)


# ── PEDs ─────────────────────────────────────────────────────────────────
class PedIn(BaseModel):
    compound: str
    dose: float | None = None
    unit: str = "mg"
    route: str | None = None
    taken_at: datetime | None = None
    notes: str | None = None


class PedOut(_ORM, PedIn):
    id: int


# ── Training ─────────────────────────────────────────────────────────────
class SetIn(BaseModel):
    set_number: int = 1
    reps: int | None = None
    weight: float | None = None
    weight_unit: str = "kg"
    rpe: float | None = None
    is_warmup: bool = False


class SetOut(_ORM, SetIn):
    id: int


class ExerciseIn(BaseModel):
    name: str
    muscle_group: str | None = None
    sort_order: int = 0
    sets: list[SetIn] = Field(default_factory=list)


class ExerciseOut(_ORM):
    id: int
    name: str
    muscle_group: str | None = None
    sort_order: int
    sets: list[SetOut] = Field(default_factory=list)


class TrainingSessionIn(BaseModel):
    name: str = "Workout"
    started_at: datetime | None = None
    duration_min: int | None = None
    notes: str | None = None
    exercises: list[ExerciseIn] = Field(default_factory=list)


class TrainingSessionOut(_ORM):
    id: int
    name: str
    started_at: datetime | None = None
    duration_min: int | None = None
    notes: str | None = None
    exercises: list[ExerciseOut] = Field(default_factory=list)


# ── Notes ────────────────────────────────────────────────────────────────
class NoteIn(BaseModel):
    content: str


class NoteOut(_ORM, NoteIn):
    id: int


# ── Full day log ─────────────────────────────────────────────────────────
class DailyLogIn(BaseModel):
    log_date: date
    bodyweight: float | None = None
    meals: list[MealIn] = Field(default_factory=list)
    peds: list[PedIn] = Field(default_factory=list)
    sessions: list[TrainingSessionIn] = Field(default_factory=list)
    notes: list[NoteIn] = Field(default_factory=list)


class DailyLogUpdate(BaseModel):
    """Same shape as DailyLogIn but log_date comes from the URL path."""
    bodyweight: float | None = None
    meals: list[MealIn] = Field(default_factory=list)
    peds: list[PedIn] = Field(default_factory=list)
    sessions: list[TrainingSessionIn] = Field(default_factory=list)
    notes: list[NoteIn] = Field(default_factory=list)


class DailyLogOut(_ORM):
    id: int
    log_date: date
    bodyweight: float | None = None
    created_at: datetime
    updated_at: datetime
    meals: list[MealOut] = Field(default_factory=list)
    peds: list[PedOut] = Field(default_factory=list)
    sessions: list[TrainingSessionOut] = Field(default_factory=list)
    notes: list[NoteOut] = Field(default_factory=list)


class DailyLogSummary(_ORM):
    """Lightweight row for the History list (GET /api/logs)."""
    id: int
    log_date: date
    bodyweight: float | None = None
    updated_at: datetime
