"""Database configuration and models using SQLAlchemy"""
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

# Database URL - use SQLite by default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./chess_review.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class TimeControl(str, enum.Enum):
    BULLET = "bullet"  # < 3 minutes
    BLITZ = "blitz"    # 3-10 minutes
    RAPID = "rapid"    # 10-30 minutes
    CLASSICAL = "classical"  # > 30 minutes


class GameResult(str, enum.Enum):
    WHITE_WIN = "white_win"
    BLACK_WIN = "black_win"
    DRAW = "draw"
    ONGOING = "ongoing"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    games_as_white = relationship("Game", foreign_keys="Game.white_player_id", back_populates="white_player")
    games_as_black = relationship("Game", foreign_keys="Game.black_player_id", back_populates="black_player")
    puzzle_attempts = relationship("PuzzleAttempt", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Ratings by time control
    rating_bullet = Column(Integer, default=1200)
    rating_blitz = Column(Integer, default=1200)
    rating_rapid = Column(Integer, default=1200)
    rating_classical = Column(Integer, default=1200)
    puzzle_rating = Column(Integer, default=1200)
    
    # Stats
    total_games = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    draws = Column(Integer, default=0)
    
    # Preferences
    preferred_time_control = Column(Enum(TimeControl), default=TimeControl.BLITZ)
    board_theme = Column(String, default="default")
    piece_style = Column(String, default="standard")
    sound_enabled = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="profile")


class Game(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    white_player_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    black_player_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    time_control = Column(Enum(TimeControl), nullable=False)
    time_limit_seconds = Column(Integer, nullable=False)  # Total time per player
    increment_seconds = Column(Integer, default=0)  # Increment per move
    
    result = Column(Enum(GameResult), default=GameResult.ONGOING)
    pgn = Column(Text, nullable=True)
    
    is_rated = Column(Boolean, default=True)
    is_vs_engine = Column(Boolean, default=False)
    engine_difficulty = Column(Integer, nullable=True)  # 1-10 if vs engine
    
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Ratings before and after (for rating calculation)
    white_rating_before = Column(Integer, nullable=True)
    white_rating_after = Column(Integer, nullable=True)
    black_rating_before = Column(Integer, nullable=True)
    black_rating_after = Column(Integer, nullable=True)
    
    white_player = relationship("User", foreign_keys=[white_player_id], back_populates="games_as_white")
    black_player = relationship("User", foreign_keys=[black_player_id], back_populates="games_as_black")


class Puzzle(Base):
    __tablename__ = "puzzles"
    
    id = Column(Integer, primary_key=True, index=True)
    fen = Column(String, nullable=False)
    moves = Column(String, nullable=False)  # Solution moves (comma-separated)
    rating = Column(Integer, nullable=False)
    themes = Column(String, nullable=True)  # Comma-separated themes (fork, pin, etc.)
    popularity = Column(Integer, default=0)
    is_daily = Column(Boolean, default=False)
    daily_date = Column(DateTime, nullable=True)
    
    attempts = relationship("PuzzleAttempt", back_populates="puzzle")


class PuzzleAttempt(Base):
    __tablename__ = "puzzle_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    puzzle_id = Column(Integer, ForeignKey("puzzles.id"), nullable=False)
    
    solved = Column(Boolean, nullable=False)
    time_taken_seconds = Column(Integer, nullable=True)
    attempted_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="puzzle_attempts")
    puzzle = relationship("Puzzle", back_populates="attempts")


class Friendship(Base):
    __tablename__ = "friendships"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    """Dependency for FastAPI routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")
