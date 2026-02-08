import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const styles = [
  { id: "anime", name: "动漫", icon: "🎌" },
  { id: "cyberpunk", name: "赛博", icon: "🤖" },
  { id: "chibi", name: "Q版", icon: "🍡" },
  { id: "pixel", name: "像素", icon: "👾" },
];

export default function AvatarGenerator() {
  const [selectedStyle, setSelectedStyle] = useState("anime");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setGenerated(["🎮", "🕹️", "👤", "🧑‍🎤"]);
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">🎮 游戏头像</h1>
        <p className="text-center text-gray-600 mb-6">生成专属游戏风格头像</p>

        {/* Style Selection */}
        <div className="pixel-card p-4 mb-6 bg-white">
          <h3 className="font-bold mb-3">选择风格</h3>
          <div className="grid grid-cols-4 gap-2">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 border-4 border-black text-center transition-all ${
                  selectedStyle === style.id
                    ? "bg-primary text-white shadow-pixel"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <span className="text-2xl block mb-1">{style.icon}</span>
                <span className="text-xs font-bold">{style.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={generating}
          className="w-full h-14 text-lg mb-6"
        >
          {generating ? "生成中..." : "✨ 一键生成头像"}
        </Button>

        {/* Results */}
        {generated.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pixel-card p-4 bg-white"
          >
            <h3 className="font-bold mb-3">生成结果</h3>
            <div className="grid grid-cols-2 gap-3">
              {generated.map((avatar, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 border-4 border-black flex items-center justify-center text-6xl"
                >
                  {avatar}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1">💾 保存到本地</Button>
              <Button variant="outline" className="flex-1">🔄 重新生成</Button>
            </div>
          </motion.div>
        )}

        {/* Platform Icons */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">支持导出到</p>
          <div className="flex justify-center gap-4 text-2xl">
            <span title="Discord">💬</span>
            <span title="Steam">🎮</span>
            <span title="WeChat">💚</span>
            <span title="iOS">🍎</span>
          </div>
        </div>
      </div>
    </div>
  );
}
