import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AssetCoin() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
        meshRef.current.rotation.y = time * 0.4;
        meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Rim (Gold) */}
      <mesh>
        <cylinderGeometry args={[2, 2, 0.3, 64]} />
        <meshPhysicalMaterial
          color="#c8a96e"
          metalness={1}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive="#c8a96e"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Inner Obsidian Face */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 0.4, 64]} />
        <meshPhysicalMaterial
          color="#0e1520"
          metalness={0.8}
          roughness={0.05}
          clearcoat={1}
          reflectivity={1}
          anisotropy={0.5}
        />
      </mesh>

      {/* Stellar Logo cutout (Represented by a torus and cross) */}
      <group position={[0, 0.21, 0]} rotation={[Math.PI / 2, 0, 0]}>
           <mesh>
             <torusGeometry args={[0.5, 0.05, 16, 100]} />
             <meshBasicMaterial color="#ffffff" />
           </mesh>
           <mesh>
              <boxGeometry args={[0.05, 1.2, 0.05]} />
              <meshBasicMaterial color="#ffffff" />
           </mesh>
      </group>
      <group position={[0, -0.21, 0]} rotation={[Math.PI / 2, 0, 0]}>
           <mesh>
             <torusGeometry args={[0.5, 0.05, 16, 100]} />
             <meshBasicMaterial color="#ffffff" />
           </mesh>
           <mesh>
              <boxGeometry args={[0.05, 1.2, 0.05]} />
              <meshBasicMaterial color="#ffffff" />
           </mesh>
      </group>
    </group>
  );
}

export default function ExplorerHero3D() {
  return (
    <div style={{ height: '400px', width: '100%', cursor: 'grab' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-5, -5, -5]} intensity={1} color="#c8a96e" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <AssetCoin />
        </Float>
      </Canvas>
    </div>
  );
}
