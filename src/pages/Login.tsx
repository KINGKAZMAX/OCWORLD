import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

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
  const { setUser } = useAuthStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    const initGoogle = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current!, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signin_with',
        shape: 'rectangular',
      });
      setSdkLoaded(true);
    };

    // GIS SDK might not be loaded yet
    if (window.google) {
      initGoogle();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        } else if (attempts > 50) {
          // 5 seconds timeout
          clearInterval(interval);
          setError('Google 登入服務載入失敗，請檢查網路連線後重新整理頁面');
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [googleClientId]);

  const handleGoogleCallback = async (response: { credential: string }) => {
    setIsLoggingIn(true);
    setError(null);

    try {
      console.log('[Login] Google callback received, sending to backend...');
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      });

      const data = await res.json();
      console.log('[Login] Backend response:', res.status, data);

      if (!res.ok) {
        setError(data.error || '登入失敗 (' + res.status + ')');
        setIsLoggingIn(false);
        return;
      }

      if (!data.user || !data.user.id) {
        setError('登入回應格式錯誤');
        setIsLoggingIn(false);
        return;
      }

      setUser(data.user);
    } catch (err: any) {
      console.error('[Login] Error:', err);
      setError('網路錯誤: ' + (err.message || '請稍後再試'));
      setIsLoggingIn(false);
    }
  };

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

      {/* Google Login */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-[420px] min-w-[320px] z-10"
      >
        <div className="pixel-card p-8 bg-white text-center">
          <h2 className="font-bold text-xl mb-2">歡迎來到 OC World</h2>
          <p className="text-gray-500 text-sm mb-6">使用 Google 帳號登入</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          {isLoggingIn ? (
            <div className="py-3 text-gray-500">登入中...</div>
          ) : googleClientId ? (
            <div className="flex flex-col items-center gap-2">
              <div ref={googleButtonRef} />
              {!sdkLoaded && !error && (
                <p className="text-gray-400 text-xs">載入 Google 登入...</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              Google Client ID 未配置，請在 .env.local 中設定 VITE_GOOGLE_CLIENT_ID
            </p>
          )}
        </div>
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
