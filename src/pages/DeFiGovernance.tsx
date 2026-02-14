import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useDeFiStore } from '@/store/defiStore';
import { ChevronLeft, Vote, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

export default function DeFiGovernance() {
  const { proposals, votes, vote, stakingPositions, nfts, balance } = useDeFiStore();
  const [showToast, setShowToast] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Calculate voting power
  const stakingPower = stakingPositions.reduce((sum, s) => {
    const nft = nfts.find(n => n.ocId === s.ocId);
    return sum + (nft?.power || 0);
  }, 0);
  const votingPower = Math.max(1, Math.floor(stakingPower / 50) + Math.floor(balance / 100));

  const hasVoted = (proposalId: string) => votes.some(v => v.proposalId === proposalId);
  const getMyVote = (proposalId: string) => votes.find(v => v.proposalId === proposalId);

  const handleVote = (proposalId: string, choice: '赞成' | '反对') => {
    const ok = vote(proposalId, choice);
    if (ok) {
      setShowToast(`🗳️ 已投票：${choice}（权重 ${votingPower}）`);
    } else {
      setShowToast('❌ 已经投过票了');
    }
    setTimeout(() => setShowToast(''), 2000);
  };

  const statusConfig = {
    '进行中': { color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock },
    '已通过': { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
    '已否决': { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
  };

  const daysLeft = (endAt: number) => {
    const diff = endAt - Date.now();
    if (diff <= 0) return '已结束';
    const days = Math.ceil(diff / (24 * 3600 * 1000));
    return `${days} 天后截止`;
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
            <Vote className="w-5 h-5" /> 治理投票
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
        {/* My Voting Power */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pixel-card p-5 bg-gradient-to-br from-green-50 to-emerald-50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">我的投票权重</p>
              <p className="text-3xl font-bold text-green-700">{votingPower}</p>
              <p className="text-xs text-gray-400 mt-1">来自质押算力 + $OC 持仓</p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Proposals */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700">社区提案</h3>
          {proposals.map((proposal, idx) => {
            const config = statusConfig[proposal.status];
            const totalVotes = proposal.forVotes + proposal.againstVotes;
            const forPct = totalVotes > 0 ? (proposal.forVotes / totalVotes * 100) : 50;
            const myVote = getMyVote(proposal.id);
            const voted = hasVoted(proposal.id);
            const isExpanded = expandedId === proposal.id;

            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="pixel-card bg-white overflow-hidden"
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-sm flex-1 mr-2">{proposal.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${config.bg} ${config.color}`}>
                      {proposal.status}
                    </span>
                  </div>

                  {/* Vote bar */}
                  <div className="relative h-3 rounded-full bg-gray-100 overflow-hidden mb-2">
                    <motion.div
                      className="absolute left-0 top-0 h-full bg-green-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${forPct}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="text-green-600">赞成 {proposal.forVotes}</span>
                    <span>{daysLeft(proposal.endAt)}</span>
                    <span className="text-red-500">反对 {proposal.againstVotes}</span>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                        <p className="text-sm text-gray-600 mb-4">{proposal.description}</p>

                        {voted ? (
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-sm text-gray-600">
                              ✅ 你已投票：<span className="font-bold">{myVote?.choice}</span>
                              <span className="text-xs text-gray-400 ml-2">（权重 {myVote?.weight}）</span>
                            </p>
                          </div>
                        ) : proposal.status === '进行中' ? (
                          <div className="flex gap-3">
                            <Button
                              className="flex-1 bg-green-500 hover:bg-green-600 gap-1"
                              onClick={(e) => { e.stopPropagation(); handleVote(proposal.id, '赞成'); }}
                            >
                              <CheckCircle className="w-4 h-4" /> 赞成
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 text-red-500 border-red-200 hover:bg-red-50 gap-1"
                              onClick={(e) => { e.stopPropagation(); handleVote(proposal.id, '反对'); }}
                            >
                              <XCircle className="w-4 h-4" /> 反对
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 text-center">投票已结束</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pixel-card p-5 bg-gray-50 border border-dashed border-gray-300"
        >
          <h3 className="font-bold text-sm mb-3">💡 治理说明</h3>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>• 投票权重 = 质押算力 ÷ 50 + $OC 余额 ÷ 100</li>
            <li>• 质押更多高稀有度 OC-NFT 可获得更大投票权</li>
            <li>• 社区提案通过后将影响平台参数和功能</li>
            <li>• 每个提案只能投票一次，不可更改</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
