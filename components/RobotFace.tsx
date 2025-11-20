import React, { useEffect, useState } from 'react';
import { RobotEmotion } from '../types';

interface RobotFaceProps {
  emotion: RobotEmotion;
}

export const RobotFace: React.FC<RobotFaceProps> = ({ emotion }) => {
  const [mouthOpen, setMouthOpen] = useState(false);
  
  // Animation loop for talking
  useEffect(() => {
    let interval: any;
    if (emotion === 'talking') {
      interval = setInterval(() => {
        setMouthOpen(prev => !prev);
      }, 150);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [emotion]);

  // Eye shapes based on emotion
  const getEyeShape = () => {
    switch (emotion) {
      case 'happy':
        return <path d="M10,20 Q25,5 40,20" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />;
      case 'sad':
        return <path d="M10,10 Q25,25 40,10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />;
      case 'listening':
        return <circle cx="25" cy="15" r="10" fill="currentColor" className="animate-pulse" />;
      case 'thinking':
        return <circle cx="25" cy="15" r="5" fill="currentColor" />;
      default: // idle, talking
        return <circle cx="25" cy="15" r="8" fill="currentColor" />;
    }
  };

  // Mouth shapes
  const getMouthShape = () => {
    if (emotion === 'talking') {
      return mouthOpen 
        ? <rect x="30" y="55" width="40" height="15" rx="5" fill="currentColor" />
        : <rect x="30" y="60" width="40" height="4" rx="2" fill="currentColor" />;
    }
    if (emotion === 'listening') {
       return <circle cx="50" cy="60" r="8" fill="none" stroke="currentColor" strokeWidth="3" />;
    }
    if (emotion === 'happy') {
      return <path d="M30,55 Q50,75 70,55" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />;
    }
    if (emotion === 'sad') {
      return <path d="M30,65 Q50,45 70,65" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />;
    }
    // Idle
    return <path d="M35,60 Q50,65 65,60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />;
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      {/* Significantly increased dimensions */}
      <div className="relative w-[85vw] max-w-[600px] aspect-[4/3] bg-bmo-screen rounded-[3rem] sm:rounded-[4rem] border-[16px] border-bmo-body shadow-[inset_0_0_60px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(99,207,160,0.4)]">
        {/* Screen Glare */}
        <div className="absolute top-8 left-8 w-24 h-8 bg-white opacity-40 rounded-full transform -rotate-12"></div>
        
        {/* Face SVG Container */}
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 text-bmo-face">
          {/* Left Eye */}
          <g transform="translate(10, 20)">
            {getEyeShape()}
          </g>
          
          {/* Right Eye */}
          <g transform="translate(50, 20)">
            {getEyeShape()}
          </g>

          {/* Cheeks (Blush) */}
          {(emotion === 'happy' || emotion === 'idle') && (
            <>
              <circle cx="20" cy="50" r="4" fill="#f472b6" opacity="0.6" />
              <circle cx="80" cy="50" r="4" fill="#f472b6" opacity="0.6" />
            </>
          )}

          {/* Mouth */}
          {getMouthShape()}
        </svg>
      </div>
    </div>
  );
};
