from pydantic import BaseModel
from typing import Optional

class AnalysisRequest(BaseModel):
    fen: str
    depth: int = 12

class AnalysisResponse(BaseModel):
    best_move: Optional[str] = None
    evaluation: float
    mate: bool
    error: Optional[str] = None