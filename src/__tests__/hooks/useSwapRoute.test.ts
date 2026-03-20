import { renderHook, waitFor } from '@testing-library/react'
import { useSwapRoute, useSwapBuild } from '@/hooks/useSwapRoute'

jest.mock('@/services/kyberswap', () => {
  const mockService = {
    getRoute: jest.fn(),
    buildRoute: jest.fn(),
    setClientId: jest.fn(),
  }
  return {
    getKyberSwapService: jest.fn(() => mockService),
    resetKyberSwapService: jest.fn(),
    KyberSwapService: jest.fn(),
  }
})

jest.mock('@/config/constants', () => ({
  BSC_CHAIN: { id: 56, name: 'Binance Smart Chain', network: 'bsc' },
  KYBER_AGGREGATOR_BASE_URL: 'https://aggregator-api.kyberswap.com',
  KYBER_ROUTER_ADDRESS: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
  NATIVE_TOKEN_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  DEFAULT_SLIPPAGE_BIPS: 50,
}))

import { getKyberSwapService } from '@/services/kyberswap'
const mockGetKyberSwapService = getKyberSwapService as jest.Mock

const TEST_ADDRESS = '0x1234567890123456789012345678901234567890'
const mockWallet = {
  address: TEST_ADDRESS,
  isConnected: true,
  isConnecting: false,
}

jest.mock('@/hooks/useWallet', () => ({
  useWallet: jest.fn(() => mockWallet),
}))

describe('useSwapRoute', () => {
  const mockRouteResponse = {
    code: 0,
    message: 'success',
    data: {
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
      routerAddress: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with null values', () => {
    const { result } = renderHook(() =>
      useSwapRoute({ tokenIn: '', tokenOut: '', amountIn: '' })
    )

    expect(result.current.route).toBeNull()
    expect(result.current.routerAddress).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches route when params are valid', async () => {
    const mockService = { getRoute: jest.fn().mockResolvedValue(mockRouteResponse) }
    mockGetKyberSwapService.mockReturnValue(mockService)

    const { result } = renderHook(() =>
      useSwapRoute({
        tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        tokenOut: '0x0E09FaBB73Bd3ade0a17ECC321fD13a19e81cE82',
        amountIn: '1000000000000000000',
      })
    )

    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.route).toEqual(mockRouteResponse.data.routeSummary)
      expect(result.current.routerAddress).toBe(mockRouteResponse.data.routerAddress)
    })
  })

  it('does not fetch when enabled is false', async () => {
    const mockService = { getRoute: jest.fn().mockResolvedValue(mockRouteResponse) }
    mockGetKyberSwapService.mockReturnValue(mockService)

    const { result } = renderHook(() =>
      useSwapRoute({
        tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        tokenOut: '0x0E09FaBB73Bd3ade0a17ECC321fD13a19e81cE82',
        amountIn: '1000000000000000000',
        enabled: false,
      })
    )

    await result.current.refetch()

    expect(mockService.getRoute).not.toHaveBeenCalled()
  })

  it('handles API errors', async () => {
    const mockService = {
      getRoute: jest.fn().mockRejectedValue(new Error('API Error')),
    }
    mockGetKyberSwapService.mockReturnValue(mockService)

    const { result } = renderHook(() =>
      useSwapRoute({
        tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        tokenOut: '0x0E09FaBB73Bd3ade0a17ECC321fD13a19e81cE82',
        amountIn: '1000000000000000000',
      })
    )

    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.route).toBeNull()
    })
  })
})

describe('useSwapBuild', () => {
  const mockBuildResponse = {
    code: 0,
    message: 'success',
    data: {
      amountIn: '1000000000000000000',
      amountInUsd: '600',
      amountOut: '250000000000000000000',
      amountOutUsd: '595',
      gas: '350000',
      gasUsd: '5',
      data: '0x1234567890abcdef',
      routerAddress: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
      transactionValue: '1000000000',
    },
  }

  const mockRouteSummary = {
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
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with default values', () => {
    const { result } = renderHook(() =>
      useSwapBuild({ routeSummary: null })
    )

    expect(result.current.calldata).toBeNull()
    expect(result.current.transactionValue).toBe('0')
    expect(result.current.amountOut).toBe('0')
    expect(result.current.isLoading).toBe(false)
  })

  it('builds calldata when routeSummary is provided', async () => {
    const mockService = { buildRoute: jest.fn().mockResolvedValue(mockBuildResponse) }
    mockGetKyberSwapService.mockReturnValue(mockService)

    const { result } = renderHook(() =>
      useSwapBuild({ routeSummary: mockRouteSummary })
    )

    await result.current.build()

    await waitFor(() => {
      expect(result.current.calldata).toBe(mockBuildResponse.data.data)
      expect(result.current.transactionValue).toBe(mockBuildResponse.data.transactionValue)
    })
  })
})
