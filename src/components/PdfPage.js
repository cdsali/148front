import { useEffect, useRef } from 'react';

const PdfPage = ({ page, scale, index, totalPages }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderTask = page.render({
      canvasContext: context,
      viewport,
    });

    return () => {
      renderTask.cancel();
    };
  }, [page, scale]);

  return (
    <div
      style={{
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: 'white',
          padding: '2px 5px',
          borderRadius: '3px',
          fontSize: '12px',
        }}
      >
        Page {index + 1} of {totalPages}
      </div>
    </div>
  );
};

export default PdfPage;
