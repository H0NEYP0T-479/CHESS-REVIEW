import React from "react";

interface EvalBarProps {
  evaluation: number;
  isMate?: boolean;
}

const EvalBar: React.FC<EvalBarProps> = ({ evaluation, isMate }) => {
  const evalScore = typeof evaluation === "number" ? evaluation : 0;
  const percent = 50 + Math.max(-50, Math.min(50, evalScore / 20));
  return (
    <div className="eval-bar-outer">
      <div className="eval-bar-bg">
        <div className="eval-bar-fill" style={{ height: `${percent}%` }} />
        <div className="eval-bar-labels">
          <span className="eval-label eval-label-black">Black</span>
          <span className="eval-label eval-label-white">White</span>
        </div>
      </div>
      <div className="eval-bar-score">
        {isMate ? `M${Math.abs(evalScore)}` : (evalScore / 100).toFixed(2)}
      </div>
    </div>
  );
};

export default EvalBar;