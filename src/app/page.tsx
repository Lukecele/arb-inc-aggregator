'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-8">KyberSwap DEX</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Decentralized exchange powered by KyberSwap Aggregator on Binance Smart Chain
      </p>
      <Link
        href="/swap"
        className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
      >
        Start Trading
      </Link>
    </main>
  )
}
