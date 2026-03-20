'use client'

import { useState, useCallback } from 'react'
import { useWallet } from './useWallet'
import {
  BSC_CHAIN,
  KYBER_ROUTER_ADDRESS,
} from '@/config/constants'
import { RouteSummary } from '@/types/kyberswap'
import { isNativeToken } from '@/config/tokens'
import { usePublicClient, useWalletClient } from 'wagmi'

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
] as const

interface UseSwapExecuteParams {
  routeSummary: RouteSummary | null
  calldata: string | null
  transactionValue: string
  tokenIn: string
  amountIn: string
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

export function useSwapExecute({
  routeSummary,
  calldata,
  transactionValue,
  tokenIn,
  amountIn,
  onSuccess,
  onError,
}: UseSwapExecuteParams) {
  const { address, isConnected } = useWallet()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const executeSwap = useCallback(async () => {
    if (!address || !routeSummary || !calldata || !publicClient || !walletClient) {
      throw new Error('Missing required parameters')
    }

    setIsPending(true)
    setError(null)

    try {
      const isNativeIn = isNativeToken(tokenIn)
      
      if (!isNativeIn) {
        const { request } = await publicClient.simulateContract({
          address: tokenIn as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [KYBER_ROUTER_ADDRESS as `0x${string}`, BigInt(amountIn)],
          account: address as `0x${string}`,
        })
        await walletClient.writeContract(request)
        
        await publicClient.waitForTransactionReceipt({ hash: request.address as `0x${string}` })
      }

      const hash = await walletClient.sendTransaction({
        to: KYBER_ROUTER_ADDRESS as `0x${string}`,
        data: calldata as `0x${string}`,
        value: isNativeIn ? BigInt(transactionValue) : BigInt(0),
        account: address as `0x${string}`,
        chain: BSC_CHAIN,
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      if (receipt.status === 'success') {
        onSuccess?.(hash)
      } else {
        throw new Error('Transaction reverted')
      }

      return hash
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Swap failed')
      setError(error)
      onError?.(error)
      throw error
    } finally {
      setIsPending(false)
    }
  }, [address, routeSummary, calldata, transactionValue, tokenIn, amountIn, publicClient, walletClient, onSuccess, onError])

  return {
    executeSwap,
    isPending,
    error,
    isReady: !!address && !!routeSummary && !!calldata,
  }
}
