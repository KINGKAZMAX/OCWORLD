// DeFi math utilities for yield calculations

import type { Rarity } from '@/store/defiStore';

/** Rarity multipliers for staking power / rewards */
export const RARITY_MULTIPLIER: Record<Rarity, number> = {
  '普通': 1.0,
  '稀有': 1.5,
  '史诗': 2.5,
  '传说': 4.0,
  '神话': 8.0,
};

/** Rarity colors (Tailwind-friendly) */
export const RARITY_COLORS: Record<Rarity, string> = {
  '普通': '#9CA3AF',
  '稀有': '#5a9e9e',
  '史诗': '#8B5CF6',
  '传说': '#d4a64a',
  '神话': '#1f2937',
};

export const RARITY_BG: Record<Rarity, string> = {
  '普通': 'from-gray-200 to-gray-300',
  '稀有': 'from-teal-200 to-teal-400',
  '史诗': 'from-purple-200 to-purple-500',
  '传说': 'from-amber-200 to-amber-500',
  '神话': 'from-gray-800 to-amber-500',
};

/** Determine rarity from a random seed + social metrics */
export function determineRarity(socialScore = 0): Rarity {
  const roll = Math.random() * 100 + socialScore * 0.5;
  if (roll > 98) return '神话';
  if (roll > 92) return '传说';
  if (roll > 80) return '史诗';
  if (roll > 55) return '稀有';
  return '普通';
}

/** Calculate base power from rarity + traits count */
export function calcBasePower(rarity: Rarity, traitsCount: number): number {
  return Math.floor(RARITY_MULTIPLIER[rarity] * 100 + traitsCount * 15);
}

/** Calculate staking APR based on total staked, NFT power, pool multiplier */
export function calcStakingAPR(
  nftPower: number,
  totalStaked: number,
  baseRate = 0.12,
): number {
  // APR decreases as more is staked (simulated supply-demand)
  const dilution = Math.max(0.3, 1 - totalStaked / 10000);
  return parseFloat((baseRate * (nftPower / 100) * dilution * 100).toFixed(2));
}

/** Calculate pending reward (per second accrual) */
export function calcPendingReward(
  power: number,
  apr: number,
  stakedSeconds: number,
): number {
  const yearSeconds = 365 * 24 * 3600;
  return parseFloat(((power * apr / 100) * (stakedSeconds / yearSeconds)).toFixed(4));
}

/** Pool fee APR from volume */
export function calcPoolFeeAPR(volume24h: number, tvl: number): number {
  if (tvl <= 0) return 0;
  // 0.3% fee rate on volume, annualized
  return parseFloat(((volume24h * 0.003 * 365) / tvl * 100).toFixed(2));
}

/** Determine how many $OC to reward for an event */
export function eventReward(eventType: string): number {
  const rewards: Record<string, number> = {
    CREATE_OC: 100,
    LIKE: 2,
    COLLECT: 5,
    CHAT: 3,
    INTERACT: 10,
    WORLD_JOIN: 15,
    WORLD_CREATE: 50,
    MARKET_PURCHASE: 0, // spending, not earning
  };
  return rewards[eventType] ?? 1;
}
