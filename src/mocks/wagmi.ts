const mockPublicClient = {
  simulateContract: jest.fn(),
  waitForTransactionReceipt: jest.fn(),
}

const mockWalletClient = {
  writeContract: jest.fn(),
  sendTransaction: jest.fn(),
}

jest.mock('wagmi', () => ({
  useAccount: jest.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    isConnecting: false,
  })),
  useConnect: jest.fn(() => ({
    connect: jest.fn(),
    connectors: [
      { id: 'injected', name: 'MetaMask' },
      { id: 'walletconnect', name: 'WalletConnect' },
    ],
    isPending: false,
  })),
  useDisconnect: jest.fn(() => ({
    disconnect: jest.fn(),
  })),
  useChainId: jest.fn(() => 56),
  usePublicClient: jest.fn(() => mockPublicClient),
  useWalletClient: jest.fn(() => ({ data: mockWalletClient })),
  WagmiProvider: ({ children }: { children: React.ReactNode }) => children,
}))

export { mockPublicClient, mockWalletClient }

jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({
    provide: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))
