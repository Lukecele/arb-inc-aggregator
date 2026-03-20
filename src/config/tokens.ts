import { Token } from '@/types/token'
import { NATIVE_TOKEN_ADDRESS, BSC_CHAIN } from './constants'

export const BSC_TOKENS: Token[] = [
  {
    address: NATIVE_TOKEN_ADDRESS,
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
    chainId: BSC_CHAIN.id,
  },
  {
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/logo.png',
    chainId: BSC_CHAIN.id,
  },
  {
    address: '0x55d398326f99059fF775485246999027B3197955',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    chainId: BSC_CHAIN.id,
  },
  {
    address: '0x8AC76a51cc950d9822D68d83eE8B12b539eB5eCe',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    chainId: BSC_CHAIN.id,
  },
  {
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    symbol: 'BUSD',
    name: 'Binance USD',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56/logo.png',
    chainId: BSC_CHAIN.id,
  },
  {
    address: '0x0E09FaBB73Bd3ade0a17ECC321fD13a19e81cE82',
    symbol: 'CAKE',
    name: 'PancakeSwap Token',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/0x0E09FaBB73Bd3ade0a17ECC321fD13a19e81cE82/logo.png',
    chainId: BSC_CHAIN.id,
  },
  {
    address: '0x1AF3F329e8BEc1545F312115BDB1E25E2c634e0',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EesdfD5C5671e5/logo.png',
    chainId: BSC_CHAIN.id,
  },
  {
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2170Ed0880ac9A755fd29B2688956BD959F933F8/logo.png',
    chainId: BSC_CHAIN.id,
  },
  {
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    symbol: 'BTCB',
    name: 'Bitcoin BEP2',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c/logo.png',
    chainId: BSC_CHAIN.id,
  },
  {
    address: '0x250632378E573c6BE1AC2f97F86400502E1fAd0',
    symbol: 'NFTS',
    name: 'NFTSpace',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x250632378E573c6BE1AC2f97F86400502E1fAd0/logo.png',
    chainId: BSC_CHAIN.id,
  },
]

export function getTokenByAddress(address: string): Token | undefined {
  return BSC_TOKENS.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  )
}

export function getTokenBySymbol(symbol: string): Token | undefined {
  return BSC_TOKENS.find(
    (t) => t.symbol.toLowerCase() === symbol.toLowerCase()
  )
}

export function searchTokens(query: string): Token[] {
  const lowerQuery = query.toLowerCase()
  return BSC_TOKENS.filter(
    (t) =>
      t.symbol.toLowerCase().includes(lowerQuery) ||
      t.name.toLowerCase().includes(lowerQuery) ||
      t.address.toLowerCase().includes(lowerQuery)
  )
}

export function isNativeToken(address: string): boolean {
  return address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
}
