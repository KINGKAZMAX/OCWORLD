import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAddress, mockTxHash, mockBlockNumber, toTokenId, generatePriceHistory, OC_NFT_CONTRACT } from '@/lib/defi/mockChain';
import { determineRarity, calcBasePower, calcStakingAPR, calcPendingReward, calcPoolFeeAPR, eventReward } from '@/lib/defi/math';

// ---------- Types ----------
export type Rarity = '普通' | '稀有' | '史诗' | '传说' | '神话';

export interface OCNFT {
  ocId: number;
  tokenId: string;
  rarity: Rarity;
  power: number;
  image?: string | null;
  name: string;
  contract: string;
  owner: string;
  mintTx: string;
  blockNumber: number;
  mintedAt: number;
  traits: Array<{ trait_type: string; value: string | number }>;
}

export interface StakingPosition {
  ocId: number;
  stakedAt: number;
  apr: number;
  pendingReward: number;
  lastClaimAt: number;
}

export type PoolId = 'LIKE' | 'COLLECT' | 'CHAT' | 'WORLD';
export interface Pool {
  poolId: PoolId;
  name: string;
  icon: string;
  tvl: number;
  volume24h: number;
  feeApr: number;
}

export interface LPPosition {
  poolId: PoolId;
  shares: number;
  depositedOC: number;
  pendingFees: number;
}

export type ProposalStatus = '进行中' | '已通过' | '已否决';
export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: ProposalStatus;
  startAt: number;
  endAt: number;
  forVotes: number;
  againstVotes: number;
}

export interface VoteRecord {
  proposalId: string;
  choice: '赞成' | '反对';
  weight: number;
  votedAt: number;
}

// ---------- Store State ----------
interface DeFiState {
  // Token
  balance: number;
  locked: number;
  totalEarned: number;
  priceHistory: number[];

  // NFTs
  nfts: OCNFT[];

  // Staking
  stakingPositions: StakingPosition[];
  totalStakedPower: number;

  // Pools
  pools: Pool[];
  lpPositions: LPPosition[];

  // Governance
  proposals: Proposal[];
  votes: VoteRecord[];

  // Actions
  mintNFT: (oc: { id: number; name: string; image?: string | null; style?: string; traits?: Array<{ trait_type: string; value: string | number }> }) => OCNFT;
  stakeOC: (ocId: number) => boolean;
  unstakeOC: (ocId: number) => boolean;
  claimRewards: (ocId?: number) => number;
  addLiquidity: (poolId: PoolId, amount: number) => boolean;
  removeLiquidity: (poolId: PoolId, shares: number) => boolean;
  trackEvent: (eventType: string, meta?: Record<string, any>) => void;
  vote: (proposalId: string, choice: '赞成' | '反对') => boolean;
  refreshStaking: () => void;
  reset: () => void;
}

// Default pools
const defaultPools: Pool[] = [
  { poolId: 'LIKE', name: '点赞池', icon: '❤️', tvl: 5000, volume24h: 320, feeApr: 0 },
  { poolId: 'COLLECT', name: '收藏池', icon: '⭐', tvl: 3200, volume24h: 180, feeApr: 0 },
  { poolId: 'CHAT', name: '对话池', icon: '💬', tvl: 4100, volume24h: 250, feeApr: 0 },
  { poolId: 'WORLD', name: '世界池', icon: '🌍', tvl: 2800, volume24h: 120, feeApr: 0 },
];

// Default proposals
const defaultProposals: Proposal[] = [
  {
    id: 'P-001',
    title: '提升质押基础收益率至 15%',
    description: '将质押挖矿的基础年化收益从当前 12% 提升至 15%，以激励更多创作者参与质押。',
    status: '进行中',
    startAt: Date.now() - 3 * 24 * 3600 * 1000,
    endAt: Date.now() + 4 * 24 * 3600 * 1000,
    forVotes: 1250,
    againstVotes: 430,
  },
  {
    id: 'P-002',
    title: '开放"神话"稀有度进化路径',
    description: '允许"传说"级 OC-NFT 通过消耗 500 $OC 和 3 次社交互动后进化为"神话"级。',
    status: '进行中',
    startAt: Date.now() - 1 * 24 * 3600 * 1000,
    endAt: Date.now() + 6 * 24 * 3600 * 1000,
    forVotes: 890,
    againstVotes: 210,
  },
  {
    id: 'P-003',
    title: '新增"冒险"风格 AI 生成',
    description: '在角色创建的风格选择中增加第 10 种风格——"冒险"，融合奇幻与赛博元素。',
    status: '已通过',
    startAt: Date.now() - 10 * 24 * 3600 * 1000,
    endAt: Date.now() - 3 * 24 * 3600 * 1000,
    forVotes: 2100,
    againstVotes: 300,
  },
];

// Default pre-seeded NFTs so DeFi page is not empty
const defaultNFTs: OCNFT[] = [
  {
    ocId: 1,
    tokenId: 'OC-000001',
    rarity: '史诗',
    power: 250,
    image: '/mock/star-mage.png',
    name: '星辰法师',
    contract: OC_NFT_CONTRACT,
    owner: '0x7a3b...f1e2',
    mintTx: '0x1234...abcd',
    blockNumber: 19800101,
    mintedAt: Date.now() - 7 * 24 * 3600 * 1000,
    traits: [
      { trait_type: '风格', value: 'fantasy' },
      { trait_type: '属性', value: '星辰魔法' },
      { trait_type: '创建时间', value: new Date().toLocaleDateString('zh-CN') },
    ],
  },
  {
    ocId: 2,
    tokenId: 'OC-000002',
    rarity: '传说',
    power: 400,
    image: '/mock/cyber-samurai.png',
    name: '赛博武士',
    contract: OC_NFT_CONTRACT,
    owner: '0x7a3b...f1e2',
    mintTx: '0x5678...efgh',
    blockNumber: 19800205,
    mintedAt: Date.now() - 5 * 24 * 3600 * 1000,
    traits: [
      { trait_type: '风格', value: 'cyberpunk' },
      { trait_type: '属性', value: '电磁斩击' },
      { trait_type: '创建时间', value: new Date().toLocaleDateString('zh-CN') },
    ],
  },
  {
    ocId: 3,
    tokenId: 'OC-000003',
    rarity: '稀有',
    power: 150,
    image: '/mock/forest-elf.png',
    name: '森林精灵',
    contract: OC_NFT_CONTRACT,
    owner: '0x7a3b...f1e2',
    mintTx: '0x9abc...ijkl',
    blockNumber: 19800310,
    mintedAt: Date.now() - 3 * 24 * 3600 * 1000,
    traits: [
      { trait_type: '风格', value: 'fantasy' },
      { trait_type: '属性', value: '自然治愈' },
      { trait_type: '创建时间', value: new Date().toLocaleDateString('zh-CN') },
    ],
  },
  {
    ocId: 4,
    tokenId: 'OC-000004',
    rarity: '神话',
    power: 800,
    image: '/mock/mecha-warrior.png',
    name: '机甲战神',
    contract: OC_NFT_CONTRACT,
    owner: '0x7a3b...f1e2',
    mintTx: '0xdefg...mnop',
    blockNumber: 19800415,
    mintedAt: Date.now() - 1 * 24 * 3600 * 1000,
    traits: [
      { trait_type: '风格', value: 'cyberpunk' },
      { trait_type: '属性', value: '终极炮击' },
      { trait_type: '创建时间', value: new Date().toLocaleDateString('zh-CN') },
    ],
  },
];

// Default staking positions for pre-seeded NFTs
const defaultStakingPositions: StakingPosition[] = [
  {
    ocId: 1,
    stakedAt: Date.now() - 5 * 24 * 3600 * 1000,
    apr: 0.18,
    pendingReward: 2.35,
    lastClaimAt: Date.now() - 1 * 24 * 3600 * 1000,
  },
  {
    ocId: 4,
    stakedAt: Date.now() - 1 * 24 * 3600 * 1000,
    apr: 0.42,
    pendingReward: 5.12,
    lastClaimAt: Date.now() - 12 * 3600 * 1000,
  },
];

const initialState = {
  balance: 50, // new users get 50 $OC welcome bonus
  locked: 0,
  totalEarned: 50,
  priceHistory: generatePriceHistory(30, 1.0),
  nfts: defaultNFTs,
  stakingPositions: defaultStakingPositions,
  totalStakedPower: defaultStakingPositions.reduce((sum, _s) => {
    const nft = defaultNFTs.find(n => n.ocId === _s.ocId);
    return sum + (nft?.power || 0);
  }, 0),
  pools: defaultPools.map(p => ({ ...p, feeApr: calcPoolFeeAPR(p.volume24h, p.tvl) })),
  lpPositions: [] as LPPosition[],
  proposals: defaultProposals,
  votes: [] as VoteRecord[],
};

export const useDeFiStore = create<DeFiState>()(
  persist(
    (set, get) => ({
      ...initialState,

      mintNFT: (oc) => {
        const rarity = determineRarity(0);
        const traits = oc.traits || [
          { trait_type: '风格', value: oc.style || 'pixel' },
          { trait_type: '创建时间', value: new Date().toLocaleDateString('zh-CN') },
        ];
        const power = calcBasePower(rarity, traits.length);
        const ownerAddr = mockAddress();

        const nft: OCNFT = {
          ocId: oc.id,
          tokenId: toTokenId(oc.id),
          rarity,
          power,
          image: oc.image ?? null,
          name: oc.name,
          contract: OC_NFT_CONTRACT,
          owner: ownerAddr,
          mintTx: mockTxHash(),
          blockNumber: mockBlockNumber(),
          mintedAt: Date.now(),
          traits,
        };

        set(state => ({
          nfts: [...state.nfts, nft],
          balance: state.balance + eventReward('CREATE_OC'),
          totalEarned: state.totalEarned + eventReward('CREATE_OC'),
        }));

        return nft;
      },

      stakeOC: (ocId) => {
        const state = get();
        const nft = state.nfts.find(n => n.ocId === ocId);
        if (!nft) return false;
        if (state.stakingPositions.find(s => s.ocId === ocId)) return false;

        const apr = calcStakingAPR(nft.power, state.totalStakedPower);
        const position: StakingPosition = {
          ocId,
          stakedAt: Date.now(),
          apr,
          pendingReward: 0,
          lastClaimAt: Date.now(),
        };

        set(state => ({
          stakingPositions: [...state.stakingPositions, position],
          totalStakedPower: state.totalStakedPower + nft.power,
        }));
        return true;
      },

      unstakeOC: (ocId) => {
        const state = get();
        const pos = state.stakingPositions.find(s => s.ocId === ocId);
        if (!pos) return false;
        const nft = state.nfts.find(n => n.ocId === ocId);

        // Claim any pending first
        const elapsed = (Date.now() - pos.lastClaimAt) / 1000;
        const reward = calcPendingReward(nft?.power || 100, pos.apr, elapsed);

        set(state => ({
          stakingPositions: state.stakingPositions.filter(s => s.ocId !== ocId),
          totalStakedPower: Math.max(0, state.totalStakedPower - (nft?.power || 0)),
          balance: state.balance + reward,
          totalEarned: state.totalEarned + reward,
        }));
        return true;
      },

      claimRewards: (ocId) => {
        const state = get();
        let totalClaimed = 0;

        const positions = ocId
          ? state.stakingPositions.filter(s => s.ocId === ocId)
          : state.stakingPositions;

        const updatedPositions = state.stakingPositions.map(pos => {
          if (positions.includes(pos)) {
            const nft = state.nfts.find(n => n.ocId === pos.ocId);
            const elapsed = (Date.now() - pos.lastClaimAt) / 1000;
            const reward = calcPendingReward(nft?.power || 100, pos.apr, elapsed);
            totalClaimed += reward;
            return { ...pos, pendingReward: 0, lastClaimAt: Date.now() };
          }
          return pos;
        });

        set({
          stakingPositions: updatedPositions,
          balance: state.balance + totalClaimed,
          totalEarned: state.totalEarned + totalClaimed,
        });

        return totalClaimed;
      },

      addLiquidity: (poolId, amount) => {
        const state = get();
        if (state.balance < amount) return false;

        const pool = state.pools.find(p => p.poolId === poolId);
        if (!pool) return false;

        const shares = pool.tvl > 0 ? (amount / pool.tvl) * 1000 : amount;
        const existingLP = state.lpPositions.find(lp => lp.poolId === poolId);

        set({
          balance: state.balance - amount,
          pools: state.pools.map(p =>
            p.poolId === poolId
              ? { ...p, tvl: p.tvl + amount, feeApr: calcPoolFeeAPR(p.volume24h, p.tvl + amount) }
              : p
          ),
          lpPositions: existingLP
            ? state.lpPositions.map(lp =>
                lp.poolId === poolId
                  ? { ...lp, shares: lp.shares + shares, depositedOC: lp.depositedOC + amount }
                  : lp
              )
            : [...state.lpPositions, { poolId, shares, depositedOC: amount, pendingFees: 0 }],
        });
        return true;
      },

      removeLiquidity: (poolId, sharesToRemove) => {
        const state = get();
        const lp = state.lpPositions.find(l => l.poolId === poolId);
        if (!lp || lp.shares < sharesToRemove) return false;

        const pool = state.pools.find(p => p.poolId === poolId);
        if (!pool) return false;

        const withdrawAmount = (sharesToRemove / lp.shares) * lp.depositedOC;
        const feeShare = (sharesToRemove / lp.shares) * lp.pendingFees;
        const totalReturn = withdrawAmount + feeShare;

        set({
          balance: state.balance + totalReturn,
          totalEarned: state.totalEarned + feeShare,
          pools: state.pools.map(p =>
            p.poolId === poolId
              ? { ...p, tvl: Math.max(0, p.tvl - withdrawAmount), feeApr: calcPoolFeeAPR(p.volume24h, Math.max(1, p.tvl - withdrawAmount)) }
              : p
          ),
          lpPositions: lp.shares <= sharesToRemove
            ? state.lpPositions.filter(l => l.poolId !== poolId)
            : state.lpPositions.map(l =>
                l.poolId === poolId
                  ? { ...l, shares: l.shares - sharesToRemove, depositedOC: l.depositedOC - withdrawAmount, pendingFees: l.pendingFees - feeShare }
                  : l
              ),
        });
        return true;
      },

      trackEvent: (eventType, meta) => {
        const reward = eventReward(eventType);
        const poolMap: Record<string, PoolId> = {
          LIKE: 'LIKE',
          COLLECT: 'COLLECT',
          CHAT: 'CHAT',
          INTERACT: 'CHAT',
          WORLD_JOIN: 'WORLD',
          WORLD_CREATE: 'WORLD',
        };
        const poolId = poolMap[eventType];

        set(state => ({
          balance: state.balance + reward,
          totalEarned: state.totalEarned + reward,
          pools: poolId
            ? state.pools.map(p =>
                p.poolId === poolId
                  ? { ...p, volume24h: p.volume24h + reward, tvl: p.tvl + reward * 0.1, feeApr: calcPoolFeeAPR(p.volume24h + reward, p.tvl + reward * 0.1) }
                  : p
              )
            : state.pools,
          lpPositions: poolId
            ? state.lpPositions.map(lp =>
                lp.poolId === poolId
                  ? { ...lp, pendingFees: lp.pendingFees + reward * 0.003 }
                  : lp
              )
            : state.lpPositions,
        }));
      },

      vote: (proposalId, choice) => {
        const state = get();
        if (state.votes.find(v => v.proposalId === proposalId)) return false;

        const power = state.stakingPositions.reduce((sum, s) => {
          const nft = state.nfts.find(n => n.ocId === s.ocId);
          return sum + (nft?.power || 0);
        }, 0);
        const weight = Math.max(1, Math.floor(power / 50) + Math.floor(state.balance / 100));

        const record: VoteRecord = {
          proposalId,
          choice,
          weight,
          votedAt: Date.now(),
        };

        set({
          votes: [...state.votes, record],
          proposals: state.proposals.map(p =>
            p.id === proposalId
              ? {
                  ...p,
                  forVotes: choice === '赞成' ? p.forVotes + weight : p.forVotes,
                  againstVotes: choice === '反对' ? p.againstVotes + weight : p.againstVotes,
                }
              : p
          ),
        });
        return true;
      },

      refreshStaking: () => {
        const state = get();
        const updatedPositions = state.stakingPositions.map(pos => {
          const nft = state.nfts.find(n => n.ocId === pos.ocId);
          const elapsed = (Date.now() - pos.lastClaimAt) / 1000;
          const pending = calcPendingReward(nft?.power || 100, pos.apr, elapsed);
          return { ...pos, pendingReward: pending };
        });
        set({ stakingPositions: updatedPositions });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'oc-world-defi',
      version: 3, // Bump version to force re-migration with correct NFT images
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          // Force re-seed NFTs with correct images
          persistedState.nfts = defaultNFTs;
          persistedState.stakingPositions = defaultStakingPositions;
          persistedState.totalStakedPower = defaultStakingPositions.reduce((sum: number, _s: StakingPosition) => {
            const nft = defaultNFTs.find(n => n.ocId === _s.ocId);
            return sum + (nft?.power || 0);
          }, 0);
        }
        return persistedState;
      },
      partialize: (state) => ({
        balance: state.balance,
        locked: state.locked,
        totalEarned: state.totalEarned,
        nfts: state.nfts,
        stakingPositions: state.stakingPositions,
        totalStakedPower: state.totalStakedPower,
        pools: state.pools,
        lpPositions: state.lpPositions,
        proposals: state.proposals,
        votes: state.votes,
      }),
    }
  )
);
