import { Link, useLocation } from "react-router-dom";
import { Home, Radar, Sparkles, Users, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", label: "首頁", Icon: Home },
  { path: "/radar", label: "雷達", Icon: Radar },
  { path: "/create", label: "創作", Icon: Sparkles },
  { path: "/community", label: "社區", Icon: Users },
  { path: "/profile", label: "我的", Icon: User },
];

export default function Tabbar() {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Hide tabbar on certain pages
  const hiddenPaths = ["/chat/", "/character/", "/login"];
  const shouldHide = hiddenPaths.some(p => pathname.startsWith(p));
  
  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Modern glass-morphism container */}
      <div className="mx-4 mb-4 glass rounded-2xl shadow-lg border border-white/20">
        <div className="flex justify-around items-center py-2 px-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path || 
              (tab.path !== "/" && pathname.startsWith(tab.path));
            
            return (
              <Link 
                key={tab.path} 
                to={tab.path}
                className="relative flex flex-col items-center px-4 py-2 min-w-[60px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative z-10"
                >
                  <tab.Icon 
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-gray-400"
                    }`} 
                  />
                </motion.div>
                <span 
                  className={`text-xs mt-1 font-medium relative z-10 transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
