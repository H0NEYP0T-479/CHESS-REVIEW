export type MoveEval = "brilliant" | "great" | "best" | "good" | "inaccuracy" | "mistake" | "blunder" | "unknown";

export interface MoveInfo {
  id: string;
  san: string;
  color: "w" | "b";
  eval: MoveEval;
}

export interface SavedMove {
  id: string;
  san: string;
  color: "w" | "b";
  eval: MoveEval;
  note?: string;
  created_at: string;
}