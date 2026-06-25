"""Auth endpoints: register a user and log in with a PIN/password."""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import create_token, hash_pin, verify_pin
from ..db import get_db
from ..limiter import limiter
from ..models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    pin: str = Field(min_length=4, max_length=64)

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may only contain letters, numbers, _ and -")
        return v.lower()


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def register(request: Request, body: Credentials, db: Session = Depends(get_db)):
    exists = db.scalar(select(User).where(User.username == body.username))
    if exists:
        raise HTTPException(status_code=409, detail="Username already taken")
    user = User(username=body.username, pin_hash=hash_pin(body.pin))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(access_token=create_token(user.id))


@router.post("/login", response_model=TokenOut)
@limiter.limit("20/minute")
def login(request: Request, body: Credentials, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == body.username))
    if user is None or not verify_pin(body.pin, user.pin_hash):
        raise HTTPException(status_code=401, detail="Invalid username or PIN")
    return TokenOut(access_token=create_token(user.id))
