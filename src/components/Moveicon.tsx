import React from "react";

type EvalKey = "brilliant" | "great" | "best" | "good" | "inaccuracy" | "mistake" | "blunder" | "unknown";

const colorMap: Record<EvalKey, string> = {
  brilliant: "#ffd700", // gold
  great: "#4caf50", // green
  best: "#00aaff", // blue
  good: "#8bc34a", // light green
  inaccuracy: "#ff9800", // orange
  mistake: "#ff5722", // deep orange
  blunder: "#f44336", // red
  unknown: "#9e9e9e", // gray
};

export default function MoveIcon({ evalKey, size = 24 }: { evalKey: EvalKey; size?: number }) {
  const color = colorMap[evalKey] || colorMap.unknown;
  // Provide compact shape similar to Chess.com small badges (circle + symbol)
  const symbolMap: Record<EvalKey, string> = {
    brilliant: "☆",
    great: "★",
    best: "✓",
    good: "●",
    inaccuracy: "i",
    mistake: "!",
    blunder: "!!",
    unknown: "?",
  };
  const symbol = symbolMap[evalKey] || "?";

  return (
    <div className="move-icon" style={{ width: size, height: size, backgroundColor: color }}>
      <span className="move-icon-symbol">{symbol}</span>
    </div>
  );
}