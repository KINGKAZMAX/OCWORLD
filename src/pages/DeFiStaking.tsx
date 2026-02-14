import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useDeFiStore } from '@/store/defiStore';
import { RARITY_COLORS, RARITY_MULTIPLIER } from '@/lib/defi/math';
import { truncateHash } from '@/lib/defi/mockChain';
import { ChevronLeft, Lock, Unlock, Gift, Sparkles, TrendingUp } from 'lucide-react';

export default function DeFiStaking() {
  const {
    nfts, stakingPositions, totalStakedPower, balance,
    stakeOC, unstakeOC, claimRewards, refreshStaking
  } = useDeFiStore();
  const [selectedOcId, setSelectedOcId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState('');

  useEffect(() => {
    const interval = setInterval(refreshStaking, 3000);
    return () => clearInterval(interval);
  }, [refreshStaking]);

  const stakedIds = new Set(stakingPositions.map(s => s.ocId));
  const availableNFTs = nfts.filter(n => !stakedIds.has(n.ocId));
  const stakedNFTs = nfts.filter(n => stakedIds.has(n.ocId));

  const totalPending = stakingPositions.reduce((sum, s) => sum + s.pendingReward, 0);

  const handleStake = (ocId: number) => {
    const ok = stakeOC(ocId);
    if (ok) {
      setShowToast('✅ 质押成功！');
      setTimeout(() => setShowToast(''), 2000);
    }
  };

  const handleUnstake = (ocId: number) => {
    const ok = unstakeOC(ocId);
    if (ok) {
      setShowToast('🔓 已解除质押');
      setTimeout(() => setShowToast(''), 2000);
    }
  };

  const handleClaimAll = () => {
    const claimed = claimRewards();
    setShowToast(`🎁 领取 ${claimed.toFixed(4)} $OC`);
    setTimeout(() => setShowToast(''), 2000);
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="glass border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/defi" className="p-2 rounded-full hover:bg-white/50 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
            <Lock className="w-5 h-5" /> 质押挖矿
          </h1>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium"
          >
            {showToast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 max-w-2xl mx-auto space-y-5">
        {/* Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-card p-5 bg-gradient-to-br from-purple-50 to-blue-50"
        >
          <div className="grid grid-cols-3 text-center gap-4">
            <div>
              <p className="text-2xl font-bold text-purple-600">{stakedNFTs.length}</p>
              <p className="text-xs text-gray-500">质押中</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-600">{totalStakedPower}</p>
              <p className="text-xs text-gray-500">总算力</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{totalPending.toFixed(4)}</p>
              <p className="text-xs text-gray-500">待领取 $OC</p>
            </div>
          </div>
          {totalPending > 0 && (
            <Button onClick={handleClaimAll} className="w-full mt-4 gap-2">
              <Gift className="w-4 h-4" /> 一键领取所有收益
            </Button>
          )}
        </motion.div>

        {/* Staked Positions */}
        {stakedNFTs.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" /> 质押中的 OC-NFT
            </h3>
            <div className="space-y-3">
              {stakedNFTs.map((nft, idx) => {
                const pos = stakingPositions.find(s => s.ocId === nft.ocId);
                if (!pos) return null;
                return (
                  <motion.div
                    key={nft.tokenId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="pixel-card p-4 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0"
                        style={{ borderColor: RARITY_COLORS[nft.rarity] }}
                      >
                        {(nft.image?.startsWith('http') || nft.image?.startsWith('/')) ? (
                          <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">🎭</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm truncate">{nft.name}</p>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                            style={{ backgroundColor: RARITY_COLORS[nft.rarity] + '20', color: RARITY_COLORS[nft.rarity] }}
                          >
                            {nft.rarity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">算力 {nft.power} · APR {pos.apr}%</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">+{pos.pendingReward.toFixed(4)} $OC</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleUnstake(nft.ocId)} className="flex-shrink-0 gap-1">
                        <Unlock className="w-3 h-3" /> 解押
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available to Stake */}
        <div>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 可质押的 OC-NFT
          </h3>
          {availableNFTs.length === 0 ? (
            <div className="pixel-card p-8 bg-white text-center">
              <p className="text-4xl mb-2">🎨</p>
              <p className="text-sm text-gray-500 mb-3">
                {nfts.length === 0 ? '还没有 OC-NFT，先去创建角色吧' : '所有 NFT 都已质押'}
              </p>
              {nfts.length === 0 && (
                <Link to="/create">
                  <Button size="sm">去创建角色</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {availableNFTs.map((nft, idx) => (
                <motion.div
                  key={nft.tokenId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="pixel-card p-4 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0"
                      style={{ borderColor: RARITY_COLORS[nft.rarity] }}
                    >
                      {(nft.image?.startsWith('http') || nft.image?.startsWith('/')) ? (
                        <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">🎭</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm truncate">{nft.name}</p>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                          style={{ backgroundColor: RARITY_COLORS[nft.rarity] + '20', color: RARITY_COLORS[nft.rarity] }}
                        >
                          {nft.rarity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        算力 {nft.power} · {nft.tokenId} · x{RARITY_MULTIPLIER[nft.rarity]} 倍率
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleStake(nft.ocId)} className="flex-shrink-0 gap-1">
                      <Lock className="w-3 h-3" /> 质押
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pixel-card p-5 bg-gray-50 border border-dashed border-gray-300"
        >
          <h3 className="font-bold text-sm mb-3">💡 质押挖矿说明</h3>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>• 将你的 OC-NFT 质押，即可自动赚取 $OC 代币收益</li>
            <li>• 稀有度越高的 NFT，算力越强，收益越多</li>
            <li>• APR 会根据全网质押量动态调整</li>
            <li>• 可随时解除质押，收益自动结算</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
