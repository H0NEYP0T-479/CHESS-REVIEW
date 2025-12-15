from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import timedelta

from .analysis import analyze_fen_position
from .database import get_db, init_db, User, UserProfile, Game, Puzzle, PuzzleAttempt
from .auth import (
    verify_password, get_password_hash, create_access_token,
    decode_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, Token
)
from .schemas import (
    UserCreate, UserLogin, UserResponse, UserProfileResponse, UserProfileUpdate,
    GameCreate, GameResponse, PuzzleResponse, PuzzleAttemptCreate,
    PuzzleAttemptResponse, LeaderboardEntry, LeaderboardResponse
)
from .rating import update_ratings, get_k_factor

app = FastAPI(title="Chess Review API")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


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


# --- HELPER FUNCTIONS ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    username = decode_access_token(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# --- AUTHENTICATION ENDPOINTS ---
@app.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create user profile
    profile = UserProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    
    return user


@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token"""
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user


@app.get("/users/me/profile", response_model=UserProfileResponse)
async def read_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@app.put("/users/me/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile


# --- GAME ENDPOINTS ---
@app.get("/games/my-games", response_model=List[GameResponse])
async def get_my_games(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    """Get current user's games"""
    games = db.query(Game).filter(
        (Game.white_player_id == current_user.id) | (Game.black_player_id == current_user.id)
    ).order_by(Game.created_at.desc()).offset(offset).limit(limit).all()
    return games


# --- LEADERBOARD ENDPOINTS ---
@app.get("/leaderboard/{time_control}", response_model=LeaderboardResponse)
async def get_leaderboard(
    time_control: str,
    db: Session = Depends(get_db),
    page: int = 1,
    per_page: int = 50
):
    """Get leaderboard for a specific time control"""
    offset = (page - 1) * per_page
    
    # Build query based on time control
    rating_field = f"rating_{time_control}"
    if not hasattr(UserProfile, rating_field):
        raise HTTPException(status_code=400, detail="Invalid time control")
    
    profiles = db.query(UserProfile, User).join(User).order_by(
        getattr(UserProfile, rating_field).desc()
    ).offset(offset).limit(per_page).all()
    
    entries = [
        LeaderboardEntry(
            username=user.username,
            rating=getattr(profile, rating_field),
            total_games=profile.total_games,
            wins=profile.wins,
            losses=profile.losses,
            draws=profile.draws
        )
        for profile, user in profiles
    ]
    
    total_count = db.query(UserProfile).count()
    
    return LeaderboardResponse(
        entries=entries,
        total_count=total_count,
        page=page,
        per_page=per_page
    )


# --- PUZZLE ENDPOINTS ---
@app.get("/puzzles/daily", response_model=PuzzleResponse)
async def get_daily_puzzle(db: Session = Depends(get_db)):
    """Get today's daily puzzle"""
    from datetime import date
    today = date.today()
    puzzle = db.query(Puzzle).filter(
        Puzzle.is_daily == True,
        Puzzle.daily_date == today
    ).first()
    
    if not puzzle:
        # If no daily puzzle, get a random one
        puzzle = db.query(Puzzle).order_by(Puzzle.id).first()
    
    if not puzzle:
        raise HTTPException(status_code=404, detail="No puzzles available")
    
    return puzzle


@app.post("/puzzles/attempt", response_model=PuzzleAttemptResponse)
async def submit_puzzle_attempt(
    attempt: PuzzleAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a puzzle attempt"""
    puzzle_attempt = PuzzleAttempt(
        user_id=current_user.id,
        puzzle_id=attempt.puzzle_id,
        solved=attempt.solved,
        time_taken_seconds=attempt.time_taken_seconds
    )
    db.add(puzzle_attempt)
    db.commit()
    db.refresh(puzzle_attempt)
    return puzzle_attempt


# --- ANALYSIS ENDPOINTS (EXISTING) ---
@app.get("/")
def read_root():
    return {"message": "Chess Review API is running"}


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
