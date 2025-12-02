import React from 'react';
import type { AnalysisData } from '../types';

interface AnalysisPanelProps {
  data: AnalysisData | null;
  loading: boolean;
  prevEval: number; // Pichla score zaroori hai comparison ke liye
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ data, loading, prevEval }) => {
  if (loading) return <div style={{padding: "20px", color: "blue"}}>Thinking... 🧠</div>;
  if (!data) return <div>Ready to analyze</div>;

  // --- LOGIC TO DETECT BLUNDER/GREAT MOVE ---
  let moveQuality = "Normal";
  let color = "black";

  // Score difference nikalain
  const diff = data.evaluation - prevEval;

  // Agar Engine 'Mate' detect kar raha hai
  if (data.mate) {
    moveQuality = "Checkmate Sequence!";
    color = "purple";
  } 
  else {
    // Agar score +50 se zyada barha -> Great Move
    if (Math.abs(diff) > 50 && Math.abs(diff) < 150) {
        moveQuality = "Good Move 👍";
        color = "green";
    }
    // Agar score +150 se zyada barha -> Excellent
    else if (Math.abs(diff) >= 150) {
        moveQuality = "Excellent / Brillliant! 🔥";
        color = "#008f00"; // Dark Green
    }
    // Agar score -100 se zyada gira -> Blunder
    // Note: Stockfish ka score hamesha 'White' ke perspective se hota hai hamare code mein
    // Is logic ko simple rakhne ke liye hum absolute difference dekh rahe hain
    else if (Math.abs(diff) > 100) {
        moveQuality = "Blunder / Mistake ❌";
        color = "red";
    }
  }

  const evalText = data.mate 
    ? `Mate in ${Math.abs(data.evaluation)}` 
    : `${(data.evaluation / 100).toFixed(2)}`;

  return (
    <div className="panel-box">
      <h3>Engine Analysis</h3>
      
      {/* Evaluation Number */}
      <div style={{ fontSize: "1.5em", fontWeight: "bold", marginBottom: "10px" }}>
        Eval: {evalText}
      </div>

      {/* Move Quality Label */}
      <div style={{ 
          padding: "10px", 
          backgroundColor: "#f4f4f4", 
          borderLeft: `5px solid ${color}`,
          marginBottom: "10px"
      }}>
        <strong style={{ color: color, fontSize: "1.2em" }}>{moveQuality}</strong>
      </div>

      <p><strong>Best Line:</strong> {data.best_move} (Arrow dekhein)</p>
      
      <div style={{fontSize: "0.8em", color: "#666"}}>
        (Score Change: {(diff / 100).toFixed(2)})
      </div>
    </div>
  );
};

export default AnalysisPanel;