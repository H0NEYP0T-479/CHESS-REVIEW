import React, { useState } from "react";

interface UploadFormProps {
  onPgnLoad: (pgn: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onPgnLoad }) => {
  const [pgnInput, setPgnInput] = useState("");

  const handleLoad = () => {
    if (pgnInput.trim().length > 0) onPgnLoad(pgnInput);
  };

  return (
    <div className="upload-form">
      <textarea
        rows={4}
        placeholder="Paste PGN here…"
        value={pgnInput}
        onChange={e => setPgnInput(e.target.value)}
      /><br />
      <button className="pgn-btn" onClick={handleLoad}>Load PGN</button>
    </div>
  );
};

export default UploadForm;