'use client'

import { useState, useEffect } from 'react'
import { AmountInput } from './AmountInput'
import { TokenSelector } from './TokenSelector'
import { WalletConnector } from './WalletConnector'
import { useWallet, useTokenBalance } from '@/hooks'
import { useSwapRoute } from '@/hooks/useSwapRoute'
import { NATIVE_TOKEN_ADDRESS } from '@/config/constants'
import { getTokenByAddress } from '@/config/tokens'

export function SwapForm() {
  const { address, isConnected, connect, connectors } = useWallet()
  
  const [tokenIn, setTokenIn] = useState(NATIVE_TOKEN_ADDRESS)
  const [tokenOut, setTokenOut] = useState('0x55d398326f99059fF775485246999027B3197955')
  const [amountIn, setAmountIn] = useState('')
  const [slippage, setSlippage] = useState('0.5')

  const { balance: balanceIn } = useTokenBalance({ tokenAddress: tokenIn })
  const { balance: balanceOut } = useTokenBalance({ tokenAddress: tokenOut })

  const { route, isLoading, error, refetch } = useSwapRoute({
    tokenIn,
    tokenOut,
    amountIn: amountIn ? BigInt(Math.round(parseFloat(amountIn) * 1e18)).toString() : '0',
    enabled: !!amountIn && parseFloat(amountIn) > 0,
  })

  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      const timer = setTimeout(() => refetch(), 500)
      return () => clearTimeout(timer)
    }
  }, [amountIn, tokenIn, tokenOut, refetch])

  const handleSwapTokens = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn('')
  }

  const formatAmount = (wei: string, decimals: number = 18) => {
    if (!wei || wei === '0') return '0.0'
    const num = parseFloat(wei) / Math.pow(10, decimals)
    return num.toFixed(4)
  }

  const slippageBips = Math.round(parseFloat(slippage) * 100)
  const canSwap = isConnected && amountIn && parseFloat(amountIn) > 0 && route

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Swap</h1>
        <WalletConnector />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <AmountInput
          label="You Pay"
          value={amountIn}
          onChange={setAmountIn}
          tokenAddress={tokenIn}
          onTokenChange={setTokenIn}
          excludeToken={tokenOut}
          balance={balanceIn || undefined}
        />

        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>

        <AmountInput
          label="You Receive"
          value={route ? formatAmount(route.amountOut) : ''}
          onChange={() => {}}
          tokenAddress={tokenOut}
          onTokenChange={setTokenOut}
          excludeToken={tokenIn}
          readOnly
        />

        {route && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Rate</span>
              <span>1 {getTokenByAddress(tokenIn)?.symbol} = {amountIn && parseFloat(amountIn) > 0 ? formatAmount(BigInt(Math.round(parseFloat(route.amountOut) * 1e18 / parseFloat(amountIn))).toString()) : '0.0'} {getTokenByAddress(tokenOut)?.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Price Impact</span>
              <span className="text-green-600">{'<'} 0.01%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Gas</span>
              <span>${(parseFloat(route.gasUsd)).toFixed(2)}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error.message}
          </div>
        )}

        <button
          onClick={() => {
            if (!isConnected && connectors[0]) {
              // @ts-expect-error wagmi v2 connect mutation
              connect({ connector: connectors[0] })
            }
          }}
          disabled={isConnected && !canSwap}
          className="w-full mt-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {!isConnected
            ? 'Connect Wallet'
            : !amountIn || parseFloat(amountIn) === 0
            ? 'Enter an amount'
            : isLoading
            ? 'Finding best route...'
            : !route
            ? 'Select token pair'
            : 'Swap'}
        </button>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Slippage Tolerance</span>
          <div className="flex gap-2">
            {['0.1', '0.5', '1.0'].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`px-3 py-1 rounded-lg ${slippage === s ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'}`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
