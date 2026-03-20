import { SwapForm } from '@/components'

export default function SwapPage() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Swap</h2>
        <p className="text-sm text-gray-500">Trade tokens at the best rates via KyberSwap</p>
      </div>
      <SwapForm />
    </main>
  )
}
