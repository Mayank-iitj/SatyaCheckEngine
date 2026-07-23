"use client";

import { Canvas } from "@react-three/fiber";
import { Float, Environment, PresentationControls, Text, ContactShadows, RoundedBox } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

function DocumentModel() {
  return (
    <Float rotationIntensity={0.5} floatIntensity={1.5} speed={2}>
      <group rotation={[0.2, -0.4, 0]}>
        {/* Main Document Body */}
        <RoundedBox args={[3, 4.2, 0.1]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#fefaf6" roughness={0.2} metalness={0.1} />
        </RoundedBox>

        {/* Glowing Blockchain Seal / Logo Area */}
        <mesh position={[0, 1.2, 0.06]}>
          <circleGeometry args={[0.4, 32]} />
          <meshStandardMaterial color="#C68A5E" emissive="#C68A5E" emissiveIntensity={0.8} />
        </mesh>

        {/* Title Text */}
        <Text
          position={[0, 0.4, 0.06]}
          fontSize={0.25}
          color="#1a1a1a"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          ACADEMIC DEGREE
        </Text>

        <Text
          position={[0, 0.1, 0.06]}
          fontSize={0.1}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          VERIFIED ON POLYGON
        </Text>

        {/* Decorative Lines simulating text */}
        <group position={[-1.1, -0.4, 0.06]}>
          <mesh position={[1.1, 0, 0]}>
            <planeGeometry args={[2.2, 0.04]} />
            <meshStandardMaterial color="#e5e5e5" />
          </mesh>
          <mesh position={[1.1, -0.15, 0]}>
            <planeGeometry args={[2.2, 0.04]} />
            <meshStandardMaterial color="#e5e5e5" />
          </mesh>
          <mesh position={[0.8, -0.3, 0]}>
            <planeGeometry args={[1.6, 0.04]} />
            <meshStandardMaterial color="#e5e5e5" />
          </mesh>
        </group>

        {/* Cryptographic Hash simulation */}
        <Text
          position={[0, -1.5, 0.06]}
          fontSize={0.08}
          color="#C68A5E"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
        >
          0x7F83...A9B2 - CRYPTOGRAPHICALLY SECURED
        </Text>

        {/* Document Border/Edge Highlighting */}
        <RoundedBox args={[3.04, 4.24, 0.08]} radius={0.06} smoothness={4} position={[0, 0, -0.02]}>
          <meshStandardMaterial color="#d4c3b3" roughness={0.8} metalness={0.2} />
        </RoundedBox>
      </group>
    </Float>
  );
}

export function InteractiveDoc() {
  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <PresentationControls
            global
            rotation={[0.13, 0.1, 0]}
            polar={[-0.4, 0.2]}
            azimuth={[-0.5, 0.5]}
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 400 }}
          >
            <DocumentModel />
          </PresentationControls>
          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        </Suspense>
      </Canvas>
    </div>
  );
}
