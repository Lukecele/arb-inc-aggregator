import axios, { AxiosInstance, AxiosError } from 'axios'
import {
  GetRouteParams,
  GetRouteResponse,
  BuildRouteParams,
  BuildRouteResponse,
  SwapError,
  API_ERROR_CODES,
} from '@/types/kyberswap'
import {
  KYBER_AGGREGATOR_BASE_URL,
  BSC_CHAIN,
} from '@/config/constants'

export class KyberSwapService {
  private client: AxiosInstance
  private chain: string
  private clientId: string

  constructor(clientId: string = 'DemoDEX') {
    this.clientId = clientId
    this.chain = BSC_CHAIN.network
    this.client = axios.create({
      baseURL: KYBER_AGGREGATOR_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Id': this.clientId,
      },
    })
  }

  setClientId(clientId: string): void {
    this.clientId = clientId
    this.client.defaults.headers['X-Client-Id'] = clientId
  }

  async getRoute(params: GetRouteParams): Promise<GetRouteResponse> {
    try {
      const response = await this.client.get<GetRouteResponse>(
        `/${this.chain}/api/v1/routes`,
        { params }
      )
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError<SwapError>)
    }
  }

  async buildRoute(params: BuildRouteParams): Promise<BuildRouteResponse> {
    try {
      const response = await this.client.post<BuildRouteResponse>(
        `/${this.chain}/api/v1/route/build`,
        params
      )
      return response.data
    } catch (error) {
      throw this.handleError(error as AxiosError<SwapError>)
    }
  }

  private handleError(error: AxiosError<SwapError>): Error {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      if (data && 'code' in data) {
        const errorMessage = API_ERROR_CODES[data.code as keyof typeof API_ERROR_CODES] || data.message
        return new Error(`KyberSwap API Error ${data.code}: ${errorMessage}`)
      }
      
      return new Error(`KyberSwap API Error ${status}: ${error.message}`)
    }
    
    if (error.request) {
      return new Error('Network error: Unable to reach KyberSwap API')
    }
    
    return new Error(`Request error: ${error.message}`)
  }
}

// Singleton instance
let instance: KyberSwapService | null = null

export function getKyberSwapService(clientId?: string): KyberSwapService {
  if (!instance) {
    instance = new KyberSwapService(clientId || process.env.KYBER_CLIENT_ID || 'DemoDEX')
  }
  return instance
}

export function resetKyberSwapService(): void {
  instance = null
}
