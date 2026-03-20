'use client'

import { useState, useMemo } from 'react'
import { useWallet } from './useWallet'
import { getKyberSwapService } from '@/services/kyberswap'
import {
  GetRouteParams,
  BuildRouteParams,
  RouteSummary,
} from '@/types/kyberswap'
import {
  DEFAULT_SLIPPAGE_BIPS,
} from '@/config/constants'

interface UseSwapRouteParams {
  tokenIn: string
  tokenOut: string
  amountIn: string
  enabled?: boolean
}

interface UseSwapRouteResult {
  route: RouteSummary | null
  routerAddress: string | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useSwapRoute({
  tokenIn,
  tokenOut,
  amountIn,
  enabled = true,
}: UseSwapRouteParams): UseSwapRouteResult {
  const { address } = useWallet()
  
  const params = useMemo((): GetRouteParams | null => {
    if (!tokenIn || !tokenOut || !amountIn || !enabled) return null
    return {
      tokenIn,
      tokenOut,
      amountIn,
      feeAmount: process.env.NEXT_PUBLIC_KYBER_FEE_AMOUNT,
      chargeFeeBy: process.env.NEXT_PUBLIC_KYBER_FEE_CHARGE_BY as 'currency_in' | 'currency_out',
      isInBps: process.env.NEXT_PUBLIC_KYBER_FEE_IS_IN_BPS !== 'false',
      feeReceiver: process.env.NEXT_PUBLIC_KYBER_FEE_RECEIVER,
      origin: address,
    }
  }, [tokenIn, tokenOut, amountIn, enabled, address])

  const [route, setRoute] = useState<RouteSummary | null>(null)
  const [routerAddress, setRouterAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchRoute = async () => {
    if (!params) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const service = getKyberSwapService()
      const response = await service.getRoute(params)
      
      if (response.code === 0) {
        setRoute(response.data.routeSummary)
        setRouterAddress(response.data.routerAddress)
      } else {
        throw new Error(response.message || 'Failed to get route')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setRoute(null)
      setRouterAddress(null)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    route,
    routerAddress,
    isLoading,
    error,
    refetch: fetchRoute,
  }
}

interface UseSwapBuildParams {
  routeSummary: RouteSummary | null
  slippageTolerance?: number
  enabled?: boolean
}

interface UseSwapBuildResult {
  calldata: string | null
  transactionValue: string
  amountOut: string
  isLoading: boolean
  error: Error | null
  build: () => void
}

export function useSwapBuild({
  routeSummary,
  slippageTolerance = DEFAULT_SLIPPAGE_BIPS,
  enabled = true,
}: UseSwapBuildParams): UseSwapBuildResult {
  const { address } = useWallet()
  
  const [calldata, setCalldata] = useState<string | null>(null)
  const [transactionValue, setTransactionValue] = useState('0')
  const [amountOut, setAmountOut] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const build = async () => {
    if (!routeSummary || !address || !enabled) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const service = getKyberSwapService()
      
      const params: BuildRouteParams = {
        routeSummary,
        sender: address,
        recipient: address,
        slippageTolerance,
      }
      
      const response = await service.buildRoute(params)
      
      if (response.code === 0) {
        setCalldata(response.data.data)
        setTransactionValue(response.data.transactionValue)
        setAmountOut(response.data.amountOut)
      } else {
        throw new Error(response.message || 'Failed to build route')
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setCalldata(null)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    calldata,
    transactionValue,
    amountOut,
    isLoading,
    error,
    build,
  }
}
