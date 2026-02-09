import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { client } from "@/lib/api";
import { LogOut, Settings } from "lucide-react";

interface Character {
  id: number;
  name: string;
  image: string;
  styleId: string;
  likes: number;
}

const features = [
  { icon: "🎮", title: "游戏头像", desc: "生成游戏风格头像", path: "/avatar" },
  { icon: "📇", title: "社交名片", desc: "扫码加好友", path: "/card" },
  { icon: "😀", title: "表情包", desc: "一键生成8种表情", path: "/emoji" },
  { icon: "🎨", title: "周边设计", desc: "导出高清素材", path: "/merch" },
  { icon: "🏰", title: "世界观", desc: "构建你的宇宙", path: "/world" },
  { icon: "💰", title: "创作者市场", desc: "上传素材赚分成", path: "/market" },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"ocs" | "liked" | "collected">("ocs");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, reset } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacters = async () => {
      if (activeTab === "ocs") {
        setIsLoading(true);
        try {
          const res = await client.api.fetch("/api/characters/my");
          const data = await res.json();
          if (data.characters) {
            setCharacters(data.characters);
          }
        } catch (error) {
          console.error("Failed to fetch characters:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchCharacters();
    }
  }, [activeTab, user]);

  const handleLogout = async () => {
    await client.auth.signOut();
    reset();
    navigate('/login');
  };

  const profileUser = {
    name: user?.name || "OC创作者",
    avatar: "👤",
    username: user?.email ? `@${user.email.split('@')[0]}` : "@OCWorld_User",
    followers: 1234,
    following: 567,
    likes: 8901,
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-gray-50 to-white">
      {/* Header Banner */}
      <div className="h-36 bg-gradient-to-br from-gray-800 to-gray-600 relative rounded-b-3xl">
        <div className="absolute inset-0 opacity-10">
          {/* Subtle pattern overlay */}
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }} />
        </div>
        {/* Settings & Logout buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-red-500/30 transition-colors"
            title="登出"
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="pixel-card p-6 bg-white">
          <div className="flex items-end gap-4 mb-4">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-black flex items-center justify-center text-5xl -mt-12">
              {profileUser.avatar}
            </div>
            
            {/* Stats */}
            <div className="flex-1 flex justify-around text-center">
              <div>
                <p className="font-bold text-xl">{profileUser.followers}</p>
                <p className="text-xs text-gray-600">粉丝</p>
              </div>
              <div>
                <p className="font-bold text-xl">{profileUser.following}</p>
                <p className="text-xs text-gray-600">关注</p>
              </div>
              <div>
                <p className="font-bold text-xl">{profileUser.likes}</p>
                <p className="text-xs text-gray-600">获赞</p>
              </div>
            </div>
          </div>

          <h2 className="font-bold text-2xl mb-1">{profileUser.name}</h2>
          <p className="text-gray-600 mb-4">{profileUser.username}</p>

          <div className="flex gap-2">
            <Button className="flex-1">编辑资料</Button>
            <Button variant="outline" className="flex-1">分享名片</Button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="px-4 mt-6">
        <h3 className="font-bold text-lg mb-3">创作工具</h3>
        <div className="grid grid-cols-3 gap-3">
          {features.map((feature) => (
            <Link key={feature.path} to={feature.path}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pixel-card p-3 text-center bg-white"
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <p className="font-bold text-sm">{feature.title}</p>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* OC Tabs */}
      <div className="px-4 mt-6">
        <div className="flex gap-2 mb-4">
          {[
            { key: "ocs", label: "我的OC" },
            { key: "liked", label: "喜欢" },
            { key: "collected", label: "收藏" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 border-4 border-black font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-pixel"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OC Grid */}
        <div className="grid grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-2 py-10 text-center text-gray-500">
              加载中...
            </div>
          ) : (
            <>
              {characters.map((oc, index) => (
                <motion.div
                  key={oc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="pixel-card overflow-hidden"
                >
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-6xl overflow-hidden">
                    {oc.image.startsWith("http") ? (
                      <img
                        src={oc.image}
                        alt={oc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      oc.image
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold mb-1 truncate">{oc.name}</h4>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="capitalize">{oc.styleId}</span>
                      <span>❤️ {oc.likes || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}

          {/* Create New OC Card */}
          <Link to="/create">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="pixel-card aspect-square flex flex-col items-center justify-center bg-gray-50 border-dashed"
            >
              <span className="text-4xl mb-2">➕</span>
              <span className="font-bold">创建新OC</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
