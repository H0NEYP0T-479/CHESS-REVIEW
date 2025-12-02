import React, { useState } from 'react';

interface UploadFormProps {
  onPgnLoad: (pgn: string) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onPgnLoad }) => {
  const [pgnInput, setPgnInput] = useState<string>("");

  const handleLoad = () => {
    onPgnLoad(pgnInput);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <textarea
        rows={4}
        placeholder="Paste PGN here..."
        value={pgnInput}
        onChange={(e) => setPgnInput(e.target.value)}
        style={{ width: "100%", padding: "10px" }}
      />
      <br />
      <button 
        onClick={handleLoad} 
        style={{ padding: "10px 20px", marginTop: "10px", cursor: "pointer" }}
      >
        Load PGN
      </button>
    </div>
  );
};

export default UploadForm;