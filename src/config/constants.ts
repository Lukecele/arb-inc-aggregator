// BSC Chain Configuration
export const BSC_CHAIN = {
  id: 56,
  name: 'Binance Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://bscscan.com',
    },
  },
} as const

// KyberSwap Constants
export const KYBER_AGGREGATOR_BASE_URL = 'https://aggregator-api.kyberswap.com'
export const KYBER_ROUTER_ADDRESS = '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5'
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

// Supported Slippage Range (in bips, 1 bip = 0.01%)
export const MIN_SLIPPAGE_BIPS = 1   // 0.01%
export const MAX_SLIPPAGE_BIPS = 2000 // 20%
export const DEFAULT_SLIPPAGE_BIPS = 50 // 0.5%

// API Configuration
export const API_TIMEOUT_MS = 10000
export const ROUTE_CACHE_MAX_AGE_MS = 5000 // Max 5 seconds due to market volatility
