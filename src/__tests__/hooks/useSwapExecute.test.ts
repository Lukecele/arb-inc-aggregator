import { renderHook } from '@testing-library/react'

jest.mock('@/hooks/useWallet', () => ({
  useWallet: jest.fn(() => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    isConnecting: false,
  })),
}))

jest.mock('@/config/constants', () => ({
  BSC_CHAIN: { id: 56, name: 'Binance Smart Chain', network: 'bsc' },
  KYBER_ROUTER_ADDRESS: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
  NATIVE_TOKEN_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
}))

jest.mock('@/config/tokens', () => ({
  isNativeToken: jest.fn((address: string) => 
    address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  ),
}))

jest.mock('wagmi', () => ({
  usePublicClient: jest.fn(() => ({
    simulateContract: jest.fn(),
    waitForTransactionReceipt: jest.fn(),
  })),
  useWalletClient: jest.fn(() => ({
    data: {
      writeContract: jest.fn(),
      sendTransaction: jest.fn(),
    },
  })),
}))

jest.mock('@/hooks/useSwapRoute', () => ({
  useSwapBuild: jest.fn(() => ({
    calldata: '0x123456',
    transactionValue: '0',
    amountOut: '250000000000000000000',
    build: jest.fn(),
  })),
}))

describe('useSwapExecute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with ready state when all params provided', () => {
    const { useSwapExecute } = require('@/hooks/useSwapExecute')
    
    const { result } = renderHook(() =>
      useSwapExecute({
        routeSummary: {
          tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          amountIn: '1000000000000000000',
          amountInUsd: '600',
          tokenOut: '0x0E09FaBB73Bd3ade0a17ECC321fD13a19e81cE82',
          amountOut: '250000000000000000000',
          amountOutUsd: '595',
          gas: '350000',
          gasPrice: '5000000000',
          gasUsd: '5',
          route: [],
          routeID: 'route-123',
          checksum: '0x123',
          timestamp: '2024-01-01T00:00:00Z',
        },
        calldata: '0xabcdef123456',
        transactionValue: '1000000000',
        tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        amountIn: '1000000000000000000',
      })
    )

    expect(result.current.isReady).toBe(true)
    expect(result.current.isPending).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('is not ready when calldata is null', () => {
    const { useSwapExecute } = require('@/hooks/useSwapExecute')
    
    const { result } = renderHook(() =>
      useSwapExecute({
        routeSummary: {
          tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          amountIn: '1000000000000000000',
          amountInUsd: '600',
          tokenOut: '0x0E09FaBB73Bd3ade0a17ECC321fD13a19e81cE82',
          amountOut: '250000000000000000000',
          amountOutUsd: '595',
          gas: '350000',
          gasPrice: '5000000000',
          gasUsd: '5',
          route: [],
          routeID: 'route-123',
          checksum: '0x123',
          timestamp: '2024-01-01T00:00:00Z',
        },
        calldata: null,
        transactionValue: '1000000000',
        tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        amountIn: '1000000000000000000',
      })
    )

    expect(result.current.isReady).toBe(false)
  })
})
