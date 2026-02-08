import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface World {
  id: string;
  name: string;
  icon: string;
  description: string;
  members: number;
  ocs: number;
}

const mockWorlds: World[] = [
  { id: "1", name: "校园", icon: "🏫", description: "青春校园故事，友情与成长", members: 1234, ocs: 456 },
  { id: "2", name: "异世界", icon: "🏰", description: "魔法与冒险的奇幻世界", members: 2345, ocs: 789 },
  { id: "3", name: "赛博都市", icon: "🌃", description: "霓虹灯下的科幻未来", members: 1567, ocs: 345 },
  { id: "4", name: "古风江湖", icon: "🗻", description: "武侠仙侠的东方世界", members: 890, ocs: 234 },
];

export default function WorldBuilding() {
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
        <h1 className="text-3xl font-bold text-center mb-2">🏰 世界观构建</h1>
        <p className="text-center opacity-90">邀请好友共建宇宙</p>
      </div>

      {/* World Grid */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">热门世界</h2>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            ➕ 创建世界
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {mockWorlds.map((world, index) => (
            <motion.button
              key={world.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedWorld(world)}
              className="pixel-card p-4 text-left bg-white hover:-translate-y-1 transition-all"
            >
              <div className="text-4xl mb-2">{world.icon}</div>
              <h3 className="font-bold text-lg mb-1">{world.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{world.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>👥 {world.members}</span>
                <span>🎭 {world.ocs} OC</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* My Worlds */}
      <div className="p-4 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">我参与的世界</h2>
        <div className="pixel-card p-6 bg-white text-center">
          <span className="text-4xl block mb-3">🌟</span>
          <p className="text-gray-600 mb-4">还没有加入任何世界</p>
          <Button>探索更多世界</Button>
        </div>
      </div>

      {/* World Detail Modal */}
      {selectedWorld && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedWorld(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="pixel-card p-6 max-w-md w-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedWorld.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{selectedWorld.name}</h2>
              <p className="text-gray-600 mb-4">{selectedWorld.description}</p>
              
              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="font-bold text-xl">{selectedWorld.members}</p>
                  <p className="text-xs text-gray-500">成员</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-xl">{selectedWorld.ocs}</p>
                  <p className="text-xs text-gray-500">OC角色</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1">🚀 加入世界</Button>
                <Button variant="outline" onClick={() => setSelectedWorld(null)}>
                  关闭
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Create World Modal */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreate(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="pixel-card p-6 max-w-md w-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">✨ 创建新世界</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">世界名称</label>
                <input
                  type="text"
                  placeholder="例如：星际旅行"
                  className="w-full px-4 py-2 border-4 border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">世界描述</label>
                <textarea
                  placeholder="描述你的世界观设定..."
                  className="w-full px-4 py-2 border-4 border-black resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">选择图标</label>
                <div className="flex gap-2 flex-wrap">
                  {["🏫", "🏰", "🌃", "🗻", "🚀", "🌊", "🌸", "⚡"].map((icon) => (
                    <button
                      key={icon}
                      className="w-12 h-12 border-4 border-black text-2xl hover:bg-gray-100"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button className="flex-1">创建世界</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                取消
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
