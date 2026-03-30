import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Edges, Environment } from '@react-three/drei';
import * as THREE from 'three';

function LedgerBlock() {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
        meshRef.current.rotation.y = time * 0.8;
        meshRef.current.rotation.x = Math.sin(time * 0.4) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <MeshTransmissionMaterial
        backside
        samples={8}
        resolution={128}
        transmission={0.9}
        roughness={0.05}
        thickness={0.1}
        ior={1.4}
        chromaticAberration={0.01}
        color="#ffffff"
      />
      <Edges scale={1.001} threshold={15} color="#2dd4bf" />
      
      {/* Internal core */}
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshPhysicalMaterial color="#0e1520" metalness={0.8} roughness={0.1} emissive="#2dd4bf" emissiveIntensity={0.1} />
      </mesh>
    </mesh>
  );
}

function ProsperityToken() {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
        meshRef.current.rotation.y = time * 1.5;
        meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.02);
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <cylinderGeometry args={[1, 1, 0.1, 64]} />
        <meshPhysicalMaterial
          color="#c8a96e"
          metalness={1}
          roughness={0.1}
          clearcoat={1}
          reflectivity={1}
        />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
         <cylinderGeometry args={[0.9, 0.9, 0.05, 64]} />
         <meshPhysicalMaterial color="#0e1520" metalness={0.8} roughness={0.1} />
      </mesh>
      <pointLight intensity={2} color="#c8a96e" />
    </group>
  );
}

export default function TransactionStatus3D({ status }) {
  return (
    <div style={{ height: '200px', width: '100%', marginBottom: '10px' }}>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          {status === 'success' ? <ProsperityToken /> : <LedgerBlock />}
        </Float>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
