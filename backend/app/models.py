"""SQLAlchemy ORM models — mirror migrations/001_init.sql."""
from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    pin_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())

    logs: Mapped[list["DailyLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class DailyLog(Base):
    __tablename__ = "daily_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    log_date: Mapped["Date"] = mapped_column(Date, nullable=False)
    bodyweight: Mapped[float | None] = mapped_column(Numeric(6, 2))
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped["DateTime"] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="logs")
    meals: Mapped[list["Meal"]] = relationship(
        back_populates="daily_log", cascade="all, delete-orphan", order_by="Meal.sort_order"
    )
    peds: Mapped[list["PedTaken"]] = relationship(
        back_populates="daily_log", cascade="all, delete-orphan"
    )
    sessions: Mapped[list["TrainingSession"]] = relationship(
        back_populates="daily_log", cascade="all, delete-orphan"
    )
    notes: Mapped[list["Note"]] = relationship(
        back_populates="daily_log", cascade="all, delete-orphan"
    )


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(primary_key=True)
    daily_log_id: Mapped[int] = mapped_column(ForeignKey("daily_logs.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())

    daily_log: Mapped["DailyLog"] = relationship(back_populates="meals")
    food_items: Mapped[list["FoodItem"]] = relationship(
        back_populates="meal", cascade="all, delete-orphan", order_by="FoodItem.sort_order"
    )


class FoodItem(Base):
    __tablename__ = "food_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meals.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(8, 2), default=1)
    unit: Mapped[str] = mapped_column(String, default="serving")
    calories: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    protein_g: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    carbs_g: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    fat_g: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())

    meal: Mapped["Meal"] = relationship(back_populates="food_items")


class PedTaken(Base):
    __tablename__ = "peds_taken"

    id: Mapped[int] = mapped_column(primary_key=True)
    daily_log_id: Mapped[int] = mapped_column(ForeignKey("daily_logs.id", ondelete="CASCADE"))
    compound: Mapped[str] = mapped_column(String, nullable=False)
    dose: Mapped[float | None] = mapped_column(Numeric(8, 2))
    unit: Mapped[str] = mapped_column(String, default="mg")
    route: Mapped[str | None] = mapped_column(String)
    taken_at: Mapped["DateTime | None"] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())

    daily_log: Mapped["DailyLog"] = relationship(back_populates="peds")


class TrainingSession(Base):
    __tablename__ = "training_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    daily_log_id: Mapped[int] = mapped_column(ForeignKey("daily_logs.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String, default="Workout")
    started_at: Mapped["DateTime | None"] = mapped_column(DateTime(timezone=True))
    duration_min: Mapped[int | None] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())

    daily_log: Mapped["DailyLog"] = relationship(back_populates="sessions")
    exercises: Mapped[list["Exercise"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="Exercise.sort_order"
    )


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    training_session_id: Mapped[int] = mapped_column(
        ForeignKey("training_sessions.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    muscle_group: Mapped[str | None] = mapped_column(String)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped["TrainingSession"] = relationship(back_populates="exercises")
    sets: Mapped[list["ExerciseSet"]] = relationship(
        back_populates="exercise", cascade="all, delete-orphan", order_by="ExerciseSet.set_number"
    )


class ExerciseSet(Base):
    __tablename__ = "sets"

    id: Mapped[int] = mapped_column(primary_key=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id", ondelete="CASCADE"))
    set_number: Mapped[int] = mapped_column(Integer, default=1)
    reps: Mapped[int | None] = mapped_column(Integer)
    weight: Mapped[float | None] = mapped_column(Numeric(7, 2))
    weight_unit: Mapped[str] = mapped_column(String, default="kg")
    rpe: Mapped[float | None] = mapped_column(Numeric(3, 1))
    is_warmup: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())

    exercise: Mapped["Exercise"] = relationship(back_populates="sets")


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    daily_log_id: Mapped[int] = mapped_column(ForeignKey("daily_logs.id", ondelete="CASCADE"))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped["DateTime"] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped["DateTime"] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    daily_log: Mapped["DailyLog"] = relationship(back_populates="notes")
