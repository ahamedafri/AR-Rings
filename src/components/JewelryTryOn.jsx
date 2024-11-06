import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const JewelryTryOn = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedRing, setSelectedRing] = useState('gold');

  const rings = {
    gold: {
      color: '#FFD700',
      size: 30,
      name: 'Gold Ring'
    },
    silver: {
      color: '#C0C0C0',
      size: 25,
      name: 'Silver Ring'
    },
    rose: {
      color: '#B76E79',
      size: 35,
      name: 'Rose Gold Ring'
    }
  };

  const startCamera = async () => {
    setIsStarted(true);
    if (webcamRef.current) {
      requestAnimationFrame(drawFrame);
    }
  };

  const drawFrame = () => {
    if (!webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Draw virtual ring (for demo, we'll place it in center)
    drawRing(ctx, rings[selectedRing]);

    if (isStarted) {
      requestAnimationFrame(drawFrame);
    }
  };

  const drawRing = (ctx, ring) => {
    // For demo, draw ring in center of screen
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    // Draw ring band
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, ring.size, ring.size / 3, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw gemstone
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.moveTo(centerX, centerY - ring.size/2);
    ctx.lineTo(centerX + ring.size/4, centerY - ring.size/3);
    ctx.lineTo(centerX, centerY - ring.size/6);
    ctx.lineTo(centerX - ring.size/4, centerY - ring.size/3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Virtual Ring Try-On</h1>
      
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setIsStarted(!isStarted)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isStarted ? 'Stop' : 'Start Camera'}
        </button>

        <select
          value={selectedRing}
          onChange={(e) => setSelectedRing(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          {Object.entries(rings).map(([key, ring]) => (
            <option key={key} value={key}>
              {ring.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          mirrored={true}
          onLoadedMetadata={startCamera}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        {!isStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
            <p className="text-gray-500">Click Start to begin</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm space-y-2">
        <p className="font-medium">Instructions:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click "Start Camera" to begin</li>
          <li>Allow camera access when prompted</li>
          <li>Select different ring styles from the dropdown</li>
          <li>Position your hand to see the virtual ring</li>
        </ul>
      </div>
    </div>
  );
};

export default JewelryTryOn;