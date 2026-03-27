import type { MoveInfo } from "../types";
import MoveIcon from "./Moveicon";

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
          {rows.map((r) => {
            const whiteMove = r.white;
            const blackMove = r.black;
            return (
              <tr key={r.moveNumber}>
                <td className="move-number">{r.moveNumber}.</td>
                <td className="move-cell">
                  {whiteMove ? (
                    <div className="move-entry">
                      <div className="icon-above">
                        <MoveIcon evalKey={whiteMove.eval} />
                      </div>
                      <div className="move-body">
                        <span className="move-san">{whiteMove.san}</span>
                        <button className="btn small" onClick={() => onSaveMove(whiteMove)}>Save Move</button>
                      </div>
                    </div>
                  ) : null}
                </td>
                <td className="move-cell">
                  {blackMove ? (
                    <div className="move-entry">
                      <div className="icon-above">
                        <MoveIcon evalKey={blackMove.eval} />
                      </div>
                      <div className="move-body">
                        <span className="move-san">{blackMove.san}</span>
                        <button className="btn small" onClick={() => onSaveMove(blackMove)}>Save Move</button>
                      </div>
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
