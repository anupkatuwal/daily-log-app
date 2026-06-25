"""Macro estimator using Claude."""
import os

from anthropic import Anthropic
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..auth import get_current_user
from ..models import User

router = APIRouter(prefix="/api", tags=["estimate"])
client = Anthropic()


class EstimateRequest(BaseModel):
    food_description: str


class EstimateResponse(BaseModel):
    protein_g: float
    carbs_g: float
    fat_g: float
    confidence: str


@router.post("/estimate-macros", response_model=EstimateResponse)
def estimate_macros(
    body: EstimateRequest,
    user: User = Depends(get_current_user),
):
    """Estimate macros from a natural-language food description using Claude."""
    prompt = f"""You are a nutrition expert. Given a food description, estimate the macronutrient content per serving.

Food description: "{body.food_description}"

Respond ONLY with valid JSON (no markdown, no code fence) in this exact format:
{{"protein_g": <number>, "carbs_g": <number>, "fat_g": <number>, "confidence": "<low|medium|high>"}}

Where:
- protein_g: grams of protein (best guess)
- carbs_g: grams of carbohydrates (best guess)
- fat_g: grams of fat (best guess)
- confidence: "high" if this is a common food with well-known macros, "medium" if reasonable estimate, "low" if very ambiguous

Be conservative: if uncertain, lean toward slightly lower estimates to avoid overestimating calories."""

    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        response_text = msg.content[0].text.strip()
        # Try to parse as JSON
        import json

        data = json.loads(response_text)
        return EstimateResponse(
            protein_g=data.get("protein_g", 0),
            carbs_g=data.get("carbs_g", 0),
            fat_g=data.get("fat_g", 0),
            confidence=data.get("confidence", "low"),
        )
    except Exception as e:
        # Fallback: return zeros if estimation fails
        return EstimateResponse(
            protein_g=0, carbs_g=0, fat_g=0, confidence="low"
        )
