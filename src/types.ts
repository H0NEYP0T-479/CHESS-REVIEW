// Yeh interfaces backend se aane wale data ko define karti hain
export interface AnalysisData {
    best_move: string | null;
    evaluation: number;
    mate: boolean;
}

export interface AnalysisResponse {
    best_move: string | null;
    evaluation: number;
    mate: boolean;
    error?: string;
}