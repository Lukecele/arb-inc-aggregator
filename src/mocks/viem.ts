jest.mock('viem', () => ({}))

jest.mock('@/config/wagmi', () => ({
  wagmiConfig: {},
  SUPPORTED_CHAIN_ID: 56,
}))
