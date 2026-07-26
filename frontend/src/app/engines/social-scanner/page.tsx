"use client";

import { useEffect, useState, useCallback } from "react";
// Assuming framer-motion is installed as per README
import { motion } from "framer-motion";
import { scannerAPI } from "@/lib/api";

interface ThreatAlert {
  timestamp: string;
  platform: string;
  content: string;
  estimatedReach: number;
  threatType: string;
  severity: string;
}

interface ScannerStatus {
  lastRun: string;
  isScanningNow: boolean;
  activeThreats: ThreatAlert[];
}

export default function SocialScannerPage() {
  const [status, setStatus] = useState<ScannerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await scannerAPI.status();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch scanner status", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleManualScan = async () => {
    setRefreshing(true);
    try {
      await scannerAPI.run();
      await fetchStatus();
    } catch (err) {
      console.error(err);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Proactive Social Scanner
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time threat detection across social networks to identify pump-and-dump schemes.
            </p>
          </div>
          <button 
            onClick={handleManualScan}
            disabled={refreshing || status?.isScanningNow}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
          >
            {(refreshing || status?.isScanningNow) ? (
              <span className="animate-pulse">Scanning...</span>
            ) : (
              <span>Run Manual Scan</span>
            )}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Active Threats</h3>
            <p className="text-4xl font-bold text-red-500 mt-2">{status?.activeThreats.length || 0}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Status</h3>
            <p className="text-2xl font-semibold mt-2">
              {status?.isScanningNow ? (
                <span className="text-yellow-400 animate-pulse">Scanning Active</span>
              ) : (
                <span className="text-green-400">Monitoring Active</span>
              )}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Last Scan</h3>
            <p className="text-lg font-medium text-gray-300 mt-3">
              {status?.lastRun ? new Date(status.lastRun).toLocaleString() : "Never"}
            </p>
          </div>
        </div>

        {/* Threats Feed */}
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">Recent Alerts</h2>
          
          {status?.activeThreats.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center text-gray-500">
              No active threats detected. The network is secure.
            </div>
          ) : (
            <div className="space-y-4">
              {status?.activeThreats.map((alert, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index} 
                  className="bg-gray-900 border border-red-900/30 border-l-4 border-l-red-500 rounded-xl p-6 shadow-lg hover:border-red-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {alert.severity} RISK
                      </span>
                      <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
                        {alert.platform}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  
                  <p className="text-gray-200 text-lg mb-4 italic">
                    "{alert.content}"
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-400 space-x-4">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-300 mr-2">Type:</span> 
                      {alert.threatType.replace(/_/g, ' ')}
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-300 mr-2">Est. Reach:</span> 
                      {alert.estimatedReach.toLocaleString()} users
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
