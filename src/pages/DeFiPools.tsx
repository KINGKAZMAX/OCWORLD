import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useDeFiStore, type PoolId } from '@/store/defiStore';
import { ChevronLeft, Droplets, Plus, Minus, TrendingUp, Info } from 'lucide-react';

export default function DeFiPools() {
  const { pools, lpPositions, balance, addLiquidity, removeLiquidity } = useDeFiStore();
  const [activePool, setActivePool] = useState<PoolId | null>(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [showToast, setShowToast] = useState('');

  const totalTVL = pools.reduce((sum, p) => sum + p.tvl, 0);
  const myTotalLP = lpPositions.reduce((sum, lp) => sum + lp.depositedOC + lp.pendingFees, 0);

  const handleAction = () => {
    if (!activePool) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    if (mode === 'add') {
      const ok = addLiquidity(activePool, val);
      if (ok) {
        setShowToast(`✅ 已注入 ${val} $OC 到 ${pools.find(p => p.poolId === activePool)?.name}`);
        setAmount('');
        setActivePool(null);
      } else {
        setShowToast('❌ 余额不足');
      }
    } else {
      const lp = lpPositions.find(l => l.poolId === activePool);
      if (!lp) return;
      const sharesToRemove = (val / lp.depositedOC) * lp.shares;
      const ok = removeLiquidity(activePool, sharesToRemove);
      if (ok) {
        setShowToast(`✅ 已移除流动性`);
        setAmount('');
        setActivePool(null);
      }
    }
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
            <Droplets className="w-5 h-5" /> 流动性池
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
        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-card p-5 bg-gradient-to-br from-blue-50 to-cyan-50"
        >
          <div className="grid grid-cols-3 text-center gap-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalTVL.toFixed(0)}</p>
              <p className="text-xs text-gray-500">总 TVL ($OC)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-600">{pools.length}</p>
              <p className="text-xs text-gray-500">活跃池</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-600">{myTotalLP.toFixed(2)}</p>
              <p className="text-xs text-gray-500">我的 LP</p>
            </div>
          </div>
        </motion.div>

        {/* Pool Cards */}
        <div className="space-y-3">
          {pools.map((pool, idx) => {
            const myLP = lpPositions.find(lp => lp.poolId === pool.poolId);
            return (
              <motion.div
                key={pool.poolId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="pixel-card p-5 bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pool.icon}</span>
                    <div>
                      <p className="font-bold">{pool.name}</p>
                      <p className="text-xs text-gray-500">$OC / {pool.poolId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{pool.feeApr}% APR</p>
                    <p className="text-xs text-gray-400">手续费年化</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-gray-500 text-xs">TVL</p>
                    <p className="font-bold">{pool.tvl.toFixed(0)} $OC</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-gray-500 text-xs">24h 互动量</p>
                    <p className="font-bold">{pool.volume24h.toFixed(0)}</p>
                  </div>
                </div>

                {myLP && (
                  <div className="bg-teal-50 rounded-lg p-2 mb-3 text-xs flex justify-between">
                    <span className="text-teal-700">我的 LP: {myLP.depositedOC.toFixed(2)} $OC</span>
                    <span className="text-teal-600 font-bold">+{myLP.pendingFees.toFixed(4)} 手续费</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => { setActivePool(pool.poolId); setMode('add'); setAmount(''); }}
                  >
                    <Plus className="w-3 h-3" /> 注入
                  </Button>
                  {myLP && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => { setActivePool(pool.poolId); setMode('remove'); setAmount(''); }}
                    >
                      <Minus className="w-3 h-3" /> 移除
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pixel-card p-5 bg-gray-50 border border-dashed border-gray-300"
        >
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" /> 流动性池说明
          </h3>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>• 社交互动（点赞/收藏/对话/世界观）产生的流量注入对应池</li>
            <li>• 为池子提供 $OC 流动性，赚取交互手续费分成</li>
            <li>• 池子互动量越大，手续费 APR 越高</li>
            <li>• 可随时移除流动性，取回本金 + 手续费</li>
          </ul>
        </motion.div>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {activePool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setActivePool(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-1">
                {mode === 'add' ? '注入流动性' : '移除流动性'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {pools.find(p => p.poolId === activePool)?.name} · {activePool}
              </p>

              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-1 block">
                  {mode === 'add' ? `数量 (可用: ${balance.toFixed(2)} $OC)` : `数量 ($OC)`}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="输入数量"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-lg"
                />
                {mode === 'add' && (
                  <div className="flex gap-2 mt-2">
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => setAmount((balance * pct / 100).toFixed(2))}
                        className="px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" onClick={handleAction}>
                  确认
                </Button>
                <Button variant="outline" onClick={() => setActivePool(null)}>
                  取消
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
