import { useRef, useEffect, useState } from 'react';
import { client } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';

// Pixel Art Character Avatar Silhouette Logo
function PixelAvatarLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Main avatar silhouette - pixel art style */}
      <svg 
        viewBox="0 0 32 32" 
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Hair - top */}
        <rect x="8" y="2" width="16" height="2" fill="currentColor" />
        <rect x="6" y="4" width="20" height="2" fill="currentColor" />
        <rect x="6" y="6" width="20" height="2" fill="currentColor" />
        
        {/* Hair - sides */}
        <rect x="4" y="8" width="4" height="8" fill="currentColor" />
        <rect x="24" y="8" width="4" height="8" fill="currentColor" />
        
        {/* Face area */}
        <rect x="8" y="8" width="16" height="12" fill="currentColor" />
        
        {/* Eyes - subtle glow */}
        <rect x="10" y="12" width="4" height="2" fill="white" opacity="0.3" />
        <rect x="18" y="12" width="4" height="2" fill="white" opacity="0.3" />
        
        {/* Neck */}
        <rect x="12" y="20" width="8" height="4" fill="currentColor" />
        
        {/* Shoulders */}
        <rect x="4" y="24" width="24" height="2" fill="currentColor" />
        <rect x="2" y="26" width="28" height="4" fill="currentColor" />
        <rect x="4" y="30" width="24" height="2" fill="currentColor" />
      </svg>
      
      {/* Sparkle decorations around the logo */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#FF99C8]" />
      <div className="absolute -top-2 right-1 w-2 h-2 bg-[#5DE2E7]" />
      <div className="absolute top-4 -right-2 w-1.5 h-1.5 bg-[#FFA62B]" />
      <div className="absolute -bottom-1 -left-2 w-1.5 h-1.5 bg-[#9D4EDD]" />
    </div>
  );
}

export default function Login() {
  const containerRef = useRef<HTMLDivElement>(null);
  const authRenderedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const { setUser } = useAuthStore();

  // Double-check session (prevent race conditions)
  useEffect(() => {
    client.auth.getSession().then(session => {
      if (session.data?.user) {
        setUser({
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name || '',
        });
      } else {
        setIsReady(true);
      }
    });
  }, [setUser]);

  // Render managed login UI (execute only once)
  useEffect(() => {
    if (!isReady || authRenderedRef.current || !containerRef.current) return;
    authRenderedRef.current = true;

    client.auth.renderAuthUI(containerRef.current, {
      redirectTo: '/create',
      onLogin: (user) => {
        setUser({ id: user.id, email: user.email, name: user.name || '' });
      },
      labels: {
        signIn: {
          title: '歡迎回來',
          subtitle: '登錄以創建你的專屬角色',
          loginButton: '登錄',
          emailPlaceholder: '輸入郵箱',
          passwordPlaceholder: '輸入密碼',
          forgotPassword: '忘記密碼?',
          signUpPrompt: '還沒有帳戶?',
          toggleToSignUp: '立即註冊',
        },
        signUp: {
          title: '加入 OC World',
          subtitle: '註冊開始創建你的 OC 角色',
          signUpButton: '註冊',
          toggleToSignIn: '已有帳戶? 登錄',
        },
      },
    });
  }, [isReady, setUser]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-8 border-black border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating ambient elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full blur-sm"
            style={{
              backgroundColor: ['#5a9e9e', '#d4a64a', '#3d4852', '#6b7280'][i % 4],
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              opacity: 0.2,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Logo / Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 z-10"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div 
            className="relative"
            animate={{ 
              y: [0, -4, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-800 to-gray-600 rounded-2xl p-1 shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                <PixelAvatarLogo className="w-12 h-12 md:w-14 md:h-14 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">
          OC WORLD
        </h1>
        <p className="text-gray-500 text-sm">AI 原創角色社區</p>
      </motion.div>

      {/* Auth Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-[420px] min-w-[320px] z-10"
      >
        <div 
          ref={containerRef} 
          className="pixel-auth-container"
        />
      </motion.div>

      {/* Bottom tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center text-sm text-gray-400 z-10"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span>使用 AI 生成你的專屬角色</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        </div>
      </motion.div>
    </div>
  );
}
