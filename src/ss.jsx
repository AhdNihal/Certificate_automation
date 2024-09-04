import React, { useState, useEffect } from 'react';
import { FileUploader } from './components/fileUpload';
import { CertificateEditor } from './components/certificateEditor';
import { Preview } from './components/preview';
import { RecipientList } from './components/recipientList';
import Papa from 'papaparse';

export default function App() {
  const [templateFile, setTemplateFile] = useState(null);
  const [fontFile, setFontFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [fontSize, setFontSize] = useState(36);
  const [xPosition, setXPosition] = useState(0);
  const [yPosition, setYPosition] = useState(270);
  const [recipients, setRecipients] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTemplateUpload = (file) => {
    setTemplateFile(file);
    generatePreview(file);
  };

  const handleFontUpload = (file) => {
    setFontFile(file);
  };

  const handleCsvUpload = (file) => {
    setCsvFile(file);
    parseCsvFile(file);
  };

  const parseCsvFile = (file) => {
    Papa.parse(file, {
      complete: (results) => {
        const parsedRecipients = results.data.slice(1).map(row => ({
          name: row[0],
          email: row[1]
        }));
        setRecipients(parsedRecipients);
      },
      header: true,
      skipEmptyLines: true
    });
  };

  const generatePreview = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('template', file);
      formData.append('fontSize', fontSize);
      formData.append('xPosition', xPosition);
      formData.append('yPosition', yPosition);

      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      setError('Failed to generate preview. Please try again.');
      console.error('Error generating preview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (templateFile) {
      generatePreview(templateFile);
    }
  }, [fontSize, xPosition, yPosition]);

  const handleSendEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('template', templateFile);
      formData.append('font', fontFile);
      formData.append('csv', csvFile);
      formData.append('settings', JSON.stringify({ fontSize, xPosition, yPosition }));

      const response = await fetch('/api/generate-and-send', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate and send certificates');
      }

      const result = await response.json();
      console.log('Certificates generated and sent:', result);
      alert('Certificates have been generated and sent successfully!');
    } catch (err) {
      setError('Failed to generate and send certificates. Please try again.');
      console.error('Error generating and sending certificates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Certificate Generator</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FileUploader onFileUpload={handleTemplateUpload} accept=".pdf" label="Upload Certificate Template" />
          <FileUploader onFileUpload={handleFontUpload} accept=".ttf,.otf" label="Upload Font" />
          <FileUploader onFileUpload={handleCsvUpload} accept=".csv" label="Upload CSV" />
          
          <CertificateEditor 
            fontSize={fontSize}
            setFontSize={setFontSize}
            xPosition={xPosition}
            setXPosition={setXPosition}
            yPosition={yPosition}
            setYPosition={setYPosition}
          />
        </div>
        
        <div>
          <Preview previewUrl={previewUrl} isLoading={isLoading} />
          <RecipientList recipients={recipients} />
          
          <button 
            className={`mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSendEmails}
            disabled={isLoading || !templateFile || !fontFile || !csvFile}
          >
            {isLoading ? 'Processing...' : 'Send Emails'}
          </button>
        </div>
      </div>
    </div>
  );
}