'use client'

import { useReadContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { NATIVE_TOKEN_ADDRESS } from '@/config/constants'
import { getTokenByAddress } from '@/config/tokens'

const ERC20_BALANCE_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

interface UseTokenBalanceProps {
  tokenAddress: string
  enabled?: boolean
}

export function useTokenBalance({ tokenAddress, enabled = true }: UseTokenBalanceProps) {
  const { address } = useAccount()

  const isNative = tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
  const token = getTokenByAddress(tokenAddress)

  const { data: rawBalance, isLoading, error, refetch } = useReadContract({
    address: isNative ? undefined : (tokenAddress as `0x${string}`),
    abi: isNative ? undefined : ERC20_BALANCE_ABI,
    functionName: 'balanceOf',
    args: isNative ? undefined : [address as `0x${string}`],
    query: {
      enabled: !!address && enabled,
    },
  })

  const formattedBalance = rawBalance !== undefined && rawBalance !== null
    ? formatUnits(rawBalance as bigint, token?.decimals || 18)
    : null

  return {
    balance: formattedBalance,
    rawBalance: rawBalance?.toString() || '0',
    isLoading,
    error,
    refetch,
  }
}
