import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

// Import needed components from shadcn/ui

const ARTryOn = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedJewelry, setSelectedJewelry] = useState(null);

  // Sample jewelry items
  const jewelryItems = [
    {
      id: 1,
      name: 'Gold Ring',
      image: '/api/placeholder/100/100',
      position: 'indexFinger' // Will be placed on index finger
    },
    {
      id: 2,
      name: 'Silver Band',
      image: '/api/placeholder/100/100',
      position: 'ringFinger' // Will be placed on ring finger
    }
  ];

  useEffect(() => {
    let handLandmarker;
    let runningMode = "IMAGE";
    let webcamRunning = false;

    const createHandLandmarker = async () => {
      try {
        const vision = window.vision;
        const handLandmarkerConfig = {
          baseOptions: {
            modelAssetPath: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: runningMode,
          numHands: 2
        };
        handLandmarker = await vision.HandLandmarker.createFromOptions(handLandmarkerConfig);
      } catch (error) {
        console.error("Error creating hand landmarker:", error);
      }
    };

    const hasGetUserMedia = () => {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    };

    const enableCam = async () => {
      if (!handLandmarker) {
        console.log("Wait for handLandmarker to load!");
        return;
      }

      if (webcamRunning) {
        webcamRunning = false;
        return;
      }

      const constraints = { video: true };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = videoRef.current;
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    const predictWebcam = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      let startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = handLandmarker.detectForVideo(video, startTimeMs);
      }

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          // Draw jewelry on specific landmarks
          if (selectedJewelry) {
            const fingerLandmark = landmarks[8]; // Index finger tip
            const jewelryImg = new Image();
            jewelryImg.src = selectedJewelry.image;
            
            // Draw jewelry image at landmark position
            ctx.drawImage(
              jewelryImg,
              fingerLandmark.x * canvas.width - 25,
              fingerLandmark.y * canvas.height - 25,
              50,
              50
            );
          }
        }
      }
      
      ctx.restore();

      if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
      }
    };

    let results = undefined;
    let lastVideoTime = -1;

    if (isStarted) {
      createHandLandmarker();
      if (hasGetUserMedia()) {
        enableCam();
        webcamRunning = true;
      }
    }

    return () => {
      if (webcamRunning) {
        webcamRunning = false;
        const video = videoRef.current;
        if (video && video.srcObject) {
          const tracks = video.srcObject.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    };
  }, [isStarted, selectedJewelry]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">AR Jewelry Try-On</h2>
          <button 
            onClick={() => setIsStarted(!isStarted)}
            className="flex items-center gap-2"
          >
            {/* <Camera className="w-4 h-4" /> */}
            {isStarted ? 'Stop Camera' : 'Start Camera'}
            </button>
        </div>

        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {jewelryItems.map(item => (
            <button
              key={item.id}
              variant={selectedJewelry?.id === item.id ? 'default' : 'outline'}
              onClick={() => setSelectedJewelry(item)}
              className="p-4"
            >
              <div className="flex items-center gap-2">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                <span>{item.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ARTryOn;