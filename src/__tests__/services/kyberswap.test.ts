import { KyberSwapService, getKyberSwapService, resetKyberSwapService } from '@/services/kyberswap'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

jest.mock('@/config/constants', () => ({
  BSC_CHAIN: { id: 56, name: 'Binance Smart Chain', network: 'bsc' },
  KYBER_AGGREGATOR_BASE_URL: 'https://aggregator-api.kyberswap.com',
  KYBER_ROUTER_ADDRESS: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
  NATIVE_TOKEN_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  DEFAULT_SLIPPAGE_BIPS: 50,
}))

describe('KyberSwapService', () => {
  let mockAxiosInstance: ReturnType<typeof axios.create> & {
    get: jest.Mock
    post: jest.Mock
    defaults: { headers: Record<string, string> }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    resetKyberSwapService()
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      defaults: { headers: {} },
    } as unknown as typeof mockAxiosInstance
    mockedAxios.create.mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>)
  })

  describe('constructor', () => {
    it('creates service with default clientId', () => {
      const service = new KyberSwapService()
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://aggregator-api.kyberswap.com',
          timeout: 10000,
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Client-Id': 'DemoDEX',
          }),
        })
      )
    })

    it('creates service with custom clientId', () => {
      new KyberSwapService('CustomDex')
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Client-Id': 'CustomDex',
          }),
        })
      )
    })
  })

  describe('setClientId', () => {
    it('updates the clientId header', () => {
      const service = new KyberSwapService('InitialDex')
      service.setClientId('NewDex')
      expect(mockAxiosInstance.defaults.headers['X-Client-Id']).toBe('NewDex')
    })
  })

  describe('getRoute', () => {
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
          extraFee: {
            feeAmount: '10000000000000000',
            chargeFeeBy: 'currency_in',
            isInBps: true,
            feeReceiver: '0xafF5340ECFaf7ce049261cff193f5FED6BDF04E7',
          },
          route: [],
          routeID: 'route-123',
          checksum: '0x123',
          timestamp: '2024-01-01T00:00:00Z',
        },
        routerAddress: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
      },
    }

    it('calls GET /bsc/api/v1/routes with correct params', async () => {
      const service = new KyberSwapService('TestDex')
      mockAxiosInstance.get.mockResolvedValue({ data: mockRouteResponse })

      const params = {
        tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        tokenOut: '0x0E09FaBB73Bd3ade0a17ECC321fD13a19e81cE82',
        amountIn: '1000000000000000000',
      }

      const result = await service.getRoute(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bsc/api/v1/routes', {
        params,
      })
      expect(result).toEqual(mockRouteResponse)
    })

    it('throws error on API error', async () => {
      const service = new KyberSwapService()
      const error = {
        response: {
          status: 400,
          data: { code: 4001, message: 'Query parameters are malformed' },
        },
      }
      mockAxiosInstance.get.mockRejectedValue(error)

      await expect(
        service.getRoute({ tokenIn: 'invalid', tokenOut: 'invalid', amountIn: '0' })
      ).rejects.toThrow('KyberSwap API Error 4001: Query parameters are malformed')
    })

    it('throws error on network error', async () => {
      const service = new KyberSwapService()
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'))

      await expect(
        service.getRoute({ tokenIn: '0x123', tokenOut: '0x456', amountIn: '100' })
      ).rejects.toThrow('Request error: Network error')
    })
  })

  describe('buildRoute', () => {
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
        transactionValue: '0',
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

    it('calls POST /bsc/api/v1/route/build with correct params', async () => {
      const service = new KyberSwapService('TestDex')
      mockAxiosInstance.post.mockResolvedValue({ data: mockBuildResponse })

      const params = {
        routeSummary: mockRouteSummary,
        sender: '0x1234567890123456789012345678901234567890',
        recipient: '0x1234567890123456789012345678901234567890',
        slippageTolerance: 50,
      }

      const result = await service.buildRoute(params)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/bsc/api/v1/route/build', params)
      expect(result).toEqual(mockBuildResponse)
    })
  })

  describe('singleton', () => {
    it('returns same instance', () => {
      const instance1 = getKyberSwapService('SingletonTest')
      const instance2 = getKyberSwapService()
      expect(instance1).toBe(instance2)
    })

    it('creates new instance after reset', () => {
      const instance1 = getKyberSwapService('Test1')
      resetKyberSwapService()
      const instance2 = getKyberSwapService('Test2')
      expect(instance1).not.toBe(instance2)
    })
  })
})
