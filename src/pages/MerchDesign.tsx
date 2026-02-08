import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const merchTypes = [
  { id: "sticker", name: "贴纸", icon: "🏷️", sizes: ["5x5cm", "10x10cm"] },
  { id: "keychain", name: "钥匙扣", icon: "🔑", sizes: ["4cm", "6cm"] },
  { id: "badge", name: "徽章", icon: "🎖️", sizes: ["3cm", "5cm"] },
  { id: "postcard", name: "明信片", icon: "📮", sizes: ["A6", "A5"] },
  { id: "poster", name: "海报", icon: "🖼️", sizes: ["A4", "A3", "A2"] },
  { id: "phone-case", name: "手机壳", icon: "📱", sizes: ["iPhone", "Android"] },
];

export default function MerchDesign() {
  const [selectedType, setSelectedType] = useState("sticker");
  const [selectedSize, setSelectedSize] = useState("");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(false);

  const currentType = merchTypes.find(t => t.id === selectedType);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setPreview(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">🎨 周边设计</h1>
        <p className="text-center text-gray-600 mb-6">导出高清素材</p>

        {/* Merch Type Selection */}
        <div className="pixel-card p-4 mb-6 bg-white">
          <h3 className="font-bold mb-3">选择周边类型</h3>
          <div className="grid grid-cols-3 gap-2">
            {merchTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  setSelectedSize(type.sizes[0]);
                }}
                className={`p-3 border-4 border-black text-center transition-all ${
                  selectedType === type.id
                    ? "bg-primary text-white shadow-pixel"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <span className="text-2xl block mb-1">{type.icon}</span>
                <span className="text-xs font-bold">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        {currentType && (
          <div className="pixel-card p-4 mb-6 bg-white">
            <h3 className="font-bold mb-3">选择尺寸</h3>
            <div className="flex gap-2 flex-wrap">
              {currentType.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border-4 border-black font-bold transition-all ${
                    selectedSize === size
                      ? "bg-secondary text-white shadow-pixel"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* OC Selection */}
        <div className="pixel-card p-4 mb-6 bg-white">
          <h3 className="font-bold mb-3">选择角色</h3>
          <div className="flex gap-3">
            {["🧙‍♂️", "🥷", "🧝‍♀️"].map((avatar, i) => (
              <button
                key={i}
                className="flex-1 aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 border-4 border-black flex items-center justify-center text-4xl hover:shadow-pixel transition-all"
              >
                {avatar}
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
          {generating ? "生成中..." : "✨ 生成周边设计"}
        </Button>

        {/* Preview */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pixel-card p-4 bg-white"
          >
            <h3 className="font-bold mb-3">预览</h3>
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 border-4 border-black flex items-center justify-center mb-4 relative">
              <span className="text-6xl">🧙‍♂️</span>
              <div className="absolute bottom-2 right-2 bg-white px-2 py-1 border-2 border-black text-xs">
                {currentType?.icon} {selectedSize}
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">📥 下载PNG</Button>
              <Button variant="outline" className="flex-1">📥 下载SVG</Button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">
              分辨率: 300DPI · 印刷级品质
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
