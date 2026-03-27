import type { SavedMove } from "../types";

export default function SavedMovesModal({
  open,
  onClose,
  savedMoves,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  savedMoves: SavedMove[];
  onClear: () => void;
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-content">
        <header className="modal-header">
          <h3>Saved Moves ({savedMoves.length})</h3>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="modal-body">
          {savedMoves.length === 0 ? (
            <div className="empty">No saved moves yet.</div>
          ) : (
            <ul className="saved-list">
              {savedMoves.map((s) => (
                <li key={s.id} className="saved-item">
                  <div className="saved-meta">
                    <strong className="saved-san">{s.san}</strong>
                    <span className="saved-eval" style={{ marginLeft: 8, color: "#6b7280" }}>
                      {s.eval}
                    </span>
                    <span className="saved-time" style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}>
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="saved-note" style={{ marginTop: 6 }}>
                    {s.note ? s.note : <em style={{ color: "#9ca3af" }}>No note</em>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="modal-footer" style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <button className="btn danger" onClick={onClear}>
            Clear all
          </button>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}