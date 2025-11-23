'use server'

import { getVerifierContract } from '@/lib/blockchain'

const BLOCKS_TO_CHECK = 10 // Check last 10 blocks

export interface RefugeeDiscountEligibilityEvent {
    passportHash: string
    nationality: string
    isEligibleNationality: boolean
    isRefugee: boolean
    isEligibleForDiscount: boolean
    blockNumber: number
    transactionHash: string
}

export async function checkEligibility(): Promise<RefugeeDiscountEligibilityEvent | null> {
    try {
        const contract = getVerifierContract()
        // In a server context, we might need to ensure the provider is ready or handle it differently
        // but getVerifierContract uses getCeloSepoliaProvider which returns a JsonRpcProvider
        // which should work fine in Node.js

        const provider = contract.runner?.provider

        if (!provider) {
            throw new Error('Provider not available')
        }

        // Get current block number
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - BLOCKS_TO_CHECK)

        // Query for RefugeeDiscountEligibility events
        const filter = contract.filters.RefugeeDiscountEligibility()
        const events = await contract.queryFilter(filter, fromBlock, currentBlock)

        if (events.length > 0) {
            // Get the most recent event
            const latestEvent = events[events.length - 1]

            // Type guard: check if it's an EventLog with args property
            if ('args' in latestEvent && latestEvent.args && Array.isArray(latestEvent.args) && latestEvent.args.length >= 5) {
                const eventData: RefugeeDiscountEligibilityEvent = {
                    passportHash: String(latestEvent.args[0]),
                    nationality: String(latestEvent.args[1]),
                    isEligibleNationality: Boolean(latestEvent.args[2]),
                    isRefugee: Boolean(latestEvent.args[3]),
                    isEligibleForDiscount: Boolean(latestEvent.args[4]),
                    blockNumber: latestEvent.blockNumber,
                    transactionHash: latestEvent.transactionHash,
                }

                return eventData
            }
        }

        return null
    } catch (error) {
        console.error('Error in checkEligibility Server Action:', error)
        throw new Error('Failed to check eligibility on server')
    }
}
