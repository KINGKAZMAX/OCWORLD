import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Map, MessageCircle, Share2, ArrowRight, Zap, Users, Palette, Compass, Stars } from "lucide-react";

// Modern minimal illustration
function HeroIllustration() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Background circles */}
        <motion.circle 
          cx="100" cy="100" r="80" 
          fill="none" 
          stroke="#e8e6e3" 
          strokeWidth="1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.circle 
          cx="100" cy="100" r="60" 
          fill="none" 
          stroke="#d4d1cc" 
          strokeWidth="1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        
        {/* Central abstract shape */}
        <motion.path
          d="M100 40 L140 80 L140 120 L100 160 L60 120 L60 80 Z"
          fill="#3d4852"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
        
        {/* Inner detail */}
        <motion.circle 
          cx="100" cy="100" r="25" 
          fill="#5a9e9e"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        />
        
        {/* Accent dots */}
        <motion.circle cx="100" cy="100" r="8" fill="#d4a64a"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        />
      </svg>
      
      {/* Floating elements */}
      <motion.div 
        className="absolute top-4 right-4 w-3 h-3 rounded-full bg-accent/60"
        animate={{ y: [-5, 5, -5], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-8 left-8 w-2 h-2 rounded-full bg-secondary/60"
        animate={{ y: [5, -5, 5], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
    </div>
  );
}

// Floating ambient elements
function AmbientElement({ color, size, delay, x, y }: { color: string; size: number; delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute rounded-full blur-sm"
      style={{ left: x, top: y, width: size, height: size, backgroundColor: color }}
      animate={{ y: [0, -8, 0], opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 4, repeat: Infinity, delay }}
    />
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 pb-24 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AmbientElement color="#d4a64a" size={12} delay={0} x="8%" y="15%" />
        <AmbientElement color="#5a9e9e" size={16} delay={0.5} x="88%" y="20%" />
        <AmbientElement color="#3d4852" size={10} delay={1} x="12%" y="55%" />
        <AmbientElement color="#d4a64a" size={8} delay={1.5} x="82%" y="45%" />
        <AmbientElement color="#5a9e9e" size={14} delay={2} x="45%" y="8%" />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 max-w-4xl mx-auto text-center mt-8 md:mt-12"
      >
        {/* Logo & Title */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-3 gradient-text tracking-tight">
            OC WORLD
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium">
            AI 原創角色創作平台
          </p>
        </motion.div>
        
        {/* Hero Illustration */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <HeroIllustration />
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="flex justify-center gap-12 mb-10 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">1000+</div>
            <div className="text-sm text-gray-500">創作者</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-secondary">5000+</div>
            <div className="text-sm text-gray-500">OC 角色</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent">9</div>
            <div className="text-sm text-gray-500">風格選擇</div>
          </div>
        </motion.div>
        
        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/create">
            <Button size="lg" className="text-lg h-14 w-56 rounded-xl gap-2 group bg-primary hover:bg-primary/90">
              開始創建
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/community">
            <Button size="lg" variant="outline" className="text-lg h-14 w-56 rounded-xl gap-2 border-2 hover:bg-gray-50">
              <Users className="w-5 h-5" />
              探索社區
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-16 max-w-2xl w-full px-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <Link to={feature.link}>
              <div className="pixel-card p-6 text-left hover:-translate-y-2 bg-white group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: feature.color }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">{feature.title}</h3>
                    <p className="text-gray-500 text-sm">{feature.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom tagline */}
      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Sparkles className="w-4 h-4" />
          <span>由 AI 驅動 · 即時生成</span>
        </div>
      </motion.div>
    </div>
  );
}

const features = [
  { icon: Palette, title: "AI 角色生成", desc: "9 種風格，一鍵生成你的專屬 OC", color: "#3d4852", link: "/create" },
  { icon: Map, title: "LBS 雷達", desc: "發現附近的 OC，實時位置匹配", color: "#5a9e9e", link: "/radar" },
  { icon: MessageCircle, title: "OC 對話", desc: "AI 角色扮演聊天，與角色互動", color: "#d4a64a", link: "/oc-interact" },
  { icon: Users, title: "OC 社交圈", desc: "自動社交、對話，建立關係網", color: "#e57373", link: "/oc-social" },
  { icon: Share2, title: "社區分享", desc: "展示作品，獲得點贊和收藏", color: "#6b7280", link: "/community" },
];
