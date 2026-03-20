'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { BSC_CHAIN } from '@/config/constants'

export function WalletConnector() {
  const { address, isConnected, isConnecting, isWrongNetwork, connect, disconnect, connectors } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-sm font-mono">{truncatedAddress}</span>
          {isWrongNetwork && (
            <span className="px-2 py-0.5 text-xs bg-red-500 rounded">Wrong Network</span>
          )}
          {!isWrongNetwork && (
            <span className="px-2 py-0.5 text-xs bg-green-500 rounded">{BSC_CHAIN.name}</span>
          )}
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <a
              href={`https://bscscan.com/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              View on BscScan
            </a>
            <button
              onClick={() => {
                disconnect()
                setShowDropdown(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => connect(0)}
      disabled={isConnecting}
      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
