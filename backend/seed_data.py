"""Seed database with initial data"""
import sys
from datetime import date
from app.database import SessionLocal, init_db, Puzzle, User, UserProfile
from app.auth import get_password_hash

def seed_puzzles():
    """Add sample puzzles to the database"""
    db = SessionLocal()
    
    # Check if puzzles already exist
    existing = db.query(Puzzle).first()
    if existing:
        print("Puzzles already exist. Skipping.")
        db.close()
        return
    
    sample_puzzles = [
        {
            "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
            "moves": "f3g5,d7d5,g5f7",  # Fried Liver Attack
            "rating": 1500,
            "themes": "fork,attack",
            "is_daily": True,
            "daily_date": date.today()
        },
        {
            "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
            "moves": "f1b5",  # Ruy Lopez opening puzzle
            "rating": 1200,
            "themes": "opening,pin",
            "is_daily": False
        },
        {
            "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
            "moves": "c7c5",  # Sicilian Defense
            "rating": 1000,
            "themes": "opening",
            "is_daily": False
        }
    ]
    
    for puzzle_data in sample_puzzles:
        puzzle = Puzzle(**puzzle_data)
        db.add(puzzle)
    
    db.commit()
    print(f"Added {len(sample_puzzles)} puzzles to database")
    db.close()

def seed_test_user():
    """Add a test user to the database"""
    db = SessionLocal()
    
    # Check if test user already exists
    existing = db.query(User).filter(User.username == "testuser").first()
    if existing:
        print("Test user already exists. Skipping.")
        db.close()
        return
    
    # Create test user
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("password123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create profile for test user
    profile = UserProfile(
        user_id=user.id,
        rating_bullet=1400,
        rating_blitz=1500,
        rating_rapid=1550,
        rating_classical=1600,
        puzzle_rating=1450
    )
    db.add(profile)
    db.commit()
    
    print(f"Created test user: testuser / password123")
    db.close()

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    
    print("\nSeeding puzzles...")
    seed_puzzles()
    
    print("\nSeeding test user...")
    seed_test_user()
    
    print("\nDatabase seeding complete!")
