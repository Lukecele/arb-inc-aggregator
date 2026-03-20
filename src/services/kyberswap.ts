import axios from "axios";

// Aggregator API configuration - matches KyberSwap official demo
const AGGREGATOR_DOMAIN = "https://aggregator-api.kyberswap.com";

// Chain name mapping
export const CHAIN_NAMES = {
  ETHEREUM: "ethereum",
  BSC: "bsc",
  ARBITRUM: "arbitrum",
  POLYGON: "polygon",
  OPTIMISM: "optimism",
  AVALANCHE: "avalanche",
  BASE: "base",
} as const

// BSC Chain ID
export const BSC_CHAIN_ID = 56

export interface Token {
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface RouteSummary {
  tokenIn: string
  amountIn: string
  amountInUsd: string
  tokenOut: string
  amountOut: string
  amountOutUsd: string
  gas: string
  gasPrice: string
  gasUsd: string
  route: unknown[][]
  routeID: string
  checksum: string
  timestamp: string
  extraFee?: {
    feeAmount: string
    chargeFeeBy: string
    isInBps: boolean
    feeReceiver: string
  }
}

export interface DevFeeConfig {
  feeReceiver: string
  feeAmount: number
  chargeFeeBy: 'currency_in' | 'currency_out'
}

export interface GetRouteParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  feeAmount?: string
  chargeFeeBy?: 'currency_in' | 'currency_out'
  isInBps?: boolean
  feeReceiver?: string
  origin?: string
}

export const DEFAULT_DEV_FEE: DevFeeConfig | null = null

export interface BuildRouteParams {
  routeSummary: RouteSummary
  sender: string
  recipient: string
  slippageTolerance: number
}

export interface SwapRouteData {
  routeSummary: RouteSummary
  routerAddress: string
}

export interface BuildSwapData {
  data: string
  routerAddress: string
  amountIn: string
  amountOut: string
  gas: string
  transactionValue: string
}

// Get swap route from KyberSwap API
export async function getSwapRoute(
  chainName: string,
  params: GetRouteParams,
  clientId: string = "DemoDEX",
  devFee?: DevFeeConfig | null
): Promise<SwapRouteData> {
  const targetPath = `/${chainName}/api/v1/routes`

  const requestParams: Record<string, string> = {
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    amountIn: params.amountIn,
  }

  if (devFee && devFee.feeAmount > 0) {
    requestParams.feeAmount = devFee.feeAmount.toString()
    requestParams.chargeFeeBy = devFee.chargeFeeBy
    requestParams.isInBps = 'true'
    requestParams.feeReceiver = devFee.feeReceiver
  }

  if (params.origin) {
    requestParams.origin = params.origin
  }

  const headers = {
    "x-client-id": clientId,
  }

  try {
    const response = await axios.get(
      AGGREGATOR_DOMAIN + targetPath,
      {
        params: requestParams,
        headers,
      }
    )
    
    if (response.data.code !== 0) {
      throw new Error(response.data.message || "Failed to get swap route")
    }
    
    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data
      if (data && data.code) {
        throw new Error(`KyberSwap API Error ${data.code}: ${data.message}`)
      }
      throw new Error(`API Error ${error.response.status}: ${error.message}`)
    }
    throw error
  }
}

// Build swap transaction data
export async function buildSwapRoute(
  chainName: string,
  params: BuildRouteParams,
  clientId: string = "DemoDEX"
): Promise<BuildSwapData> {
  const targetPath = `/${chainName}/api/v1/route/build`

  const requestBody = {
    routeSummary: params.routeSummary,
    sender: params.sender,
    recipient: params.recipient,
    slippageTolerance: params.slippageTolerance,
  }

  const headers = {
    "x-client-id": clientId,
  }

  try {
    const response = await axios.post(
      AGGREGATOR_DOMAIN + targetPath,
      requestBody,
      { headers }
    )
    
    if (response.data.code !== 0) {
      throw new Error(response.data.message || "Failed to build swap route")
    }
    
    return response.data.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data
      if (data && data.code) {
        throw new Error(`KyberSwap API Error ${data.code}: ${data.message}`)
      }
      throw new Error(`API Error ${error.response.status}: ${error.message}`)
    }
    throw error
  }
}

// Execute swap transaction (requires wallet connection)
export async function executeSwap(
  chainName: string,
  params: BuildRouteParams,
  clientId: string = "DemoDEX"
): Promise<{ data: string; routerAddress: string; transactionValue: string }> {
  const swapData = await buildSwapRoute(chainName, params, clientId)
  return {
    data: swapData.data,
    routerAddress: swapData.routerAddress,
    transactionValue: swapData.transactionValue,
  }
}
