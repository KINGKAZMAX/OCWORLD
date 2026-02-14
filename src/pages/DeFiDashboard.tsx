import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useDeFiStore } from '@/store/defiStore';
import { RARITY_COLORS } from '@/lib/defi/math';
import { truncateHash } from '@/lib/defi/mockChain';
import {
  ChevronLeft, Coins, TrendingUp, Lock, Droplets,
  Vote, ArrowRight, Sparkles, RefreshCw
} from 'lucide-react';

// Mini sparkline SVG component
function Sparkline({ data, color = '#5a9e9e', width = 120, height = 40 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DeFiDashboard() {
  const {
    balance, totalEarned, priceHistory, nfts,
    stakingPositions, pools, lpPositions, refreshStaking
  } = useDeFiStore();
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh staking rewards
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStaking();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshStaking]);

  const totalPendingRewards = useMemo(() =>
    stakingPositions.reduce((sum, s) => sum + s.pendingReward, 0),
    [stakingPositions]
  );

  const totalLPValue = useMemo(() =>
    lpPositions.reduce((sum, lp) => sum + lp.depositedOC + lp.pendingFees, 0),
    [lpPositions]
  );

  const currentPrice = priceHistory[priceHistory.length - 1] || 1.0;
  const prevPrice = priceHistory[priceHistory.length - 2] || 1.0;
  const priceChange = ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2);
  const priceUp = currentPrice >= prevPrice;

  const totalAssetValue = (balance + totalPendingRewards + totalLPValue) * currentPrice;

  const handleRefresh = () => {
    setRefreshing(true);
    refreshStaking();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="glass border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="p-2 rounded-full hover:bg-white/50 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> DeFi 宇宙
          </h1>
          <button onClick={handleRefresh} className="p-2 rounded-full hover:bg-white/50 transition-colors">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-5">
        {/* Portfolio Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-card p-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
          <p className="text-sm text-gray-400 mb-1">总资产估值</p>
          <p className="text-3xl font-bold mb-1">{totalAssetValue.toFixed(2)} <span className="text-lg text-amber-400">$OC</span></p>
          <div className="flex items-center gap-4 text-sm text-gray-400 mt-3">
            <span>可用: {balance.toFixed(2)}</span>
            <span>·</span>
            <span>质押收益: +{totalPendingRewards.toFixed(4)}</span>
            <span>·</span>
            <span>LP: {totalLPValue.toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Token Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pixel-card p-5 bg-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold">$OC 代币</p>
                <p className="text-sm text-gray-500">OC World Token</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">${currentPrice.toFixed(4)}</p>
              <p className={`text-sm ${priceUp ? 'text-green-500' : 'text-red-500'}`}>
                {priceUp ? '↑' : '↓'} {priceChange}%
              </p>
            </div>
          </div>
          <Sparkline data={priceHistory} color={priceUp ? '#22c55e' : '#ef4444'} width={320} height={50} />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="pixel-card p-4 bg-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-sm text-gray-500">总收益</span>
            </div>
            <p className="text-xl font-bold text-teal-600">+{totalEarned.toFixed(2)}</p>
            <p className="text-xs text-gray-400">$OC</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pixel-card p-4 bg-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">质押中</span>
            </div>
            <p className="text-xl font-bold text-purple-600">{stakingPositions.length}</p>
            <p className="text-xs text-gray-400">OC-NFT</p>
          </motion.div>
        </div>

        {/* My NFTs Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="pixel-card p-5 bg-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              🖼️ 我的 OC-NFT
            </h3>
            <span className="text-sm text-gray-400">{nfts.length} 个</span>
          </div>
          {nfts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">🎨</p>
              <p className="text-sm">还没有 OC-NFT</p>
              <Link to="/create">
                <Button size="sm" className="mt-3">去创建角色</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {nfts.slice(0, 6).map((nft, idx) => (
                <motion.div
                  key={nft.tokenId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden border-2 transition-all"
                    style={{ borderColor: RARITY_COLORS[nft.rarity] }}
                  >
                    {(nft.image?.startsWith('http') || nft.image?.startsWith('/')) ? (
                      <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl">
                        🎭
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium mt-1 truncate">{nft.name}</p>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: RARITY_COLORS[nft.rarity] + '20', color: RARITY_COLORS[nft.rarity] }}
                  >
                    {nft.rarity}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="font-bold text-gray-700 px-1">快捷操作</h3>
          {[
            { icon: Lock, label: '质押挖矿', desc: '质押 OC-NFT 赚取 $OC', path: '/defi/stake', color: 'bg-purple-500' },
            { icon: Droplets, label: '流动性池', desc: '为社交池提供流动性', path: '/defi/pools', color: 'bg-blue-500' },
            { icon: Vote, label: '治理投票', desc: 'DAO 社区提案投票', path: '/defi/governance', color: 'bg-green-500' },
          ].map((item, idx) => (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="pixel-card p-4 bg-white flex items-center gap-4 group cursor-pointer"
              >
                <div className={`w-11 h-11 ${item.color} rounded-xl flex items-center justify-center`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* On-chain Info (Simulated) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="pixel-card p-5 bg-gray-50 border border-dashed border-gray-300"
        >
          <p className="text-xs text-gray-400 mb-3 font-mono">⛓️ 链上信息（模拟）</p>
          <div className="space-y-2 text-xs font-mono text-gray-500">
            <div className="flex justify-between">
              <span>网络</span>
              <span className="text-gray-700">OC-Chain (模拟)</span>
            </div>
            <div className="flex justify-between">
              <span>NFT 合约</span>
              <span className="text-gray-700">{truncateHash(nfts[0]?.contract || '0x0000...0000')}</span>
            </div>
            <div className="flex justify-between">
              <span>持有 NFT</span>
              <span className="text-gray-700">{nfts.length} 个</span>
            </div>
            <div className="flex justify-between">
              <span>累计交易</span>
              <span className="text-gray-700">{nfts.length + stakingPositions.length + lpPositions.length} 笔</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
