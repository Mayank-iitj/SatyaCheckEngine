"use client";

import { useEffect, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";
import { featuresAPI } from "@/lib/api";

interface HeatmapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  messageHash: string;
}

interface HeatmapNode {
  id: string;
  handle: string;
  type: string;
  platform: string;
  isPatientZero: boolean;
  edgesSource: HeatmapEdge[];
}

interface HeatmapCampaign {
  id: string;
  name: string;
  assetName: string;
  nodes: HeatmapNode[];
}

export default function HeatmapPage() {
  const [campaigns, setCampaigns] = useState<HeatmapCampaign[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const data = await featuresAPI.getHeatmap();
        setCampaigns(data.campaigns || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  const activeCampaign = campaigns[selectedIndex];

  // Pre-calculate positions to create a circular graph radiating from Patient Zero
  const { nodePositions, allEdges } = useMemo(() => {
    const positions = new Map<string, THREE.Vector3>();
    const edges: HeatmapEdge[] = [];

    if (!activeCampaign) return { nodePositions: positions, allEdges: edges };

    const nodes = activeCampaign.nodes;
    let pZIndex = nodes.findIndex(n => n.isPatientZero);
    if (pZIndex === -1) pZIndex = 0;

    nodes.forEach((node, i) => {
      if (node.isPatientZero) {
        positions.set(node.id, new THREE.Vector3(0, 0, 0));
      } else {
        const radius = 5 + Math.random() * 8; // wider spread
        const angle = (i / nodes.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (Math.random() - 0.5) * 8;
        positions.set(node.id, new THREE.Vector3(x, y, z));
      }

      // Collect edges
      if (node.edgesSource) {
        edges.push(...node.edgesSource);
      }
    });

    return { nodePositions: positions, allEdges: edges };
  }, [activeCampaign]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Heatmap Data...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 pointer-events-auto transition mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 mb-2 drop-shadow-lg">
            "Patient Zero" Heatmap
          </h1>
          <p className="text-gray-400 max-w-lg leading-relaxed text-sm">
            Live 3D visualization of fraudulent pump-and-dump rumors spreading across social networks. Tracking message hashes from origin to retail investors.
          </p>
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          {/* Campaign Selector */}
          <div className="bg-gray-900/80 backdrop-blur border border-gray-800 p-4 rounded-xl w-64 max-h-[400px] overflow-y-auto">
            <h3 className="text-sm font-semibold mb-3 text-gray-300 uppercase tracking-wider flex items-center">
              <Activity className="w-4 h-4 mr-2 text-red-500" /> Active Campaigns
            </h3>
            <div className="space-y-2">
              {campaigns.map((camp, idx) => (
                <button
                  key={camp.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-2 rounded text-xs transition-colors border ${
                    selectedIndex === idx 
                      ? 'bg-red-500/20 border-red-500/50 text-red-300' 
                      : 'bg-black/50 border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="font-bold truncate">{camp.name}</div>
                  <div className="text-[10px] opacity-70 mt-1">Target: {camp.assetName}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur border border-gray-800 p-4 rounded-xl h-fit">
            <h3 className="text-sm font-semibold mb-3 text-gray-300 uppercase tracking-wider">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-600 mr-2 shadow-[0_0_10px_red]"></div> Patient Zero</div>
              <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div> Telegram</div>
              <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> WhatsApp</div>
              <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-cyan-400 mr-2"></div> Twitter</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-screen absolute inset-0">
        <Canvas camera={{ position: [0, 5, 20], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} autoRotate autoRotateSpeed={0.5} />
          
          {activeCampaign?.nodes.map(node => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            // Calculate "heat" based on number of outbound edges
            const edgeCount = node.edgesSource?.length || 0;
            const size = node.isPatientZero ? 0.8 : 0.3 + (edgeCount * 0.1);
            
            const color = node.isPatientZero ? "#ef4444" : 
                          node.platform === "TELEGRAM" ? "#3b82f6" : 
                          node.platform === "WHATSAPP" ? "#22c55e" : "#22d3ee";
            return (
              <group key={node.id} position={pos}>
                <Sphere args={[size, 32, 32]}>
                  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={node.isPatientZero || edgeCount > 2 ? 2 : 0.5} />
                </Sphere>
                <Html distanceFactor={15}>
                  <div className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap -translate-x-1/2 translate-y-3 ${node.isPatientZero ? 'bg-red-900/80 text-red-100 border border-red-500' : 'bg-gray-800/80 text-gray-200 border border-gray-700'}`}>
                    {node.handle}
                  </div>
                </Html>
              </group>
            );
          })}

          {allEdges.map(edge => {
            const start = nodePositions.get(edge.sourceId);
            const end = nodePositions.get(edge.targetId);
            if (!start || !end) return null;
            return (
              <Line 
                key={edge.id}
                points={[start, end]}
                color="#ef4444"
                lineWidth={1}
                transparent
                opacity={0.3}
              />
            );
          })}
        </Canvas>
      </div>
    </div>
  );
}
