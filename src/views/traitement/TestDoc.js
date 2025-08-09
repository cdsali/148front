import React, { useState, useEffect } from 'react';

const TestDoc = () => {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const response = await fetch('http://192.168.0.148:3602/test-doc');
        if (!response.ok) throw new Error('Failed to fetch PDF');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPDF();
  }, []);

  return (
    <div>
      {pdfUrl}
      {!pdfUrl && <p>Loading PDF...</p>}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          title="PDF Document"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      )}
    </div>
  );
};

export default TestDoc;
