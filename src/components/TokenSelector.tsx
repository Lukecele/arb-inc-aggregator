'use client'

import { useState, useRef, useEffect } from 'react'
import { Token } from '@/types/token'
import { BSC_TOKENS, searchTokens, getTokenByAddress } from '@/config/tokens'

interface TokenSelectorProps {
  selectedToken: string
  onTokenSelect: (address: string) => void
  excludeToken?: string
  label?: string
}

export function TokenSelector({ selectedToken, onTokenSelect, excludeToken, label }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  const selectedTokenData = getTokenByAddress(selectedToken)
  const filteredTokens = searchTokens(search).filter(t => t.address !== excludeToken)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      {label && <span className="text-sm text-gray-500 mb-1 block">{label}</span>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        {selectedTokenData?.logoURI && (
          <img src={selectedTokenData.logoURI} alt="" className="w-6 h-6 rounded-full" />
        )}
        <span className="font-medium">{selectedTokenData?.symbol || 'Select'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div ref={modalRef} className="absolute z-50 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => {
                  onTokenSelect(token.address)
                  setIsOpen(false)
                  setSearch('')
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {token.logoURI && (
                  <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                )}
                <div className="text-left">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-sm text-gray-500">{token.name}</div>
                </div>
              </button>
            ))}
            
            {filteredTokens.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">No tokens found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
