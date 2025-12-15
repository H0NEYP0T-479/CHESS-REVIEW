# Chess Review - Full-Featured Chess Platform

A comprehensive chess platform featuring live play, game analysis, puzzles, ratings, and more. Built with React + TypeScript frontend and FastAPI backend.

## Features

### ✅ Implemented
- **Game Analysis**: Upload and analyze chess games with move classification and accuracy tracking
- **User Authentication**: Sign up, login, and session management with JWT
- **User Profiles**: Track ratings, game history, and statistics
- **Leaderboards**: View top players by time control (Bullet, Blitz, Rapid, Classical)
- **Puzzles**: Daily puzzle feature with rating system
- **Elo Rating System**: Automatic rating updates after each game
- **Responsive UI**: Modern, accessible interface with navigation

### 🚧 In Development
- **Live Play (PvP)**: Real-time chess with WebSocket support
- **Player vs Engine (PvE)**: Play against Stockfish with adjustable difficulty
- **Advanced Analysis**: Evaluation graphs and move annotations
- **Puzzle Trainer**: Adaptive difficulty puzzle solving
- **Social Features**: Friends, chat, and challenges
- **Themes**: Light/dark mode and board customization

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- React Router for navigation
- Axios for API calls
- react-chessboard for board UI
- chess.js for game logic

### Backend
- FastAPI (Python)
- SQLAlchemy for database ORM
- SQLite for data storage
- JWT authentication
- Stockfish engine for analysis
- Elo rating calculation

## Setup Instructions

### Quick Start (Linux/Mac)

```bash
# Run the setup script
./setup.sh

# Start the development servers
./start-dev.sh
```

Then open http://localhost:5173 in your browser.

**Test credentials:**
- Username: `testuser`
- Password: `password123`

### Manual Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Stockfish chess engine (for analysis)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL if needed
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize database:
```bash
python -m app.database
```

5. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```

### Backend
```
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=sqlite:///./chess_review.db
```

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /token` - Login and get JWT token
- `GET /users/me` - Get current user info
- `GET /users/me/profile` - Get user profile
- `PUT /users/me/profile` - Update user profile

### Games
- `GET /games/my-games` - Get user's games
- (More endpoints coming soon)

### Leaderboards
- `GET /leaderboard/{time_control}` - Get leaderboard for time control

### Puzzles
- `GET /puzzles/daily` - Get daily puzzle
- `POST /puzzles/attempt` - Submit puzzle attempt

### Analysis
- `POST /analyze` - Analyze single position
- `POST /analyze-batch` - Batch analyze multiple positions

## Project Structure

```
CHESS-REVIEW/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app
│   │   ├── database.py       # Database models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py          # Authentication utilities
│   │   ├── rating.py        # Elo rating calculation
│   │   └── analysis.py      # Chess analysis
│   └── requirements.txt
├── src/
│   ├── components/          # React components
│   ├── contexts/           # React contexts
│   ├── pages/             # Page components
│   ├── App.tsx           # Main app component
│   └── main.tsx         # Entry point
├── package.json
└── README.md
```

## Development

### Running Tests
```bash
npm run lint
npm run build
```

### Code Style
- ESLint for JavaScript/TypeScript
- Follow existing code patterns
- Add comments for complex logic

## Contributing

See CONTRIBUTING.md for guidelines.

## License

MIT License - See LICENSE file for details

## Roadmap

- [ ] WebSocket server for live games
- [ ] Complete PvP matchmaking
- [ ] stockfish.wasm integration
- [ ] Complete puzzle solver UI
- [ ] Game evaluation graphs
- [ ] Social features (friends, chat)
- [ ] Mobile responsive improvements
- [ ] E2E tests
- [ ] CI/CD pipeline

## Support

For issues and questions, please open a GitHub issue.

