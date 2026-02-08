import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Creator {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  tags: string[];
  works: { id: string; image: string; likes: number }[];
}

const mockCreators: Creator[] = [
  {
    id: "1",
    name: "幻想画师小明",
    avatar: "🎨",
    followers: 12500,
    tags: ["#OC交流", "#像素艺术", "#二次元"],
    works: [
      { id: "w1", image: "🧝‍♀️", likes: 342 },
      { id: "w2", image: "🧙‍♂️", likes: 256 },
    ],
  },
  {
    id: "2",
    name: "赛博朋克爱好者",
    avatar: "🤖",
    followers: 8900,
    tags: ["#赛博朋克", "#机械设计"],
    works: [
      { id: "w3", image: "🥷", likes: 521 },
      { id: "w4", image: "🦾", likes: 189 },
    ],
  },
  {
    id: "3",
    name: "古风绘师月儿",
    avatar: "🌙",
    followers: 15600,
    tags: ["#古风", "#仙侠"],
    works: [
      { id: "w5", image: "⚔️", likes: 678 },
      { id: "w6", image: "🏯", likes: 445 },
    ],
  },
];

const feedPosts = [
  { id: "p1", creator: "幻想画师小明", avatar: "🎨", image: "🧝‍♀️", title: "森林精灵", likes: 342, comments: 45, time: "2小时前" },
  { id: "p2", creator: "赛博朋克爱好者", avatar: "🤖", image: "🥷", title: "暗夜忍者", likes: 521, comments: 67, time: "3小时前" },
  { id: "p3", creator: "古风绘师月儿", avatar: "🌙", image: "⚔️", title: "仗剑天涯", likes: 678, comments: 89, time: "5小时前" },
  { id: "p4", creator: "像素艺术家", avatar: "🕹️", image: "👾", title: "复古游戏角色", likes: 234, comments: 23, time: "6小时前" },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState<"feed" | "creators">("feed");
  const [following, setFollowing] = useState<string[]>([]);

  const toggleFollow = (id: string) => {
    setFollowing((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="glass border-b border-gray-200 p-6 sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-center mb-2 gradient-text">社區互動</h1>
        <p className="text-center text-gray-500 text-sm mb-4">發現和你志趣相投的創作者</p>
        
        {/* Tabs */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === "feed"
                ? "bg-primary text-white shadow-md"
                : "bg-white/80 hover:bg-white text-gray-600"
            }`}
          >
            作品流
          </button>
          <button
            onClick={() => setActiveTab("creators")}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === "creators"
                ? "bg-primary text-white shadow-md"
                : "bg-white/80 hover:bg-white text-gray-600"
            }`}
          >
            創作者
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {activeTab === "feed" ? (
          // Feed View - Waterfall Layout
          <div className="grid grid-cols-2 gap-4">
            {feedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="pixel-card overflow-hidden"
              >
                {/* Image */}
                <div className={`aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-5xl ${index % 3 === 0 ? 'aspect-[3/4]' : ''}`}>
                  {post.image}
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold mb-1 text-gray-800">{post.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span>{post.avatar}</span>
                    <span>{post.creator}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>{post.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Creators View
          <div className="space-y-4">
            {mockCreators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="pixel-card p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-black flex items-center justify-center text-3xl">
                    {creator.avatar}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{creator.name}</h3>
                      <Button
                        size="sm"
                        variant={following.includes(creator.id) ? "outline" : "default"}
                        onClick={() => toggleFollow(creator.id)}
                      >
                        {following.includes(creator.id) ? "已关注" : "+ 关注"}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {creator.followers.toLocaleString()} 粉丝
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {creator.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 border-2 border-black text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Works Preview */}
                <div className="flex gap-2 mt-4">
                  {creator.works.map((work) => (
                    <div
                      key={work.id}
                      className="flex-1 aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-black flex items-center justify-center text-3xl relative"
                    >
                      {work.image}
                      <span className="absolute bottom-1 right-1 text-xs bg-white px-1 border border-black">
                        ❤️ {work.likes}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-4 flex flex-col gap-3 z-30">
        <Link
          to="/oc-social"
          className="w-14 h-14 bg-gradient-to-br from-red-400 to-pink-400 rounded-2xl shadow-lg flex items-center justify-center text-2xl hover:scale-105 transition-transform"
          title="OC 社交圈"
        >
          🌐
        </Link>
        <Link
          to="/oc-interact"
          className="w-14 h-14 bg-accent rounded-2xl shadow-lg flex items-center justify-center text-2xl hover:scale-105 transition-transform"
          title="OC 互動"
        >
          💬
        </Link>
        <Link
          to="/create"
          className="w-14 h-14 bg-primary rounded-2xl shadow-lg flex items-center justify-center text-2xl text-white hover:scale-105 transition-transform"
        >
          ✨
        </Link>
      </div>
    </div>
  );
}
