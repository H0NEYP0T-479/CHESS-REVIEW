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

export interface AnalysisResponse {
  best_move: string | null;
  evaluation: number;
  mate: boolean;
  pv?: string[];
  lines?: Array<{ best_move: string | null; evaluation: number; mate: boolean; pv: string[] }>;
  error?: string;
}

export interface AnalysisData {
  best_move: string | null;
  evaluation: number;
  mate: boolean;
}