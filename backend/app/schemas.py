"""Pydantic schemas for API requests and responses"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.database import TimeControl, GameResult


# User Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    rating_bullet: int
    rating_blitz: int
    rating_rapid: int
    rating_classical: int
    puzzle_rating: int
    total_games: int
    wins: int
    losses: int
    draws: int
    preferred_time_control: TimeControl
    board_theme: str
    piece_style: str
    sound_enabled: bool
    
    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    preferred_time_control: Optional[TimeControl] = None
    board_theme: Optional[str] = None
    piece_style: Optional[str] = None
    sound_enabled: Optional[bool] = None


# Game Schemas
class GameCreate(BaseModel):
    opponent_id: Optional[int] = None
    time_control: TimeControl
    time_limit_seconds: int
    increment_seconds: int = 0
    is_rated: bool = True
    is_vs_engine: bool = False
    engine_difficulty: Optional[int] = None


class GameResponse(BaseModel):
    id: int
    white_player_id: int
    black_player_id: int
    time_control: TimeControl
    time_limit_seconds: int
    increment_seconds: int
    result: GameResult
    pgn: Optional[str]
    is_rated: bool
    is_vs_engine: bool
    engine_difficulty: Optional[int]
    created_at: datetime
    completed_at: Optional[datetime]
    white_rating_before: Optional[int]
    white_rating_after: Optional[int]
    black_rating_before: Optional[int]
    black_rating_after: Optional[int]
    
    class Config:
        from_attributes = True


class GameMove(BaseModel):
    game_id: int
    move: str  # UCI format (e.g., "e2e4")
    fen: str


# Puzzle Schemas
class PuzzleResponse(BaseModel):
    id: int
    fen: str
    moves: str
    rating: int
    themes: Optional[str]
    is_daily: bool
    
    class Config:
        from_attributes = True


class PuzzleAttemptCreate(BaseModel):
    puzzle_id: int
    solved: bool
    time_taken_seconds: Optional[int] = None


class PuzzleAttemptResponse(BaseModel):
    id: int
    puzzle_id: int
    solved: bool
    time_taken_seconds: Optional[int]
    attempted_at: datetime
    
    class Config:
        from_attributes = True


# Leaderboard Schemas
class LeaderboardEntry(BaseModel):
    username: str
    rating: int
    total_games: int
    wins: int
    losses: int
    draws: int


class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    total_count: int
    page: int
    per_page: int
