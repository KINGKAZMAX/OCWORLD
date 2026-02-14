// Mock blockchain data generator
// Generates simulated on-chain data for the DeFi Universe

const HEX_CHARS = '0123456789abcdef';

function randomHex(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += HEX_CHARS[Math.floor(Math.random() * 16)];
  }
  return result;
}

/** Generate a mock Ethereum-style address */
export function mockAddress(): string {
  return `0x${randomHex(40)}`;
}

/** Generate a mock transaction hash */
export function mockTxHash(): string {
  return `0x${randomHex(64)}`;
}

/** Generate a mock block number (simulated, increasing from a base) */
let _blockBase = 19_800_000 + Math.floor(Math.random() * 100_000);
export function mockBlockNumber(): number {
  _blockBase += Math.floor(Math.random() * 5) + 1;
  return _blockBase;
}

/** Generate a token ID from an OC id */
export function toTokenId(ocId: number | string): string {
  return `OC-${String(ocId).padStart(6, '0')}`;
}

/** Truncate an address/hash for display */
export function truncateHash(hash: string, start = 6, end = 4): string {
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

/** The "contract address" for OC-NFT */
export const OC_NFT_CONTRACT = '0xOCW0R1D' + randomHex(32);
export const OC_TOKEN_CONTRACT = '0x0CT0KEN' + randomHex(32);

/** Simulated price history (for sparkline) */
export function generatePriceHistory(days = 30, basePrice = 1.0): number[] {
  const prices: number[] = [];
  let price = basePrice;
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.48) * 0.15; // slight upward bias
    price = Math.max(0.1, price + change);
    prices.push(parseFloat(price.toFixed(4)));
  }
  return prices;
}
