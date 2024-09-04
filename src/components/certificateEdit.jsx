import React from 'react';

export function CertificateEditor({ 
  fontSize, 
  setFontSize, 
  xPosition, 
  setXPosition, 
  yPosition, 
  setYPosition, 
  recipients, 
  selectedRecipient, 
  setSelectedRecipient, 
  onParameterChange 
}) {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Edit Certificate</h2>
      
      {/* Font Size Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Font Size</label>
        <input
          type="range"
          min="12"
          max="72"
          value={fontSize}
          onChange={(e) => {
            const newFontSize = Number(e.target.value);
            setFontSize(newFontSize);
            onParameterChange(newFontSize, xPosition, yPosition); // Trigger live preview
          }}
          className="w-full"
        />
        <input
          type="number"
          value={fontSize}
          onChange={(e) => {
            const newFontSize = Number(e.target.value);
            setFontSize(newFontSize);
            onParameterChange(newFontSize, xPosition, yPosition); // Trigger live preview
          }}
          className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {/* X Position Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">X Position</label>
        <input
          type="range"
          min="0"
          max="500"
          value={xPosition}
          onChange={(e) => {
            const newXPosition = Number(e.target.value);
            setXPosition(newXPosition);
            onParameterChange(fontSize, newXPosition, yPosition); // Trigger live preview
          }}
          className="w-full"
        />
        <input
          type="number"
          value={xPosition}
          onChange={(e) => {
            const newXPosition = Number(e.target.value);
            setXPosition(newXPosition);
            onParameterChange(fontSize, newXPosition, yPosition); // Trigger live preview
          }}
          className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {/* Y Position Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Y Position</label>
        <input
          type="range"
          min="0"
          max="500"
          value={yPosition}
          onChange={(e) => {
            const newYPosition = Number(e.target.value);
            setYPosition(newYPosition);
            onParameterChange(fontSize, xPosition, newYPosition); // Trigger live preview
          }}
          className="w-full"
        />
        <input
          type="number"
          value={yPosition}
          onChange={(e) => {
            const newYPosition = Number(e.target.value);
            setYPosition(newYPosition);
            onParameterChange(fontSize, xPosition, newYPosition); // Trigger live preview
          }}
          className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {/* Recipient Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Select Recipient</label>
        <select 
          value={selectedRecipient} 
          onChange={(e) => setSelectedRecipient(e.target.value)}
          className="block w-full mt-1 rounded-md border-gray-300 shadow-sm"
        >
          <option value="">-- Select a Recipient --</option>
          {recipients && recipients.length > 0 ? (
            recipients.map((recipient, index) => (
              <option key={index} value={recipient.name}>{recipient.name}</option>
            ))
          ) : (
            <option disabled>No recipients available</option> // Display when no recipients
          )}
        </select>
      </div>
    </div>
  );
}