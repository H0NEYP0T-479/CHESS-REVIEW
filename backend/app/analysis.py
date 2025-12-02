import chess
import chess.engine
import os

# --- PATH FIX START ---
# Hum Current Working Directory check karenge
CURRENT_DIR = os.getcwd() # Ye 'backend' folder hona chahiye
ENGINE_FOLDER = os.path.join(CURRENT_DIR, "engine")

# File ka naam define karein
ENGINE_FILE = "stockfish_16.exe.exe" 
STOCKFISH_PATH = os.path.join(ENGINE_FOLDER, ENGINE_FILE)

# Debugging ke liye print karein (Terminal check karein)
print(f"🔍 Looking for engine at: {STOCKFISH_PATH}")

if os.path.exists(STOCKFISH_PATH):
    print("✅ Engine FOUND!")
else:
    print("❌ Engine NOT FOUND!")
    print(f"📂 Files in '{ENGINE_FOLDER}':")
    try:
        print(os.listdir(ENGINE_FOLDER)) # Folder ke andar kya hai wo dikhaye
    except Exception as e:
        print(f"Folder hi nahi mila: {e}")
# --- PATH FIX END ---

def analyze_fen_position(fen: str, depth: int):
    # ... baki code same rahega ...
    board = chess.Board(fen)
    
    if not os.path.exists(STOCKFISH_PATH):
        return {"evaluation": 0, "mate": False, "best_move": None, "error": f"Path Error: {STOCKFISH_PATH}"}

    try:
        # Baki function same...
        with chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH) as engine:
            result = engine.analyse(board, chess.engine.Limit(depth=depth))
            
            score = result["score"].white()
            
            if score.is_mate():
                eval_val = score.mate()
                is_mate = True
            else:
                eval_val = score.score()
                is_mate = False

            return {
                "best_move": result["pv"][0].uci() if "pv" in result else None,
                "evaluation": eval_val,
                "mate": is_mate
            }
    except Exception as e:
        print(f"Engine Error: {e}")
        return {"evaluation": 0, "mate": False, "best_move": None, "error": str(e)}