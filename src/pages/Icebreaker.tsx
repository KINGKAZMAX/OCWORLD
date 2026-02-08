import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NearbyPerson {
  id: string;
  name: string;
  avatar: string;
  oc: { name: string; avatar: string };
  distance: number;
  interests: string[];
}

const mockNearby: NearbyPerson[] = [
  { 
    id: "1", 
    name: "小明", 
    avatar: "👦", 
    oc: { name: "星辰魔法师", avatar: "🧙‍♂️" },
    distance: 50,
    interests: ["幻想", "像素艺术"]
  },
  { 
    id: "2", 
    name: "小红", 
    avatar: "👧", 
    oc: { name: "森林精灵", avatar: "🧝‍♀️" },
    distance: 120,
    interests: ["二次元", "古风"]
  },
  { 
    id: "3", 
    name: "小刚", 
    avatar: "🧑", 
    oc: { name: "赛博武士", avatar: "🥷" },
    distance: 200,
    interests: ["赛博朋克", "机甲"]
  },
];

export default function Icebreaker() {
  const [matched, setMatched] = useState<NearbyPerson | null>(null);
  const [stage, setStage] = useState<"intro" | "matching" | "matched">("intro");

  const startMatching = () => {
    setStage("matching");
    // Simulate matching
    setTimeout(() => {
      setMatched(mockNearby[Math.floor(Math.random() * mockNearby.length)]);
      setStage("matched");
    }, 3000);
  };

  return (
    <div className="min-h-screen p-4 pb-24 flex flex-col">
      <div className="max-w-lg mx-auto flex-1 flex flex-col">
        <h1 className="text-3xl font-bold text-center mb-2">🤝 线下破冰</h1>
        <p className="text-center text-gray-600 mb-8">陌生人 → 朋友 😊</p>

        {stage === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            {/* Illustration */}
            <div className="pixel-card p-8 bg-gradient-to-br from-green-100 to-blue-100 mb-8">
              <div className="flex items-end justify-center gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center text-3xl mb-2">
                    🧙‍♂️
                  </div>
                  <p className="text-xs">战士</p>
                </div>
                <div className="text-4xl mb-4">🤝</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center text-3xl mb-2">
                    🧝‍♀️
                  </div>
                  <p className="text-xs">法师</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="bg-white px-3 py-1 border-2 border-black text-sm">
                  ❤️ 我们组队吧！
                </span>
              </div>
            </div>

            <div className="pixel-card p-4 bg-white mb-6 w-full">
              <h3 className="font-bold mb-2">如何破冰？</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white flex items-center justify-center text-xs font-bold">1</span>
                  打开位置权限
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white flex items-center justify-center text-xs font-bold">2</span>
                  匹配附近的OC创作者
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-white flex items-center justify-center text-xs font-bold">3</span>
                  用OC角色开始对话
                </li>
              </ul>
            </div>

            <Button onClick={startMatching} className="w-full h-14 text-lg">
              🚀 开始匹配
            </Button>
          </motion.div>
        )}

        {stage === "matching" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="pixel-card p-8 bg-white mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-4 border-black border-t-primary mx-auto rounded-full"
              />
            </div>
            <p className="text-xl font-bold">正在寻找附近的创作者...</p>
            <p className="text-gray-500 mt-2">发现 {mockNearby.length} 人在附近</p>
          </motion.div>
        )}

        {stage === "matched" && matched && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-6">匹配成功！</h2>

            <div className="pixel-card p-6 bg-white w-full mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-black flex items-center justify-center text-3xl">
                  {matched.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{matched.name}</h3>
                  <p className="text-sm text-gray-600">距离你 {matched.distance}m</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 border-2 border-black">
                <span className="text-2xl">{matched.oc.avatar}</span>
                <div>
                  <p className="text-xs text-gray-500">TA的OC</p>
                  <p className="font-bold">{matched.oc.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {matched.interests.map((interest) => (
                  <span key={interest} className="px-2 py-1 bg-primary/10 border-2 border-black text-xs">
                    #{interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <Link to={`/chat/${matched.id}`} className="flex-1">
                <Button className="w-full">💬 开始对话</Button>
              </Link>
              <Button variant="outline" onClick={() => setStage("intro")}>
                重新匹配
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
