import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Globe() {
  const meshRef = useRef();
  
  // Create wireframe and points
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 200; i++) {
        const phi = Math.acos(-1 + (2 * i) / 200);
        const theta = Math.sqrt(200 * Math.PI) * phi;
        p.push(new THREE.Vector3().setFromSphericalCoords(1.5, phi, theta));
    }
    return p;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.15;
      meshRef.current.rotation.z = Math.sin(time * 0.1) * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Glow sphere */}
      <Sphere args={[1.45, 64, 64]}>
        <meshBasicMaterial color="#008080" transparent opacity={0.05} />
      </Sphere>
      
      {/* Wireframe */}
      <Sphere args={[1.5, 32, 32]}>
        <meshBasicMaterial color="#DEB887" wireframe transparent opacity={0.2} />
      </Sphere>

      {/* Connection points */}
      {points.map((p, i) => (
        <mesh key={i} position={p}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#DEB887" emissive="#DEB887" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

export default function Globe3D() {
  return (
    <div style={{ height: '350px', width: '100%', cursor: 'grab' }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#DEB887" />
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <Globe />
        </Float>
      </Canvas>
    </div>
  );
}
