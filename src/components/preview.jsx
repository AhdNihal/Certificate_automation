import React, { useState } from 'react';

export function Preview({ previewUrl, isLoading, fontSize, selectedRecipient, xPosition, yPosition }) {
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  const handleIframeLoad = (event) => {
    if (event.target.contentDocument === null) {
      setError("Failed to load preview. Please try again.");
    } else {
      setError(null);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Preview</h2>
      <div className="relative border h-auto border-gray-300 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-auto bg-gray-100">
            <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 bg-red-100 text-red-700">
            {error}
          </div>
        ) : (
          <>
            <iframe 
              src={previewUrl} 
              title="Certificate Preview" 
              className="w-full h-[65vh] transform origin-top-left" 
              style={{ transform: `scale(${zoom / 100})` }}
              onLoad={handleIframeLoad}
              frameBorder="0"
            />
            <div className="absolute top-2 right-2 bg-white rounded-lg shadow p-2 flex items-center space-x-2">
              <button onClick={handleZoomOut} className="text-gray-600 hover:text-gray-800">-</button>
              <span>{zoom}%</span>
              <button onClick={handleZoomIn} className="text-gray-600 hover:text-gray-800">+</button>
            </div>
          </>
        )}
      </div>
      
      {/* Conditional Rendering for Recipient Text */}
      {/* {selectedRecipient && (
        <div className="relative mt-4 border border-gray-300 rounded-lg p-4 bg-white">
          <p className="text-lg font-bold" style={{ 
            fontSize: `${fontSize}px`,
            position: 'absolute',
            left: `${xPosition}px`,
            top: `${yPosition}px`,
            whiteSpace: 'nowrap', // Prevent text wrapping
          }}>
            {selectedRecipient}
          </p>
        </div>
      )} */}
      
      {previewUrl && (
        <a 
          href={previewUrl} 
          download="preview.pdf" 
          className="mt-2 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Download Preview PDF
        </a>
      )}
    </div>
  );
}