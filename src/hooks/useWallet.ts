'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { BSC_CHAIN } from '@/config/constants'

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  const isWrongNetwork = isConnected && chainId !== BSC_CHAIN.id

  const connectWallet = async (connectorIndex?: number) => {
    if (connectorIndex !== undefined) {
      connect({ connector: connectors[connectorIndex] })
    } else {
      const injected = connectors.find((c) => c.id === 'injected')
      if (injected) {
        connect({ connector: injected })
      }
    }
  }

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isPending,
    chainId,
    isWrongNetwork,
    connect: connectWallet,
    disconnect,
    connectors,
  }
}
