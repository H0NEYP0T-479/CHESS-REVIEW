"""
Minimal Flask backend to persist saved moves (optional).

Place this file in backend/ and run:

  pip install flask
  FLASK_APP=backend/saved_moves.py flask run

It exposes:
  POST /api/saved_moves     -> accept JSON body of saved move and append to backend/saved_moves.json
  POST /api/saved_moves/clear -> clear the saved moves list

This endpoint is optional: the frontend will still use localStorage if backend is not available.
"""
from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

DATA_FILE = os.path.join(os.path.dirname(__file__), "saved_moves.json")


def read_all():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except Exception:
            return []


def write_all(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


@app.route("/api/saved_moves", methods=["POST"])
def add_saved_move():
    item = request.get_json()
    if not item:
        return jsonify({"error": "invalid payload"}), 400
    current = read_all()
    current.append(item)
    write_all(current)
    return jsonify({"status": "ok", "total": len(current)}), 201


@app.route("/api/saved_moves/clear", methods=["POST"])
def clear_saved():
    write_all([])
    return jsonify({"status": "cleared"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5001)