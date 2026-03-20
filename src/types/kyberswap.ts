export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  chainId: number
}

export interface GetRouteParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  includedSources?: string[]
  excludedSources?: string[]
  excludeRFQSources?: boolean
  onlyScalableSources?: boolean
  onlyDirectPools?: boolean
  onlySinglePath?: boolean
  gasInclude?: boolean
  gasPrice?: string
  feeAmount?: string
  chargeFeeBy?: 'currency_in' | 'currency_out'
  isInBps?: boolean
  feeReceiver?: string
  origin?: string
}

export interface ExtraFee {
  feeAmount: string
  chargeFeeBy: 'currency_in' | 'currency_out' | ''
  isInBps: boolean
  feeReceiver: string
}

export interface SwapStep {
  pool: string
  tokenIn: string
  tokenOut: string
  swapAmount: string
  amountOut: string
  exchange: string
  poolType: string
  poolExtra?: Record<string, unknown>
  extra?: Record<string, unknown>
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
  l1FeeUsd?: string
  extraFee?: ExtraFee
  route: SwapStep[][][]
  routeID: string
  checksum: string
  timestamp: string
}

export interface GetRouteResponseData {
  routeSummary: RouteSummary
  routerAddress: string
}

export interface GetRouteResponse {
  code: number
  message: string
  data: GetRouteResponseData
  requestId?: string
}

export interface BuildRouteParams {
  routeSummary: RouteSummary
  sender: string
  origin?: string
  recipient: string
  permit?: string
  deadline?: number
  slippageTolerance: number
  ignoreCappedSlippage?: boolean
  enableGasEstimation?: boolean
  source?: string
  referral?: string
}

export interface BuildRouteResponseData {
  amountIn: string
  amountInUsd: string
  amountOut: string
  amountOutUsd: string
  gas: string
  gasUsd: string
  additionalCostUsd?: string
  additionalCostMessage?: string
  data: string
  routerAddress: string
  transactionValue: string
}

export interface BuildRouteResponse {
  code: number
  message: string
  data: BuildRouteResponseData
  requestId?: string
}

export interface SwapError {
  code: number
  message: string
  requestId?: string
  details?: Record<string, unknown>
}

// API Error Codes from KyberSwap
export const API_ERROR_CODES = {
  0: 'Success',
  4000: 'Bad request',
  4001: 'Query parameters are malformed',
  4002: 'Request body is malformed',
  4005: 'Fee amount is greater than amount in',
  4007: 'Fee amount is greater than amount out',
  4008: 'Route not found',
  4009: 'Amount in is greater than max allowed',
  4010: 'No pool is eligible to find route on',
  4011: 'Token not found',
} as const

export type APIErrorCode = keyof typeof API_ERROR_CODES
