import chess
import chess.engine
import os
import functools
from typing import Optional

# --- Stockfish path resolution ---
# Check multiple possible locations for the Stockfish binary
_CANDIDATE_PATHS = [
    os.path.join(os.path.dirname(__file__), "..", "stockfish_16"),
    os.path.join(os.path.dirname(__file__), "..", "engine", "stockfish"),
    os.path.join(os.path.dirname(__file__), "..", "engine", "stockfish_16"),
    "/usr/bin/stockfish",
    "/usr/local/bin/stockfish",
    "stockfish",
]

def _find_stockfish() -> Optional[str]:
    """Find the first available Stockfish binary."""
    for path in _CANDIDATE_PATHS:
        resolved = os.path.realpath(path)
        if (
            os.path.isfile(resolved)
            and os.path.getsize(resolved) > 0
            and os.access(resolved, os.X_OK)
        ):
            return resolved
    return None

STOCKFISH_PATH = _find_stockfish()

# --- Engine resource limits (tune these for your deployment environment) ---
# Lower thread count ensures deterministic analysis in concurrent API deployments.
# 64 MB hash table is sufficient for typical per-request analysis depths up to 20.
ENGINE_THREADS = 1
ENGINE_HASH_MB = 64

# Maximum allowed depth (30 is sufficient; deeper adds latency with diminishing returns).
MAX_DEPTH = 30
# Maximum number of PV lines returned per position.
MAX_MULTIPV = 5
# --- Move classification constants ---
# Centipawn thresholds for move quality classification.
# Positive values mean the evaluation improved (or held) relative to the previous move.
# "best" threshold is applied as a tolerance: within 10cp of engine's top recommendation.
CLASSIFICATION_THRESHOLDS = {
    "brilliant": 150,   # eval improves 1.5+ pawns beyond best engine move
    "great": 50,        # eval improves or stays very close to best (> 0.5 pawns gain)
    "best": 10,         # within 0.1 pawns of the engine's top recommendation
    "good": 0,          # no evaluation loss
    "inaccuracy": -100, # up to 1 pawn loss
    "mistake": -300,    # up to 3 pawn loss
    # blunder: worse than -300 cp
}


def classify_move(
    prev_eval: int,
    current_eval: int,
    best_move: Optional[str],
    played_move: str,
    is_mate: bool,
    turn: str,
) -> str:
    """Classify a move based on evaluation delta (Chess.com style)."""
    if is_mate:
        return "game_over"

    eval_diff = current_eval - prev_eval
    if turn == "b":
        eval_diff = -eval_diff

    is_best = best_move is not None and best_move == played_move

    if is_best and eval_diff >= CLASSIFICATION_THRESHOLDS["brilliant"]:
        return "brilliant"
    # "best" uses a negative tolerance: the move is within 10cp of the engine recommendation
    if is_best and eval_diff >= -CLASSIFICATION_THRESHOLDS["best"]:
        return "best"
    if eval_diff >= CLASSIFICATION_THRESHOLDS["great"]:
        return "great"
    if eval_diff >= CLASSIFICATION_THRESHOLDS["good"]:
        return "good"
    if eval_diff >= CLASSIFICATION_THRESHOLDS["inaccuracy"]:
        return "inaccuracy"
    if eval_diff >= CLASSIFICATION_THRESHOLDS["mistake"]:
        return "mistake"
    return "blunder"


@functools.lru_cache(maxsize=2048)
def _cached_analysis(fen: str, depth: int, multipv: int):
    """
    Core analysis function with LRU cache for position results.
    Returns a tuple that can be safely cached.
    """
    if not STOCKFISH_PATH:
        return None, "Stockfish engine not found. Install stockfish and ensure it is accessible."

    board = chess.Board(fen)
    if not board.is_valid():
        return None, f"Invalid FEN position: {fen}"

    try:
        with chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH) as engine:
            # Use module-level constants for resource limits
            engine.configure({"Threads": ENGINE_THREADS, "Hash": ENGINE_HASH_MB})

            result = engine.analyse(
                board,
                chess.engine.Limit(depth=depth),
                multipv=multipv,
            )

            lines = []
            if isinstance(result, list):
                analysis_items = result
            else:
                analysis_items = [result]

            for item in analysis_items:
                score = item["score"].white()
                if score.is_mate():
                    eval_val = score.mate()
                    is_mate = True
                else:
                    cp = score.score()
                    eval_val = cp if cp is not None else 0
                    is_mate = False

                pv = item.get("pv", [])
                best_move = pv[0].uci() if pv else None
                pv_moves = [m.uci() for m in pv[:10]]

                lines.append({
                    "best_move": best_move,
                    "evaluation": eval_val,
                    "mate": is_mate,
                    "pv": pv_moves,
                })

            return lines, None

    except chess.engine.EngineTerminatedError:
        return None, "Engine process terminated unexpectedly"
    except Exception as e:
        return None, str(e)


def analyze_fen_position(fen: str, depth: int = 12, multipv: int = 1) -> dict:
    """
    Analyze a FEN position to the given depth.

    Args:
        fen:     FEN string of the position to analyze.
        depth:   Search depth (default 12).
        multipv: Number of principal variation lines to return (default 1).

    Returns:
        dict with keys: best_move, evaluation, mate, pv, lines, error (optional).
    """
    depth = max(1, min(depth, MAX_DEPTH))
    multipv = max(1, min(multipv, MAX_MULTIPV))

    lines, error = _cached_analysis(fen, depth, multipv)

    if error:
        return {
            "best_move": None,
            "evaluation": 0,
            "mate": False,
            "pv": [],
            "lines": [],
            "error": error,
        }

    primary = lines[0] if lines else {}
    return {
        "best_move": primary.get("best_move"),
        "evaluation": primary.get("evaluation", 0),
        "mate": primary.get("mate", False),
        "pv": primary.get("pv", []),
        "lines": lines,
    }
