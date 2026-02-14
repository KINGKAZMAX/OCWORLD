import { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Radar from "./pages/Radar";
import Chat from "./pages/Chat";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import AvatarGenerator from "./pages/AvatarGenerator";
import SocialCard from "./pages/SocialCard";
import EmojiCreator from "./pages/EmojiCreator";
import MerchDesign from "./pages/MerchDesign";
import Market from "./pages/Market";
import WorldBuilding from "./pages/WorldBuilding";
import Icebreaker from "./pages/Icebreaker";
import OCInteraction from "./pages/OCInteraction";
import OCSocial from "./pages/OCSocial";
import Login from "./pages/Login";
import DeFiDashboard from "./pages/DeFiDashboard";
import DeFiStaking from "./pages/DeFiStaking";
import DeFiPools from "./pages/DeFiPools";
import DeFiGovernance from "./pages/DeFiGovernance";
import { useAuthStore } from "./store/authStore";
import { client } from "./lib/api";

// Placeholder for character detail
const Character = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="pixel-card p-8 bg-white text-center">
      <span className="text-6xl block mb-4">🧙‍♂️</span>
      <h2 className="text-2xl font-bold">角色详情</h2>
      <p className="text-gray-600">开发中...</p>
    </div>
  </div>
);

// Protected route wrapper - requires login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isChecking } = useAuthStore();
  
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-8 border-black border-t-primary animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { user, isChecking, setUser, setChecking } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    // Skip network request if user exists locally
    if (useAuthStore.getState().user) {
      setChecking(false);
      return;
    }
    try {
      const session = await client.auth.getSession();
      if (session.data?.user) {
        setUser({
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name || '',
        });
      }
    } finally {
      setChecking(false);
    }
  }

  // Show loading during initial auth check
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-8 border-black border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public route: Login */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/*" 
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/create" 
                  element={
                    <ProtectedRoute>
                      <Create />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/character/:id" element={<Character />} />
                <Route path="/radar" element={<Radar />} />
                <Route path="/chat/:ocId" element={<Chat />} />
                <Route path="/community" element={<Community />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/avatar" element={<AvatarGenerator />} />
                <Route path="/card" element={<SocialCard />} />
                <Route path="/emoji" element={<EmojiCreator />} />
                <Route path="/merch" element={<MerchDesign />} />
                <Route path="/market" element={<Market />} />
                <Route path="/world" element={<WorldBuilding />} />
                <Route path="/icebreaker" element={<Icebreaker />} />
                <Route path="/oc-interact" element={
                  <ProtectedRoute>
                    <OCInteraction />
                  </ProtectedRoute>
                } />
                <Route path="/oc-social" element={
                  <ProtectedRoute>
                    <OCSocial />
                  </ProtectedRoute>
                } />
                <Route path="/defi" element={
                  <ProtectedRoute>
                    <DeFiDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/defi/stake" element={
                  <ProtectedRoute>
                    <DeFiStaking />
                  </ProtectedRoute>
                } />
                <Route path="/defi/pools" element={
                  <ProtectedRoute>
                    <DeFiPools />
                  </ProtectedRoute>
                } />
                <Route path="/defi/governance" element={
                  <ProtectedRoute>
                    <DeFiGovernance />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          } 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
