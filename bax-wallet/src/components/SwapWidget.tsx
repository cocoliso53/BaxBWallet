import { useEffect, useState, useRef } from 'react'
import { createCowSwapWidget, CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-lib'
import { useWalletClient } from 'wagmi'

// Helper function that adapts the wallet client to an EIP‑1193 
// required by cowswap, it works but double check before using in prod
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createEthereumProvider(walletClient: any) {
    return {
      on(event: string, listener: (args: unknown) => void): void {
        if (typeof walletClient.on === 'function') {
          walletClient.on(event, listener)
        }
      },
      async request<T>(params: { id: number; method: string; params: unknown[] }): Promise<T> {
        return walletClient.request(params)
      },
      async enable(): Promise<void> {
        await walletClient.request({
          id: Date.now(),
          method: 'eth_requestAccounts',
          params: []
        })
      }
    }
  }

export const SwapWidget = () => {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (containerRef.current && mounted && walletClient) {

      const provider = createEthereumProvider(walletClient)

      const params: CowSwapWidgetParams = {
        appCode: "BaxB-Wallet",
        width: "100%",
        height: "500px",
        chainId: 11155111,
        tokenLists: [
          "https://files.cow.fi/tokens/CoinGecko.json",
          "https://files.cow.fi/tokens/CowSwap.json"
        ],
        tradeType: TradeType.SWAP,
        standaloneMode: false,
        theme: "light",
      }

      createCowSwapWidget(containerRef.current, { 
        params, 
        provider 
      })
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Swap Tokens</h2>
      <div 
        ref={containerRef} 
        style={{
          height: '500px',
          position: 'relative',
          zIndex: 10
        }}
      />
    </div>
  )
}