"use client";

import { useEffect, useRef, useState } from 'react';

const ProctoringWidget = ({ setMatchStatus }) => {
  const videoRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [similarity, setSimilarity] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });

    // Automatic frame capture every minute
    const interval = setInterval(() => {
      captureFrame();
    }, 60000); // 60 seconds 

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const captureFrame = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, '');

    // Send the captured image to the backend API for analysis
    setIsLoading(true); // Set loading state
    const response = await fetch('/api/proctoring', {
      method: 'POST',
      body: JSON.stringify({ imageData }),
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    setIsLoading(false); // Reset loading state

    // Handle the result and update match status
    if (result.matched) {
      setSimilarity(result.similarity.toFixed(2));
      setMatchStatus(`Match found! Similarity: ${result.similarity.toFixed(2)}%`);
    } else {
      setSimilarity(0);
      setMatchStatus('No match found.');
    }
  };

  return (
    <div className="relative" style={{ zIndex: 1000 }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            width: '200px',
            height: '150px',
            border: '2px solid #4A90E2',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
          }}
        />
       <button
        onClick={captureFrame}
        style={{
            marginTop: '10px',
            padding: '8px 12px',
            backgroundColor: similarity !== null
            ? (similarity < 80 ? 'red' : 'green') // Change background color based on similarity
            : '#4A90E2', // Default color
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
            transition: 'background-color 0.3s',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = similarity !== null ? (similarity < 80 ? 'darkred' : 'darkgreen') : '#357ABD')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = similarity !== null ? (similarity < 80 ? 'red' : 'green') : '#4A90E2')}
        >
        {isLoading ? `Processing...` : similarity !== null ? `Match: ${similarity}%` : 'Capture Frame'}
        </button>

      </div>
    </div>
  );
};

export default ProctoringWidget;
