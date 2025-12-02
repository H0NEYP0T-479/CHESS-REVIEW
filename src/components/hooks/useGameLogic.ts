import { useState } from "react";
import { Chess, Move } from "chess.js";

export default function useGameLogic() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [history, setHistory] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

  // 1. PGN Load Karna
  const loadPgn = (pgn: string) => {
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgn);
      setHistory(newGame.history({ verbose: true }) as Move[]);
      
      // Reset Board
      setGame(new Chess());
      setCurrentMoveIndex(-1);
      return true; // Success
    } catch (e) {
      return false; // Error
    }
  };

  // 2. Navigation (Next/Prev) - ANIMATION FIX INCLUDED
  const navigate = (targetIndex: number) => {
    if (targetIndex < -1 || targetIndex >= history.length) return;

    // Har baar naya instance banayenge taake React re-render kare (Animation Fix)
    const newGameInstance = new Chess(game.fen());

    // Logic: Kahan jana hai?
    if (targetIndex === currentMoveIndex + 1) {
        // Aage jao (Next) -> Slide Animation
        const move = history[targetIndex];
        newGameInstance.move(move.san);
    } else if (targetIndex === currentMoveIndex - 1) {
        // Peeche jao (Prev) -> Slide Animation
        newGameInstance.undo();
    } else {
        // Jump (List click) -> Reset & Fast Forward
        newGameInstance.reset();
        for (let i = 0; i <= targetIndex; i++) {
            newGameInstance.move(history[i].san);
        }
    }

    setGame(newGameInstance);
    setCurrentMoveIndex(targetIndex);
  };

  return { 
    game, 
    history, 
    currentMoveIndex, 
    loadPgn, 
    navigate 
  };
}