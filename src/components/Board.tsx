import React, { useEffect, useState } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import UploadForm from "./UploadForm";
import EvalBar from "./EvalBar";
import type { AnalysisResponse } from "../types";

// --- Modern Loader Popup ---
const AnalyzingPopup: React.FC<{ visible: boolean }> = ({ visible }) => (
  <div className={`loading-overlay${visible ? " loading-visible" : ""}`}>
    <div className="loading-box">
      <div className="spinner" />
      <h2>
        Analyzing full game…<br />
        <span style={{ fontWeight: 400 }}>please wait</span>
      </h2>
    </div>
  </div>
);

// --- Chess.com Move Classification Logic ---
const classifyMove = (
  prevEval: number,
  currentEval: number,
  bestMove: string | null,
  playedMove: string,
  isMate: boolean,
  turn: string
): { label: string; color: string; icon: string } => {
  if (isMate) {
    return { label: "Game Over", color: "#444444", icon: "🏁" };
  }

  // Adjust eval diff based on whose turn it is
  let evalDiff = currentEval - prevEval;
  if (turn === "b") evalDiff = -evalDiff; // Black's perspective

  // Check if played move matches engine's best move
  const isEngineBestMove = bestMove === playedMove;

  // --- Classification Logic (Chess.com style) ---

  // 1.  BRILLIANT MOVE: Engine move that sacrifices but forces advantage (rare, significant eval jump despite sacrifice)
  if (
    isEngineBestMove &&
    evalDiff > 100 &&
    Math.abs(prevEval) < 50
  ) {
    return { label: "Brilliant Move", color: "#36b3e4", icon: "💡" };
  }

  // 2. BEST MOVE: Engine move, minimal eval loss
  if (isEngineBestMove && evalDiff > -15) {
    return { label: "Best Move", color: "#81b64c", icon: "✔️" };
  }

  // 3. GREAT MOVE: Not engine move but near-best, strong position
  if (! isEngineBestMove && evalDiff > 80) {
    return { label: "Great Move", color: "#8acd3c", icon: "👏" };
  }

  // 4. EXCELLENT: Engine move with small eval loss
  if (isEngineBestMove && evalDiff > -40) {
    return { label: "Excellent", color: "#b6d96d", icon: "👍" };
  }

  // 5. GOOD: Reasonable move, minor eval loss
  if (evalDiff > -100) {
    return { label: "Good", color: "#e7e164", icon: "🙂" };
  }

  // 6. INACCURACY: Mild error, eval loss 1-2 pawns
  if (evalDiff > -200) {
    return { label: "Inaccuracy", color: "#efd46d", icon: "⚠️" };
  }

  // 7. MISTAKE: Significant error, eval loss 2-3+ pawns
  if (evalDiff > -350) {
    return { label: "Mistake", color: "#d88828", icon: "❌" };
  }

  // 8. BLUNDER: Severe error, eval loss 3+ pawns
  return { label: "Blunder", color: "#c62c2c", icon: "💥" };
};

// Initialize class stats
const initialClassStats = () => ({
  "Brilliant Move": 0,
  "Best Move": 0,
  "Great Move": 0,
  "Excellent": 0,
  "Good": 0,
  "Inaccuracy": 0,
  "Mistake": 0,
  "Blunder": 0,
});

// Chess.com color mapping for all classifications
const classColors: Record<string, string> = {
  "Brilliant Move": "#36b3e4",
  "Best Move": "#81b64c",
  "Great Move": "#8acd3c",
  "Excellent": "#b6d96d",
  "Good": "#e7e164",
  "Inaccuracy": "#efd46d",
  "Mistake": "#d88828",
  "Blunder": "#c62c2c",
  "Game Over": "#444444",
};

const Board: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [history, setHistory] = useState<Move[]>([]);
  const [fenHistory, setFenHistory] = useState<string[]>([]);
  const [position, setPosition] = useState(game.fen());
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);
  const [analysisBatch, setAnalysisBatch] = useState<AnalysisResponse[]>([]);
  const [optionSquares, setOptionSquares] = useState({});
  const [moveScores, setMoveScores] = useState<{ white: number[]; black: number[] }>({
    white: [],
    black: [],
  });
  const [moveClassifications, setMoveClassifications] = useState<
    { label: string; color: string; icon: string }[]
  >([]);
  const [quality, setQuality] = useState<any>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  // Summary stats for White & Black
  const [whiteStats, setWhiteStats] = useState(initialClassStats());
  const [blackStats, setBlackStats] = useState(initialClassStats());

  useEffect(() => setPosition(game.fen()), [game]);

  // Process batch analysis and classify all moves
  const processBatchAnalysis = (
    batch: AnalysisResponse[],
    moves: Move[],
    fens: string[]
  ) => {
    const scores: { white: number[]; black: number[] } = { white: [], black: [] };
    const classifications: { label: string; color: string; icon: string }[] = [];
    let prevEval = 0;

    // Count stats per player
    let whiteCount = initialClassStats();
    let blackCount = initialClassStats();

    for (let idx = 0; idx < batch. length; idx++) {
      const analysis = batch[idx];
      const move = moves[idx];
      const turn = idx % 2 === 0 ? "w" : "b";
      const playedMove = move.from + move.to + (move.promotion || "");

      // Classify this move
      const classification = classifyMove(
        prevEval,
        analysis.evaluation,
        analysis.best_move,
        playedMove,
        analysis.mate,
        turn
      );

      classifications.push(classification);

      // Convert classification to score for accuracy bar
      const scoreMap: Record<string, number> = {
        "Brilliant Move": 100,
        "Best Move": 100,
        "Great Move": 95,
        "Excellent": 90,
        "Good": 75,
        "Inaccuracy": 50,
        "Mistake": 25,
        "Blunder": 5,
        "Game Over": 100,
      };
      const score = scoreMap[classification.label] || 50;

      if (turn === "w") {
        scores.white[Math.floor(idx / 2)] = score;
        whiteCount[classification.label as keyof typeof whiteCount] += 1;
      } else {
        scores.black[Math. floor(idx / 2)] = score;
        blackCount[classification.label as keyof typeof blackCount] += 1;
      }

      prevEval = analysis. evaluation;
    }

    setMoveScores(scores);
    setMoveClassifications(classifications);
    setWhiteStats(whiteCount);
    setBlackStats(blackCount);
  };

  const getAverage = (scores: number[]) =>
    scores.length === 0 ? 100 : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Move navigation
  const navigateMove = (index: number) => {
    if (index < -1 || index >= fenHistory.length - 1) return;
    const targetFen = fenHistory[index + 1];
    setGame(new Chess(targetFen));
    setCurrentMoveIndex(index);

    if (index >= 0 && moveClassifications[index]) {
      setQuality(moveClassifications[index]);
      const lastMove = history[index];
      setOptionSquares(
        lastMove
          ? {
              [lastMove.from]: { backgroundColor: "rgba(255, 255, 0, 0.25)" },
              [lastMove. to]: { backgroundColor: "rgba(255, 255, 0, 0.25)" },
            }
          : {}
      );
    } else {
      setQuality(null);
      setOptionSquares({});
    }
  };

  // Load PGN and trigger batch analysis
  const handlePgnLoad = async (pgn: string) => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      const allMoves = chess.history({ verbose: true }) as Move[];
      setHistory(allMoves);

      // Collect all FENs
      const fens: string[] = [];
      const replay = new Chess();
      fens.push(replay.fen());
      chess.history(). forEach((m) => {
        replay.move(m);
        fens. push(replay.fen());
      });
      setFenHistory(fens);

      setGame(new Chess());
      setCurrentMoveIndex(-1);
      setOptionSquares({});
      setMoveScores({ white: [], black: [] });
      setQuality(null);
      setAnalysisBatch([]);
      setMoveClassifications([]);
      setWhiteStats(initialClassStats());
      setBlackStats(initialClassStats());

      setPopupVisible(true);

      // Backend batch analysis (using /analyze-batch endpoint)
      const { data } = await axios.post("http://localhost:8000/analyze-batch", {
        fens: fens. slice(1),
        depth: 12,
      });
      setAnalysisBatch(data);
      processBatchAnalysis(data, allMoves, fens);

      setPopupVisible(false);
    } catch (error) {
      setPopupVisible(false);
      console.error("PGN Load Error:", error);
      alert("Invalid PGN or analysis error");
    }
  };

  // Move display grouped [1.  e4 e5]
  const historyPairs = [];
  for (let i = 0; i < history.length; i += 2) {
    historyPairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] || null,
      whiteIndex: i,
      blackIndex: i + 1,
    });
  }

  const whiteAcc = getAverage(moveScores.white);
  const blackAcc = getAverage(moveScores.black);
  const currentAnalysis = currentMoveIndex >= 0 ?  analysisBatch[currentMoveIndex] : null;
  const currentClassification =
    currentMoveIndex >= 0 ?  moveClassifications[currentMoveIndex] : null;

  // Render summary box for White or Black
  const renderSummaryBox = (stats: typeof whiteStats, color: string, label: string) => (
    <div className="summary-box">
      <div className="summary-title" style={{ color }}>{label}</div>
      {Object.entries(stats).map(([key, count]) => (
        <div className="summary-row" key={key}>
          <span
            className="summary-class"
            style={{ color: classColors[key] || "#fff" }}
          >
            {key}
          </span>
          <span className="summary-count">{count}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="board-layout">
      <AnalyzingPopup visible={popupVisible} />

      {/* Left: Move history with classifications */}
      <section className="panel moves-panel">
        <div className="panel-header">Move History</div>
        <div className="moves-list">
          {historyPairs.map((pair) => (
            <div key={pair.num} className="move-row">
              <span className="move-num">{pair.num}. </span>
              <button
                className={`move-btn${currentMoveIndex === pair.whiteIndex ? " active" : ""}`}
                onClick={() => navigateMove(pair. whiteIndex)}
                tabIndex={0}
              >
                {pair.white?. san}
                {moveClassifications[pair.whiteIndex] && (
                  <span
                    className="move-badge"
                    style={{
                      background: moveClassifications[pair.whiteIndex].color,
                    }}
                  >
                    {moveClassifications[pair.whiteIndex].label}
                  </span>
                )}
              </button>
              {pair.black ?  (
                <button
                  className={`move-btn${currentMoveIndex === pair.blackIndex ? " active" : ""}`}
                  onClick={() => navigateMove(pair.blackIndex)}
                  tabIndex={0}
                >
                  {pair. black. san}
                  {moveClassifications[pair.blackIndex] && (
                    <span
                      className="move-badge"
                      style={{
                        background: moveClassifications[pair.blackIndex].color,
                      }}
                    >
                      {moveClassifications[pair.blackIndex].label}
                    </span>
                  )}
                </button>
              ) : (
                <span className="move-btn" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Center: Board & evalbar */}
      <div className="board-center-wrap">
        <EvalBar evaluation={currentAnalysis?.evaluation ??  0} isMate={currentAnalysis?.mate} />
        <div className="chessboard-wrap">
          <Chessboard options={{ position }} customSquares={optionSquares} />
          <div className="nav-bar">
            <button className="nav-btn" onClick={() => navigateMove(currentMoveIndex - 1)}>
              ◀
            </button>
            <button className="nav-btn" onClick={() => navigateMove(currentMoveIndex + 1)}>
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Right: Analysis & Summary Boxes */}
      <section className="panel analysis-panel">
        <UploadForm onPgnLoad={handlePgnLoad} />

        {/* Summary Boxes: White & Black Stats */}
        <div className="summary-boxes-container">
          {renderSummaryBox(whiteStats, "#81b64c", "White")}
          {renderSummaryBox(blackStats, "#c62c2c", "Black")}
        </div>

        {/* Accuracy Bars */}
        <div className="accuracy-bars">
          <div className="accuracy-block">
            <label>White Accuracy</label>
            <div className="accuracy-percent white">{whiteAcc}%</div>
            <div className="accuracy-bar-bg">
              <div className="accuracy-bar-fill white" style={{ width: `${whiteAcc}%` }} />
            </div>
          </div>
          <div className="accuracy-block">
            <label>Black Accuracy</label>
            <div className="accuracy-percent black">{blackAcc}%</div>
            <div className="accuracy-bar-bg">
              <div className="accuracy-bar-fill black" style={{ width: `${blackAcc}%` }} />
            </div>
          </div>
        </div>

        {/* Current Evaluation */}
        <div className="eval-block">
          <span>Current Evaluation</span>
          <div className="eval-score">
            {currentAnalysis
              ? currentAnalysis.mate
                ? `M${Math.abs(currentAnalysis.evaluation)}`
                : (currentAnalysis.evaluation / 100).toFixed(2)
              : "0. 00"}
          </div>
        </div>

        {/* Move Classification Badge */}
        {currentClassification && (
          <div className="quality-badge" style={{ background: currentClassification.color }}>
            <span style={{ fontSize: "1.8rem" }}>{currentClassification.icon}</span>
            <span style={{ fontSize: "1.2rem" }}>{currentClassification.label}</span>
          </div>
        )}

        {/* Best Move Suggestion */}
        {currentAnalysis?. best_move && (
          <div className="best-move-suggestion">
            <strong>Engine Best Move:</strong>
            <span style={{ fontSize: "1.3rem", marginLeft: "8px", fontWeight: "bold" }}>
              {currentAnalysis. best_move}
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

export default Board;