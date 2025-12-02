import React from "react";

interface EvalBarProps {
  evaluation: number;
  isMate: boolean;
}

const EvalBar: React.FC<EvalBarProps> = ({ evaluation, isMate }) => {
  let whiteHeight = 50;

  if (isMate) {
    whiteHeight = evaluation > 0 ? 100 : 0;
  } else {
    const score = Math.max(-1000, Math.min(1000, evaluation));
    whiteHeight = 50 + (score / 10);
    whiteHeight = Math.max(5, Math.min(95, whiteHeight));
  }

  return (
    <div style={{
      width: "30px", // Thora chora kiya
      height: "100%", // Parent ki height le lega (600px)
      backgroundColor: "#404040",
      border: "1px solid #000",
      borderRadius: "4px",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column-reverse",
      boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
    }}>
      <div style={{
        width: "100%",
        height: `${whiteHeight}%`,
        backgroundColor: "#fff",
        transition: "height 0.5s ease-in-out"
      }}></div>

      <div style={{
        position: "absolute",
        top: whiteHeight > 50 ? "auto" : "5px",
        bottom: whiteHeight > 50 ? "5px" : "auto",
        width: "100%",
        textAlign: "center",
        color: whiteHeight > 50 ? "#333" : "#fff",
        fontSize: "11px",
        fontWeight: "900",
        zIndex: 10
      }}>
        {isMate ? "M" + Math.abs(evaluation) : (Math.abs(evaluation) / 100).toFixed(1)}
      </div>
    </div>
  );
};

export default EvalBar;