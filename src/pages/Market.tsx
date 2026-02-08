import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Asset {
  id: string;
  name: string;
  creator: string;
  avatar: string;
  price: number;
  sales: number;
  preview: string;
  category: string;
}

const mockAssets: Asset[] = [
  { id: "1", name: "幻想系角色立绘包", creator: "幻想画师小明", avatar: "🎨", price: 29.9, sales: 156, preview: "🧝‍♀️", category: "立绘" },
  { id: "2", name: "赛博朋克贴纸素材", creator: "赛博朋克爱好者", avatar: "🤖", price: 19.9, sales: 89, preview: "🥷", category: "贴纸" },
  { id: "3", name: "古风武侠角色套装", creator: "古风绘师月儿", avatar: "🌙", price: 39.9, sales: 234, preview: "⚔️", category: "立绘" },
  { id: "4", name: "Q版表情包模板", creator: "像素艺术家", avatar: "🕹️", price: 9.9, sales: 567, preview: "😊", category: "表情" },
];

const categories = ["全部", "立绘", "贴纸", "表情", "背景", "特效"];

export default function Market() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = mockAssets.filter(asset => 
    (activeCategory === "全部" || asset.category === activeCategory) &&
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
        <h1 className="text-3xl font-bold text-center mb-2">💰 创作者市场</h1>
        <p className="text-center opacity-90 mb-4">画师上传素材赚分成</p>
        
        {/* Search */}
        <div className="max-w-lg mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索素材..."
            className="w-full px-4 py-3 border-4 border-black text-black"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-0 bg-white border-b-4 border-black z-40 p-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 border-4 border-black font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-pixel"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Upload CTA */}
      <div className="p-4">
        <div className="pixel-card p-4 bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold">成为创作者</h3>
            <p className="text-sm text-gray-600">上传素材，获得70%分成</p>
          </div>
          <Button>📤 上传素材</Button>
        </div>
      </div>

      {/* Asset List */}
      <div className="p-4 grid grid-cols-2 gap-4 max-w-4xl mx-auto">
        {filteredAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="pixel-card overflow-hidden bg-white"
          >
            {/* Preview */}
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-6xl relative">
              {asset.preview}
              <span className="absolute top-2 right-2 bg-white px-2 py-0.5 border-2 border-black text-xs font-bold">
                {asset.category}
              </span>
            </div>
            
            {/* Info */}
            <div className="p-3">
              <h3 className="font-bold text-sm mb-2 line-clamp-1">{asset.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{asset.avatar}</span>
                <span className="text-xs text-gray-600">{asset.creator}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary">¥{asset.price}</span>
                <span className="text-xs text-gray-500">{asset.sales} 销量</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Banner */}
      <div className="p-4">
        <div className="pixel-card p-4 bg-white">
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="font-bold text-2xl text-primary">1,234</p>
              <p className="text-xs text-gray-600">创作者</p>
            </div>
            <div>
              <p className="font-bold text-2xl text-secondary">5,678</p>
              <p className="text-xs text-gray-600">素材数</p>
            </div>
            <div>
              <p className="font-bold text-2xl text-green-500">¥89K</p>
              <p className="text-xs text-gray-600">本月交易</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
