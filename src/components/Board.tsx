import React, { useEffect, useState } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import UploadForm from "./UploadForm";
import EvalBar from "./EvalBar"; 
import type { AnalysisResponse, AnalysisData } from "../types";

// --- LOGIC ---
const getMoveQuality = (currentEval: number, prevEval: number, isMate: boolean, turn: string) => {
  if (isMate) return { label: "Game Over", color: "#81b64c", icon: "🏁", score: 100 };
  
  let diff = currentEval - prevEval;
  if (turn === 'b') diff = -diff; 

  if (diff > -20) return { label: "Best Move", color: "#81b64c", icon: "⭐", score: 100 };
  if (diff > -50) return { label: "Excellent", color: "#96bc4b", icon: "✓", score: 90 };
  if (diff > -100) return { label: "Good", color: "#999", icon: "😐", score: 75 };
  if (diff > -200) return { label: "Mistake", color: "#f7c631", icon: "?", score: 50 };
  return { label: "Blunder", color: "#fa412d", icon: "??", score: 20 };
};

const Board: React.FC = () => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [history, setHistory] = useState<Move[]>([]);
  const [fenHistory, setFenHistory] = useState<string[]>([]);
  const [position, setPosition] = useState(game.fen());
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [arrows, setArrows] = useState<string[][]>([]);
  const [optionSquares, setOptionSquares] = useState({});
  const [prevScore, setPrevScore] = useState<number>(0);
  const [quality, setQuality] = useState<any>(null);
  const [moveScores, setMoveScores] = useState<{white: number[], black: number[]}>({ white: [], black: [] });

  useEffect(() => {
    setPosition(game.fen());
  }, [game]);
  // --- ANALYSIS ---
  const analyzePosition = async (fen: string, moveIndex: number) => {
    try {
      const res = await axios.post<AnalysisResponse>("http://localhost:8000/analyze", {
        fen: fen, depth: 12
      });
      const data = res.data;
      setAnalysis(data);

      if (data.best_move) {
        setArrows([[data.best_move.substring(0, 2), data.best_move.substring(2, 4)]]);
      }

      if (moveIndex >= 0) {
        const turn = moveIndex % 2 === 0 ? 'w' : 'b'; 
        const q = getMoveQuality(data.evaluation, prevScore, data.mate, turn);
        setQuality(q);
        updateAccuracy(turn, q.score, moveIndex);
      } else {
        setQuality(null);
      }
      setPrevScore(data.evaluation);
    } catch (error) { console.error(error); }
  };

  const updateAccuracy = (turn: string, score: number, index: number) => {
    setMoveScores(prev => {
        const newScores = { ...prev };
        const arrIndex = Math.floor(index / 2);
        if (turn === 'w') newScores.white[arrIndex] = score; 
        else newScores.black[arrIndex] = score;
        return newScores;
    });
  };

  const getAverage = (scores: number[]) => {
    if (scores.length === 0) return 100;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round(sum / scores.length);
  };

  // --- NAVIGATION ---
  const navigateMove = (index: number) => {
    if (index < -1 || index >= fenHistory.length - 1) return;
    const targetFen = fenHistory[index + 1];
    setGame(new Chess(targetFen));
    setCurrentMoveIndex(index);

    if (index >= 0 && history[index]) {
      const lastMove = history[index];
      setOptionSquares({
        [lastMove.from]: { backgroundColor: "rgba(255, 255, 0, 0.5)" },
        [lastMove.to]: { backgroundColor: "rgba(255, 255, 0, 0.5)" },
      });
    } else {
      setOptionSquares({});
    }
    console.log("Analyzing FEN:", targetFen);
    analyzePosition(targetFen, index);
  };

  // --- LOAD PGN ---
  const handlePgnLoad = (pgn: string) => {
    try {
      const g = new Chess();
      g.loadPgn(pgn);
      setHistory(g.history({ verbose: true }) as Move[]);
      
      const fens: string[] = [];
      const r = new Chess();
      fens.push(r.fen());
      g.history().forEach(m => { r.move(m); fens.push(r.fen()); });
      setFenHistory(fens);

      setGame(new Chess());
      setCurrentMoveIndex(-1);
      setAnalysis(null);
      setQuality(null);
      setPrevScore(0);
      setOptionSquares({});
      setArrows([]);
      setMoveScores({ white: [], black: [] });
      alert("Game Loaded!");
    } catch (e) { alert("Invalid PGN"); }
  };

  const historyPairs = [];
  for (let i = 0; i < history.length; i += 2) {
    historyPairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] || null,
      whiteIndex: i,
      blackIndex: i + 1
    });
  }

  const whiteAcc = getAverage(moveScores.white);
  const blackAcc = getAverage(moveScores.black);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", // Vertically Center
      gap: "25px", 
      padding: "20px", 
      height: "100vh", 
      backgroundColor: "#302e2b", 
      color: "#fff",
      overflow: "hidden" // No Scroll on body
    }}>
      
      {/* 1. LEFT PANEL: HISTORY (BIGGER) */}
      <div style={{ 
        width: "350px", // Wider
        height: "700px", // Taller
        backgroundColor: "#262522", 
        display: "flex", flexDirection: "column", 
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
      }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #3a3835", backgroundColor: "#21201d", borderRadius: "8px 8px 0 0" }}>
           <h2 style={{ margin: 0, fontSize: "20px" }}>Move History</h2>
        </div>
        <div style={{ flexGrow: 1, overflowY: "auto", fontSize: "16px" }}>
          {historyPairs.map((pair) => (
            <div key={pair.num} className="history-row" style={{ padding: "5px 0" }}>
              <div className="history-num" style={{ fontSize: "16px", paddingTop: "12px", width: "50px" }}>{pair.num}.</div>
              <div 
                className={`move-btn ${currentMoveIndex === pair.whiteIndex ? "active-move" : ""}`}
                onClick={() => navigateMove(pair.whiteIndex)}
                style={{ padding: "12px 15px" }}
              >
                {pair.white.san}
              </div>
              {pair.black ? (
                <div 
                  className={`move-btn ${currentMoveIndex === pair.blackIndex ? "active-move" : ""}`}
                  onClick={() => navigateMove(pair.blackIndex)}
                  style={{ padding: "12px 15px" }}
                >
                  {pair.black.san}
                </div>
              ) : ( <div className="move-btn"></div> )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. CENTER: EVAL BAR + BOARD (BIGGER) */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", height: "600px" }}>
        {/* Eval Bar matches Board Height */}
        <div style={{ height: "600px" }}>
           <EvalBar evaluation={analysis ? analysis.evaluation : 0} isMate={analysis ? analysis.mate : false} />
        </div>
        
        <div style={{ width: "600px", height: "600px" }}>
          <div style={{ 
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)", 
              border: "5px solid #3a3835", 
              borderRadius: "4px" 
          }}>
            <Chessboard
            options={{
              position: position
              
            }}
            />
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "20px" }}>
             <button className="btn-nav" onClick={() => navigateMove(currentMoveIndex - 1)} style={{ padding: "15px 40px", fontSize: "24px" }}>◀</button>
             <button className="btn-nav" onClick={() => navigateMove(currentMoveIndex + 1)} style={{ padding: "15px 40px", fontSize: "24px" }}>▶</button>
          </div>
        </div>
      </div>

      {/* 3. RIGHT PANEL: ANALYSIS (BIGGER) */}
      <div style={{ 
        width: "400px", // Wider
        height: "700px", // Taller
        backgroundColor: "#262522", 
        padding: "25px", 
        display: "flex", flexDirection: "column", gap: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
      }}>
        
        <UploadForm onPgnLoad={handlePgnLoad} />

        {/* ACCURACY BARS (BIGGER) */}
        <div className="accuracy-container" style={{ marginTop: "10px" }}>
          <div className="acc-box" style={{ padding: "15px" }}>
             <div className="acc-title" style={{ fontSize: "14px" }}>White Accuracy</div>
             <div className="acc-percent" style={{ fontSize: "32px", color: "#fff" }}>{whiteAcc}%</div>
             <div className="progress-bg" style={{ height: "10px" }}>
                <div className="progress-fill" style={{ width: `${whiteAcc}%`, backgroundColor: "#fff" }}></div>
             </div>
          </div>
          <div className="acc-box" style={{ padding: "15px" }}>
             <div className="acc-title" style={{ fontSize: "14px" }}>Black Accuracy</div>
             <div className="acc-percent" style={{ fontSize: "32px", color: "#888" }}>{blackAcc}%</div>
             <div className="progress-bg" style={{ height: "10px" }}>
                <div className="progress-fill" style={{ width: `${blackAcc}%`, backgroundColor: "#555" }}></div>
             </div>
          </div>
        </div>

        {/* EVAL BOX (BIGGER) */}
        <div style={{ textAlign: "center", padding: "25px", backgroundColor: "#302e2b", borderRadius: "12px" }}>
           <div style={{ fontSize: "16px", color: "#aaa", textTransform: "uppercase", letterSpacing: "1px" }}>Current Evaluation</div>
           <div style={{ fontSize: "4rem", fontWeight: "900", lineHeight: "1.2", marginTop: "10px" }}>
             {analysis 
                ? (analysis.mate ? `M${Math.abs(analysis.evaluation)}` : (analysis.evaluation / 100).toFixed(2)) 
                : "0.00"}
           </div>
        </div>

        {/* CLASSIFICATION BADGE */}
        {quality && (
          <div className="class-badge" style={{ backgroundColor: quality.color, color: "#fff", padding: "20px" }}>
            <span style={{ fontSize: "2.5rem" }}>{quality.icon}</span>
            <span style={{ fontSize: "1.8rem" }}>{quality.label}</span>
          </div>
        )}

        {analysis && analysis.best_move && (
           <div style={{ padding: "20px", backgroundColor: "#2a2a2a", borderRadius: "10px", borderLeft: "6px solid #81b64c" }}>
             <strong style={{ color: "#81b64c", fontSize: "16px" }}>Best Move Suggestion:</strong>
             <div style={{ fontSize: "1.8rem", marginTop: "8px", fontWeight: "bold" }}>{analysis.best_move}</div>
           </div>
        )}

      </div>
    </div>
  );
};

export default Board;