// src/components/BatchTransfer.tsx
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { writeContract } from '@wagmi/core'
import { config } from '../config/web3'

const BATCH_TRANSFER_ABI = [
	{
		"inputs": [
			{
				"internalType": "contract IERC20",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "address[]",
				"name": "recipients",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			}
		],
		"name": "batchTransferERC20",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "recipients",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			}
		],
		"name": "batchTransferETH",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "SafeERC20FailedOperation",
		"type": "error"
	}
]

const BATCH_TRANSFER_ADDRESS = '0x09579e61a95792be2440fe2da011ec47fbfc9861' as `0x${string}`

export const BatchTransfer = () => {
 const [mounted, setMounted] = useState(false)
 const [recipients, setRecipients] = useState<string[]>([])
 const [amounts, setAmounts] = useState<string[]>([])
 const [isERC20, setIsERC20] = useState(false)
 const [tokenAddress, setTokenAddress] = useState('')
 const [isLoading, setIsLoading] = useState(false)

 useEffect(() => {
   setMounted(true)
 }, [])

 const handleTransfer = async () => {
   try {
     setIsLoading(true)
     if (isERC20) {
       await writeContract(config, {
         address: BATCH_TRANSFER_ADDRESS,
         abi: BATCH_TRANSFER_ABI,
         functionName: 'batchTransferERC20',
         args: [tokenAddress, recipients, amounts]
       })
     } else {
       await writeContract(config, {
         address: BATCH_TRANSFER_ADDRESS,
         abi: BATCH_TRANSFER_ABI,
         functionName: 'batchTransferETH',
         args: [recipients, amounts]
       })
     }
   } catch (error) {
     console.error('Transfer failed:', error)
   } finally {
     setIsLoading(false)
   }
 }

 if (!mounted) return null

 return (
   <div className="bg-white shadow rounded-lg p-6">
     <h2 className="text-xl font-semibold mb-6">Batch Transfer</h2>
     
     {/* Token Type Selection */}
     <div className="mb-4">
       <div className="flex space-x-4">
         <button 
           className={`px-4 py-2 rounded ${!isERC20 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
           onClick={() => setIsERC20(false)}
         >
           ETH
         </button>
         <button 
           className={`px-4 py-2 rounded ${isERC20 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
           onClick={() => setIsERC20(true)}
         >
           ERC20
         </button>
       </div>
     </div>

     {/* ERC20 Token Address Input */}
     {isERC20 && (
       <div className="mb-4">
         <input
           type="text"
           placeholder="Token Address"
           className="w-full p-2 border rounded"
           value={tokenAddress}
           onChange={(e) => setTokenAddress(e.target.value)}
         />
       </div>
     )}

     {/* Recipients Input */}
     <div className="mb-4">
       <textarea
         placeholder="Enter addresses (one per line)"
         className="w-full p-2 border rounded"
         rows={5}
         onChange={(e) => {
           const lines = e.target.value.split('\n').filter(line => line.trim())
           setRecipients(lines)
         }}
       />
     </div>

     {/* Amounts Input */}
     <div className="mb-4">
       <textarea
         placeholder="Enter amounts (one per line)"
         className="w-full p-2 border rounded"
         rows={5}
         onChange={(e) => {
           const lines = e.target.value.split('\n').filter(line => line.trim())
           setAmounts(lines)
         }}
       />
     </div>

     {/* Transfer Button */}
     <button
       className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:bg-gray-300"
       onClick={handleTransfer}
       disabled={isLoading}
     >
       {isLoading ? 'Processing...' : 'Transfer'}
     </button>
   </div>
 )
}