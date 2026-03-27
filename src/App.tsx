<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Play from './pages/Play'
import Analysis from './pages/Analysis'
import Puzzles from './pages/Puzzles'
import Leaderboard from './pages/Leaderboard'
import './App.css'

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" />
}

function AppContent() {
  return (
    <div className="app-wrapper">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/play" element={<ProtectedRoute><Play /></ProtectedRoute>} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/puzzles" element={<ProtectedRoute><Puzzles /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
=======
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import "./index.css";
import MoveList from "./components/MoveList";
import SavedMovesModal from "./components/SavedMovesModal";
import { MoveInfo, SavedMove } from "./types";
import MoveIcon from "./components/MoveIcon";

/**
 * Notes:
 * - This App.tsx provides integration points for:
 *   - displaying White/Black player names (extracted from PGN)
 *   - showing move-quality icons above each move and overlaying icons on the board
 *   - saving moves (to localStorage + optional backend)
 *
 * - It assumes your existing board markup is a container we can overlay icons on.
 *   If your board is a third-party component, you may need to expose square coordinates
 *   or accept an overlay prop. The overlay code here uses a simple mapping for an 8x8 grid.
 */

const SAMPLE_PGN = `[Event "Casual Game"]
[Site "Chess.com"]
[Date "2025.10.10"]
[White "Alpha"]
[Black "Beta"]
[Result "1-0"]

1. e4 {Good Move} e5 {Inaccuracy} 2. Nf3 {Best Move} Nc6 {Best Move} 3. Bb5 {Great Move} a6 {Mistake} 4. Ba4 {Good Move} Nf6 {Blunder}
`;

function parsePGN(pgn: string): { white: string; black: string; moves: MoveInfo[] } {
  // Very small PGN parser for the fields we need (player names and SAN + evaluation tags)
  const lines = pgn.split("\n");
  let white = "White";
  let black = "Black";
  lines.forEach((l) => {
    const m = l.match(/^\[White\s+"(.*)"\]/);
    if (m) white = m[1];
    const m2 = l.match(/^\[Black\s+"(.*)"\]/);
    if (m2) black = m2[1];
  });

  // Extract move tokens from the body (naive)
  const body = lines.filter((l) => !l.startsWith("[")).join(" ").trim();
  if (!body) return { white, black, moves: [] };

  // tokens like: 1. e4 {Good Move} e5 {Inaccuracy} 2. Nf3 {Best Move}
  const tokenRegex = /(\d+\.)\s*([^\s{]+)(?:\s*\{([^}]+)\})?\s*([^\s{]+)?(?:\s*\{([^}]+)\})?/g;
  const moves: MoveInfo[] = [];
  let match;
  while ((match = tokenRegex.exec(body)) !== null) {
    // match groups:
    // 2 -> white SAN
    // 3 -> white eval (optional)
    // 4 -> black SAN (optional)
    // 5 -> black eval (optional)
    const whiteSAN = match[2];
    const whiteEval = match[3] ? mapEvalTag(match[3].trim()) : undefined;
    if (whiteSAN && whiteSAN !== "1-0" && whiteSAN !== "0-1" && whiteSAN !== "1/2-1/2") {
      moves.push({
        san: whiteSAN,
        color: "w",
        eval: whiteEval || "unknown",
        id: `w${moves.length}-${Date.now()}`
      });
    }
    const blackSAN = match[4];
    const blackEval = match[5] ? mapEvalTag(match[5].trim()) : undefined;
    if (blackSAN && blackSAN !== "1-0" && blackSAN !== "0-1" && blackSAN !== "1/2-1/2") {
      moves.push({
        san: blackSAN,
        color: "b",
        eval: blackEval || "unknown",
        id: `b${moves.length}-${Date.now()}`
      });
    }
  }

  return { white, black, moves };
}

function mapEvalTag(tag: string): MoveInfo["eval"] {
  // Map many label variants to normalized keys
  const t = tag.toLowerCase();
  if (t.includes("brilliant")) return "brilliant";
  if (t.includes("great")) return "great";
  if (t.includes("best")) return "best";
  if (t.includes("good")) return "good";
  if (t.includes("inaccuracy")) return "inaccuracy";
  if (t.includes("mistake")) return "mistake";
  if (t.includes("blunder")) return "blunder";
  return "unknown";
}

function sendSaveToBackend(savedMove: SavedMove) {
  // Optional backend persistence. If /api/saved_moves is available it will be called.
  fetch("/api/saved_moves", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(savedMove)
  }).catch(() => {
    // ignore failure — backend optional
  });
}

function App(): JSX.Element {
  const [pgnText, setPgnText] = useState<string>(SAMPLE_PGN);
  const [playerWhite, setPlayerWhite] = useState("White");
  const [playerBlack, setPlayerBlack] = useState("Black");
  const [moves, setMoves] = useState<MoveInfo[]>([]);
  const [savedMoves, setSavedMoves] = useState<SavedMove[]>(() => {
    try {
      const raw = localStorage.getItem("chess_saved_moves_v1");
      return raw ? (JSON.parse(raw) as SavedMove[]) : [];
    } catch {
      return [];
    }
  });
  const [showSavedModal, setShowSavedModal] = useState(false);

  useEffect(() => {
    const parsed = parsePGN(pgnText);
    setPlayerWhite(parsed.white || "White");
    setPlayerBlack(parsed.black || "Black");
    setMoves(parsed.moves);
  }, [pgnText]);

  // Save move to localStorage + state + backend
  function saveMove(move: MoveInfo) {
    const newSaved: SavedMove = {
      id: `${move.id}-${Date.now()}`,
      san: move.san,
      color: move.color,
      eval: move.eval,
      note: "",
      created_at: new Date().toISOString()
    };
    const updated = [...savedMoves, newSaved];
    setSavedMoves(updated);
    localStorage.setItem("chess_saved_moves_v1", JSON.stringify(updated));
    // send to backend (best-effort)
    sendSaveToBackend(newSaved);
  }

  function clearSavedMoves() {
    setSavedMoves([]);
    localStorage.removeItem("chess_saved_moves_v1");
    // optionally call backend clear endpoint
    fetch("/api/saved_moves/clear", { method: "POST" }).catch(() => {});
  }

  // Overlay icon positions: compute coordinates to overlay icons on board squares.
  // This naive overlay assumes the board is an 8x8 visual grid inside .board-container.
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reposition on resize
    const r = () => {
      // force re-render by updating state if needed — but we keep simple
      // For heavy duty: compute pixel coords here and store in state.
    };
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  return (
    <div className="app-root">
      <header className="top-bar">
        <div className="players">
          <div className="player-name white-name">{playerWhite || "White"}</div>
          <div className="player-name black-name">{playerBlack || "Black"}</div>
        </div>
        <div className="saved-controls">
          <button className="btn" onClick={() => setShowSavedModal(true)}>Saved moves ({savedMoves.length})</button>
          <button className="btn danger" onClick={clearSavedMoves}>Clear saved</button>
        </div>
      </header>

      <main className="main-grid">
        <section className="board-section">
          {/* Replace this container with your actual chessboard component.
              The overlay icons are rendered absolutely inside .board-overlay.
              If you use a third-party board ensure this container has the correct size
              and that .board-overlay sits on top of it. */}
          <div className="board-container" ref={boardRef}>
            <div className="fake-board">
              {/* Simple visual 8x8 board placeholder to align overlays.
                  If you already have a board, you can remove this and keep .board-overlay */}
              {Array.from({ length: 64 }).map((_, i) => {
                const file = String.fromCharCode(97 + (i % 8)); // a-h
                const rank = 8 - Math.floor(i / 8);
                const square = `${file}${rank}`;
                return (
                  <div key={square} className={`square ${((i + Math.floor(i / 8)) % 2 === 0) ? "light" : "dark"}`} data-square={square}>
                    {/* square placeholder */}
                  </div>
                );
              })}
            </div>

            <div className="board-overlay">
              {/* For each move we overlay an icon above the square for a short time.
                  Since we don't have actual from/to coordinates, this demonstrates
                  the mechanism: overlay icons next to squares that match sample SAN's target square (very naive).
                  Ideally feed real move coordinates from your move generator/engine. */}
              {moves.map((m, idx) => {
                // Try to guess a target square from SAN (very naive: last 2 chars if they are file+rank)
                const san = m.san;
                const maybe = san.slice(-2);
                const isSquare = /^[a-h][1-8]$/.test(maybe);
                const square = isSquare ? maybe : null;
                if (!square) return null;
                return (
                  <div key={m.id} className="overlay-icon" data-square={square}>
                    <MoveIcon evalKey={m.eval} size={36} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="moves-section">
          <MoveList moves={moves} onSaveMove={saveMove} />
        </aside>
      </main>

      <SavedMovesModal
        open={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        savedMoves={savedMoves}
        onClear={clearSavedMoves}
      />

      <footer className="footer-note">
        Icons above moves follow the Chess.com-inspired classification. Saved moves are stored in localStorage and optionally posted to /api/saved_moves.
      </footer>
    </div>
  );
}

export default App;
>>>>>>> 9ff7bf6 (Local changes after merge)
