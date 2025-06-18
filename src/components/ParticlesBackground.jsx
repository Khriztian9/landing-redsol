import React, { useCallback } from 'react';
import { Particles } from 'react-tsparticles';
import { loadFull } from 'tsparticles';

function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        particles: {
          number: {
            value: 50,
            density: { enable: true, area: 800 },
          },
          color: { value: '#ffffff' },
          shape: { type: 'circle' },
          opacity: { value: 0.4 },
          size: { value: { min: 1, max: 5 } },
          links: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            outModes: { default: 'bounce' },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'repulse' },
            resize: true,
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
          },
        },
        background: {
          color: 'transparent',
        },
      }}
    />
  );
}

export default ParticlesBackground;
