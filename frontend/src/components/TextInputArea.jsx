import React from 'react';

const TextInputArea = ({ value, onChange, placeholder, disabled = false }) => {
  return (
    <div className="text-input-container">
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="textarea"
        rows={8}
      />
    </div>
  );
};


export default TextInputArea;
