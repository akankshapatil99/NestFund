import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

function Plate({ position, delay, scale }) {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime() + delay;
    if (meshRef.current) {
        meshRef.current.position.y = position[1] + Math.sin(time * 0.8) * 0.05;
        meshRef.current.rotation.y = time * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[2, 0.05, 2]} />
      <MeshTransmissionMaterial
        backside
        samples={8}
        resolution={128}
        transmission={0.9}
        roughness={0.1}
        thickness={0.05}
        ior={1.4}
        chromaticAberration={0.01}
        color="#2dd4bf"
      />
    </mesh>
  );
}

function KnowledgeStructure() {
  const groupRef = useRef();

  const plates = useMemo(() => [
    { pos: [0, 0.5, 0], scale: 0.6 },
    { pos: [0, 0, 0], scale: 1 },
    { pos: [0, -0.5, 0], scale: 1.4 },
  ], []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {plates.map((p, i) => (
        <Plate key={i} position={p.pos} delay={i * 0.5} scale={p.scale} />
      ))}
      
      {/* Central glow core */}
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
        <pointLight intensity={2} color="#2dd4bf" />
      </mesh>
    </group>
  );
}

export default function KnowledgeOrb3D() {
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 10, 5]} intensity={1} color="#ffffff" />
        <KnowledgeStructure />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
