from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import AnalysisRequest, AnalysisResponse
from .analysis import analyze_fen_position

app = FastAPI()

# CORS allow karna zaroori hai frontend ke liye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Filhal sab allow kar rahe hain testing ke liye
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Chess Engine API is running"}

@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest):
    data = analyze_fen_position(request.fen, request.depth)
    return data