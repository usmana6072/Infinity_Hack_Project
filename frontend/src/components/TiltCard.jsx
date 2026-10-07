import React, { useRef, useState } from 'react';

/**
 * TiltCard: Interactive 3D Card with mouse-tracking perspective tilt, 
 * depth elevation, and dynamic specular reflection glare.
 */
export default function TiltCard({ 
  children, 
  className = '', 
  style = {}, 
  maxTilt = 7, 
  glare = true, 
  ...props 
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px) scale3d(1.018, 1.018, 1.018)`);

    if (glare) {
      setGlareStyle({
        opacity: 0.9,
        background: `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%)`
      });
    }
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)');
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      {glare && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 3,
            borderRadius: 'inherit',
            transition: 'opacity 0.25s ease',
            ...glareStyle
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        {children}
      </div>
    </div>
  );
}
