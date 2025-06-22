import { useCallback } from "react";
import { loadFull } from "tsparticles";
import { Particles } from "react-tsparticles";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1
        },
        background: {
          color: {
            value: "transparent"
          }
        },
        particles: {
          number: {
            value: 25,
            density: {
              enable: true,
              area: 800
            }
          },
          color: {
            value: "#39FF14"
          },
          shape: {
            type: "circle"
          },
          opacity: {
            value: 0.1
          },
          size: {
            value: 3
          },
          links: {
            enable: true,
            color: "#39FF14",
            distance: 150,
            opacity: 0.1,
            width: 1
          },
          move: {
            enable: true,
            speed: 0.5,
            outModes: {
              default: "bounce"
            }
          }
        }
      }}
    />
  );
}
