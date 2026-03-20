'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useWallet } from './useWallet'
import { getSwapRoute, buildSwapRoute, CHAIN_NAMES, DevFeeConfig } from '@/services/kyberswap'
import { RouteSummary } from '@/services/kyberswap'

const DEV_FEE_CONFIG: DevFeeConfig | null = (() => {
  const feeReceiver = process.env.NEXT_PUBLIC_KYBER_FEE_RECEIVER
  const feeAmount = parseInt(process.env.NEXT_PUBLIC_KYBER_FEE_AMOUNT || '0', 10)
  const chargeFeeBy = process.env.NEXT_PUBLIC_KYBER_FEE_CHARGE_BY as 'currency_in' | 'currency_out' | undefined
  
  if (feeReceiver && feeAmount > 0 && (chargeFeeBy === 'currency_in' || chargeFeeBy === 'currency_out')) {
    return {
      feeReceiver,
      feeAmount,
      chargeFeeBy,
    }
  }
  return null
})()

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
  
  const params = useMemo(() => {
    if (!tokenIn || !tokenOut || !amountIn || !enabled) return null
    return { tokenIn, tokenOut, amountIn }
  }, [tokenIn, tokenOut, amountIn, enabled])

  const [route, setRoute] = useState<RouteSummary | null>(null)
  const [routerAddress, setRouterAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchRoute = useCallback(async () => {
    if (!params) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await getSwapRoute(
        CHAIN_NAMES.BSC,
        {
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          amountIn: params.amountIn,
        },
        process.env.KYBER_CLIENT_ID || 'DemoDEX',
        DEV_FEE_CONFIG
      )
      
      setRoute(data.routeSummary)
      setRouterAddress(data.routerAddress)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setRoute(null)
      setRouterAddress(null)
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchRoute()
  }, [fetchRoute])

  return { route, routerAddress, isLoading, error, refetch: fetchRoute }
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
  slippageTolerance = 50,
  enabled = true,
}: UseSwapBuildParams): UseSwapBuildResult {
  const { address } = useWallet()
  
  const [calldata, setCalldata] = useState<string | null>(null)
  const [transactionValue, setTransactionValue] = useState('0')
  const [amountOut, setAmountOut] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const build = useCallback(async () => {
    if (!routeSummary || !address || !enabled) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await buildSwapRoute(
        CHAIN_NAMES.BSC,
        {
          routeSummary,
          sender: address,
          recipient: address,
          slippageTolerance,
        },
        process.env.KYBER_CLIENT_ID || 'DemoDEX'
      )
      
      setCalldata(data.data)
      setTransactionValue(data.transactionValue)
      setAmountOut(data.amountOut)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setCalldata(null)
    } finally {
      setIsLoading(false)
    }
  }, [routeSummary, address, slippageTolerance, enabled])

  return { calldata, transactionValue, amountOut, isLoading, error, build }
}
