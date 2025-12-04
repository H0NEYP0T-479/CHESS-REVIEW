from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from .analysis import analyze_fen_position

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    fen: str
    depth: int = 12

# --- BATCH SUPPORT ---
class BatchAnalysisRequest(BaseModel):
    fens: List[str]
    depth: int = 10

class AnalysisResponse(BaseModel):
    best_move: Optional[str] = None
    evaluation: float
    mate: bool
    error: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Chess Engine API is running"}

@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest):
    data = analyze_fen_position(request.fen, request.depth)
    return data

@app.post("/analyze-batch", response_model=List[AnalysisResponse])
def analyze_batch(request: BatchAnalysisRequest):
    results = []
    for fen in request.fens:
        data = analyze_fen_position(fen, request.depth)
        results.append(data)
    return results