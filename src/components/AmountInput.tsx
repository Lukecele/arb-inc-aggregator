'use client'

import { useState, useEffect } from 'react'
import { TokenSelector } from './TokenSelector'
import { getTokenByAddress } from '@/config/tokens'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  tokenAddress: string
  onTokenChange: (address: string) => void
  label?: string
  excludeToken?: string
  readOnly?: boolean
  balance?: string
}

export function AmountInput({
  value,
  onChange,
  tokenAddress,
  onTokenChange,
  label,
  excludeToken,
  readOnly = false,
  balance,
}: AmountInputProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const token = getTokenByAddress(tokenAddress)

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (/^\d*\.?\d*$/.test(newValue)) {
      setDisplayValue(newValue)
      onChange(newValue)
    }
  }

  const setMaxBalance = () => {
    if (balance) {
      setDisplayValue(balance)
      onChange(balance)
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex justify-between mb-2">
        {label && <span className="text-sm text-gray-500">{label}</span>}
        {balance && (
          <span className="text-sm text-gray-500">
            Balance: {parseFloat(balance).toFixed(4)}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="0.0"
          readOnly={readOnly}
          className="flex-1 text-2xl font-medium bg-transparent outline-none"
        />
        <TokenSelector
          selectedToken={tokenAddress}
          onTokenSelect={onTokenChange}
          excludeToken={excludeToken}
        />
      </div>
      
      {balance && !readOnly && (
        <button
          onClick={setMaxBalance}
          className="text-xs text-primary-600 hover:text-primary-700 mt-2"
        >
          MAX
        </button>
      )}
    </div>
  )
}
