import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

function GlassBlock({ position, delay }) {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime() + delay;
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.15;
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 0.2]} />
      <MeshTransmissionMaterial
        backside
        samples={16}
        resolution={256}
        transmission={0.95}
        roughness={0.1}
        thickness={0.2}
        ior={1.5}
        chromaticAberration={0.02}
        anisotropy={0.1}
        distortion={0.1}
        distortionScale={0.1}
        temporalDistortion={0.1}
        color="#ffffff"
      />
    </mesh>
  );
}

function SceneContent() {
  const groupRef = useRef();

  const blocks = useMemo(() => {
    const b = [];
    for (let i = 0; i < 12; i++) {
      b.push({
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 5 - 5
        ],
        delay: Math.random() * 10
      });
    }
    return b;
  }, []);

  useFrame((state) => {
    const { mouse } = state;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (mouse.x * Math.PI) / 40, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (mouse.y * Math.PI) / 40, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {blocks.map((b, i) => (
        <GlassBlock key={i} position={b.position} delay={b.delay} />
      ))}
      
      {/* Subtle background light */}
      <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.5} penumbra={1} color="#DEB887" />
      <pointLight position={[-10, -5, -5]} intensity={0.2} color="#008080" />
    </group>
  );
}

export default function Scene3D() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', background: '#080c12' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <color attach="background" args={['#080c12']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <SceneContent />
        
        {/* Environment adds reflections to the glass */}
        <Environment preset="city" />
      </Canvas>
      
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, transparent 0%, #080c12 90%)', pointerEvents: 'none' }}></div>
    </div>
  );
}
