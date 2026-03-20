jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    defaults: { headers: {} },
  })),
}))

jest.mock('@/config/constants', () => ({
  BSC_CHAIN: { id: 56, name: 'Binance Smart Chain', network: 'bsc' },
  KYBER_AGGREGATOR_BASE_URL: 'https://aggregator-api.kyberswap.com',
  KYBER_ROUTER_ADDRESS: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
  NATIVE_TOKEN_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  DEFAULT_SLIPPAGE_BIPS: 50,
}))
