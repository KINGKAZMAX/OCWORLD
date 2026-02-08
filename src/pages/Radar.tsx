import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { client } from "@/lib/api";

interface NearbyOC {
  id: string;
  name: string;
  avatar: string;
  image?: string;
  distance: number;
  style: string;
  angle: number;
}

// Style emojis mapping
const styleEmojis: Record<string, string> = {
  pixel: "🎮",
  anime: "🌸",
  cyberpunk: "🤖",
  chinese: "🏮",
  realistic: "📸",
  chibi: "🎀",
  gothic: "🦇",
  fantasy: "✨",
  urban: "🏙️",
};

export default function Radar() {
  const [scanning, setScanning] = useState(false);
  const [nearbyOCs, setNearbyOCs] = useState<NearbyOC[]>([]);
  const [selectedOC, setSelectedOC] = useState<NearbyOC | null>(null);
  const [range, setRange] = useState(500); // meters
  const [isLoading, setIsLoading] = useState(true);

  // Load real characters from community API
  const loadCharacters = async () => {
    setIsLoading(true);
    try {
      const res = await client.api.fetch("/api/public/community?limit=15");
      const data = await res.json();
      
      if (data.characters && data.characters.length > 0) {
        // Transform to nearby OC format with random positions
        const transformedOCs: NearbyOC[] = data.characters.map((char: any, index: number) => ({
          id: String(char.id),
          name: char.name,
          avatar: styleEmojis[char.styleId] || "🎭",
          image: char.image || char.thumbnail,
          distance: Math.floor(Math.random() * range * 0.9) + 20, // Random distance within range
          style: char.styleId || "pixel",
          angle: (index * 72 + Math.random() * 30) % 360, // Spread around the radar
        }));
        
        return transformedOCs;
      }
    } catch (error) {
      console.error("Failed to load characters:", error);
    }
    
    // Fallback to demo data if API fails
    return [
      { id: "demo-1", name: "神秘旅者", avatar: "🎭", distance: 120, style: "pixel", angle: 45 },
      { id: "demo-2", name: "星辰魔法師", avatar: "✨", distance: 250, style: "fantasy", angle: 150 },
      { id: "demo-3", name: "賽博武士", avatar: "🤖", distance: 180, style: "cyberpunk", angle: 270 },
    ];
  };

  const startScan = async () => {
    setScanning(true);
    setNearbyOCs([]);
    
    const allOCs = await loadCharacters();
    setIsLoading(false);
    
    // Simulate scanning animation
    allOCs.forEach((oc, index) => {
      setTimeout(() => {
        if (oc.distance <= range) {
          setNearbyOCs(prev => [...prev, oc]);
        }
      }, 500 + index * 300);
    });

    setTimeout(() => setScanning(false), 500 + allOCs.length * 300 + 500);
  };

  useEffect(() => {
    startScan();
  }, []);

  const getPositionFromAngle = (angle: number, distance: number) => {
    const maxRadius = 140; // max pixel radius on radar
    const normalizedDistance = Math.min(distance / range, 1);
    const radius = normalizedDistance * maxRadius;
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  };

  // Get avatar display
  const getAvatarDisplay = (oc: NearbyOC, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-10 h-10 text-xl",
      md: "w-14 h-14 text-2xl",
      lg: "w-20 h-20 text-4xl",
    };
    
    if (oc.image) {
      return (
        <div className={`${sizeClasses[size].split(" ").slice(0, 2).join(" ")} bg-white rounded-xl overflow-hidden shadow-sm`}>
          <img src={oc.image} alt={oc.name} className="w-full h-full object-cover" />
        </div>
      );
    }
    
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-sm`}>
        {oc.avatar}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 pb-24 bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2 gradient-text">發現附近的 OC</h1>
        <p className="text-gray-500 text-sm">探索你周圍的角色世界</p>
      </div>

      {/* Range Selector */}
      <div className="flex justify-center gap-3 mb-8">
        {[100, 500, 1000].map((r) => (
          <button
            key={r}
            onClick={() => { setRange(r); startScan(); }}
            className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
              range === r 
                ? "bg-primary text-white shadow-md" 
                : "bg-white/80 hover:bg-white text-gray-600 shadow-sm"
            }`}
          >
            {r}m
          </button>
        ))}
      </div>

      {/* Radar Display */}
      <div className="relative mx-auto w-72 h-72 md:w-80 md:h-80 mb-8">
        {/* Radar Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full overflow-hidden shadow-lg border border-gray-200">
          {/* Radar circles */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute border border-gray-200 rounded-full"
              style={{
                width: `${i * 33}%`,
                height: `${i * 33}%`,
                top: `${50 - (i * 33) / 2}%`,
                left: `${50 - (i * 33) / 2}%`,
              }}
            />
          ))}
          
          {/* Cross lines */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200" />
          
          {/* Scanning line */}
          {scanning && (
            <motion.div
              className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-secondary to-transparent origin-left"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "0% 50%" }}
            />
          )}

          {/* Center point (You) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium z-10 shadow-md">
            我
          </div>

          {/* Nearby OCs */}
          <AnimatePresence>
            {nearbyOCs.map((oc) => {
              const pos = getPositionFromAngle(oc.angle, oc.distance);
              return (
                <motion.button
                  key={oc.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setSelectedOC(oc)}
                  className="absolute w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center cursor-pointer hover:z-20 shadow-pixel overflow-hidden"
                  style={{
                    top: `calc(50% + ${pos.y}px)`,
                    left: `calc(50% + ${pos.x}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {oc.image ? (
                    <img src={oc.image} alt={oc.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{oc.avatar}</span>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Distance labels */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-600">
          {range}m
        </div>
      </div>

      {/* Scan Button */}
      <div className="flex justify-center mb-6">
        <Button 
          onClick={startScan} 
          disabled={scanning}
          className="w-48 h-12 text-lg"
        >
          {scanning ? "掃描中..." : "🔄 重新掃描"}
        </Button>
      </div>

      {/* Nearby OC List */}
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-4">附近的 OC ({nearbyOCs.length})</h2>
        {isLoading && nearbyOCs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"
            />
            載入中...
          </div>
        ) : nearbyOCs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>目前附近沒有發現 OC 角色</p>
            <p className="text-sm">試試調整範圍或重新掃描</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nearbyOCs.map((oc) => (
              <motion.div
                key={oc.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="pixel-card p-4 flex items-center gap-4"
              >
                {getAvatarDisplay(oc, "md")}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{oc.name}</h3>
                  <p className="text-sm text-gray-600">
                    {oc.distance}m · {oc.style}
                  </p>
                </div>
                <Link to={`/chat/${oc.id}`}>
                  <Button size="sm">💬 對話</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Selected OC Modal */}
      <AnimatePresence>
        {selectedOC && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedOC(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="pixel-card p-6 max-w-sm w-full bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex justify-center">
                  {getAvatarDisplay(selectedOC, "lg")}
                </div>
                <h3 className="text-2xl font-bold mb-2">{selectedOC.name}</h3>
                <p className="text-gray-600 mb-4">
                  距離你 {selectedOC.distance}m · {selectedOC.style} 風格
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link to={`/chat/${selectedOC.id}`}>
                    <Button>💬 開始對話</Button>
                  </Link>
                  <Link to="/oc-social">
                    <Button variant="outline">🌐 社交圈</Button>
                  </Link>
                  <Button variant="outline" onClick={() => setSelectedOC(null)}>
                    關閉
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
