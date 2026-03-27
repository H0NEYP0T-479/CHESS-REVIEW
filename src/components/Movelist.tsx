import React from "react";
import { MoveInfo } from "../types";
import MoveIcon from "./MoveIcon";

export default function MoveList({ moves, onSaveMove }: { moves: MoveInfo[]; onSaveMove: (m: MoveInfo) => void }) {
  // Render moves grouped by fullmove number
  const rows: Array<{ moveNumber: number; white?: MoveInfo; black?: MoveInfo }> = [];
  for (let i = 0, mnum = 1; i < moves.length; i += 2, mnum++) {
    rows.push({ moveNumber: mnum, white: moves[i], black: moves[i + 1] });
  }

  return (
    <div className="move-list">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>White</th>
            <th>Black</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.moveNumber}>
              <td className="move-number">{r.moveNumber}.</td>
              <td className="move-cell">
                {r.white ? (
                  <div className="move-entry">
                    <div className="icon-above">
                      <MoveIcon evalKey={r.white.eval} />
                    </div>
                    <div className="move-body">
                      <span className="move-san">{r.white.san}</span>
                      <button className="btn small" onClick={() => onSaveMove(r.white)}>Save Move</button>
                    </div>
                  </div>
                ) : null}
              </td>
              <td className="move-cell">
                {r.black ? (
                  <div className="move-entry">
                    <div className="icon-above">
                      <MoveIcon evalKey={r.black.eval} />
                    </div>
                    <div className="move-body">
                      <span className="move-san">{r.black.san}</span>
                      <button className="btn small" onClick={() => onSaveMove(r.black)}>Save Move</button>
                    </div>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}