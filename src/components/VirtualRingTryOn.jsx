import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';

const VirtualRingTryOn = () => {
  const [selectedRing, setSelectedRing] = useState(0);
  const [scale, setScale] = useState(1);
  const [isStarted, setIsStarted] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Sample ring styles
  const rings = [
    {
      color: '#FFD700', // Gold
      size: 30,
      name: 'Gold Ring'
    },
    {
      color: '#C0C0C0', // Silver
      size: 25,
      name: 'Silver Ring'
    },
    {
      color: '#B76E79', // Rose Gold
      size: 35,
      name: 'Rose Gold Ring'
    }
  ];

  const startCamera = () => {
    setIsStarted(true);
    if (webcamRef.current) {
      requestAnimationFrame(drawFrame);
    }
  };

  const stopCamera = () => {
    setIsStarted(false);
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

    // Draw virtual ring
    drawRing(ctx, rings[selectedRing]);

    if (isStarted) {
      requestAnimationFrame(drawFrame);
    }
  };

  const drawRing = (ctx, ring) => {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const scaledSize = ring.size * scale;

    // Draw ring band
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, scaledSize, scaledSize / 3, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw gemstone
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.moveTo(centerX, centerY - scaledSize/2);
    ctx.lineTo(centerX + scaledSize/4, centerY - scaledSize/3);
    ctx.lineTo(centerX, centerY - scaledSize/6);
    ctx.lineTo(centerX - scaledSize/4, centerY - scaledSize/3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Virtual Ring Try-on</h1>
          <button
            onClick={isStarted ? stopCamera : startCamera}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          mirrored={true}
          videoConstraints={videoConstraints}
          onLoadedMetadata={startCamera}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        {!isStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
            <p className="text-gray-500">Click the camera icon to begin</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-4">
        <div className="flex space-x-2">
          {rings.map((ring, index) => (
            <button
              key={index}
              onClick={() => setSelectedRing(index)}
              className={`p-2 border rounded hover:border-blue-400 transition-colors ${
                selectedRing === index ? 'border-blue-500' : 'border-gray-300'
              }`}
              style={{ backgroundColor: ring.color }}
            >
              <span className="block w-12 h-12 text-xs text-white text-center">
                {ring.name}
              </span>
            </button>
          ))}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Ring Size</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-4 text-sm space-y-2">
        <p className="font-medium">Instructions:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click the camera icon to start</li>
          <li>Allow camera access when prompted</li>
          <li>Select different ring styles</li>
          <li>Use the slider to adjust ring size</li>
          <li>Position your hand in the center of the frame</li>
        </ul>
      </div>
    </div>
  );
};

export default VirtualRingTryOn;