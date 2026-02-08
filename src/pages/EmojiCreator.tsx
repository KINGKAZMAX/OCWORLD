import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const emotions = [
  { id: "happy", emoji: "😊", name: "开心" },
  { id: "sad", emoji: "😢", name: "难过" },
  { id: "angry", emoji: "😠", name: "生气" },
  { id: "surprise", emoji: "😲", name: "惊讶" },
  { id: "love", emoji: "😍", name: "喜欢" },
  { id: "cry", emoji: "😭", name: "大哭" },
  { id: "laugh", emoji: "🤣", name: "大笑" },
  { id: "cool", emoji: "😎", name: "酷" },
];

export default function EmojiCreator() {
  const [selectedOC, setSelectedOC] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedEmojis, setGeneratedEmojis] = useState<string[]>([]);

  const mockOCs = [
    { id: "1", name: "星辰魔法师", avatar: "🧙‍♂️" },
    { id: "2", name: "赛博武士", avatar: "🥷" },
    { id: "3", name: "森林精灵", avatar: "🧝‍♀️" },
  ];

  const handleGenerate = () => {
    if (!selectedOC) return;
    setGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setGeneratedEmojis(emotions.map(e => e.emoji));
      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">😀 表情包创作</h1>
        <p className="text-center text-gray-600 mb-6">一键生成8种表情</p>

        {/* OC Selection */}
        <div className="pixel-card p-4 mb-6 bg-white">
          <h3 className="font-bold mb-3">选择OC角色</h3>
          <div className="flex gap-3">
            {mockOCs.map((oc) => (
              <button
                key={oc.id}
                onClick={() => setSelectedOC(oc.id)}
                className={`flex-1 p-3 border-4 border-black text-center transition-all ${
                  selectedOC === oc.id
                    ? "bg-primary text-white shadow-pixel"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <span className="text-3xl block mb-1">{oc.avatar}</span>
                <span className="text-xs font-bold">{oc.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Expression Preview */}
        <div className="pixel-card p-4 mb-6 bg-white">
          <h3 className="font-bold mb-3">表情类型预览</h3>
          <div className="grid grid-cols-4 gap-2">
            {emotions.map((emotion) => (
              <div
                key={emotion.id}
                className="p-2 border-2 border-black text-center bg-gray-50"
              >
                <span className="text-2xl block">{emotion.emoji}</span>
                <span className="text-xs">{emotion.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={!selectedOC || generating}
          className="w-full h-14 text-lg mb-6"
        >
          {generating ? "生成中..." : "✨ 一键生成表情包"}
        </Button>

        {/* Results */}
        {generatedEmojis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pixel-card p-4 bg-white"
          >
            <h3 className="font-bold mb-3">生成结果</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {generatedEmojis.map((emoji, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-black flex items-center justify-center text-3xl"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">📦 打包下载</Button>
              <Button variant="outline" className="flex-1">📤 导出GIF</Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
