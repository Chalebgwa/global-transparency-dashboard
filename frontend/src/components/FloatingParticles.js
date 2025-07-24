import React, { useEffect, useState } from 'react';

const FloatingParticles = ({ count = 20 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          size: Math.random() * 6 + 2, // 2-8px
          left: Math.random() * 100, // 0-100%
          top: Math.random() * 100, // 0-100%
          animationDelay: Math.random() * 8, // 0-8s
          animationDuration: 8 + Math.random() * 8, // 8-16s
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, [count]);

  return (
    <div className="floating-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;