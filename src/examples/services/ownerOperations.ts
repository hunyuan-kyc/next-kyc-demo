import { createPublicClient, createWalletClient, http, type Address, type WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hashkey } from 'viem/chains'
import KycSBTAbi from '@/abis/KycSBT.json'

// 使用Next.js环境变量
const isTestnet = false
const KYC_SBT_ADDRESS = isTestnet 
  ? (process.env.NEXT_PUBLIC_KYC_SBT_ADDRESS_TEST || '0xA45f42F09A7Ae50e556467cf65cF3Cf45711114E') as `0x${string}` 
  : (process.env.NEXT_PUBLIC_KYC_SBT_ADDRESS || '0x0f362c05fb3Fadca687648F412abE2A6d6450D70') as `0x${string}`;

const RPC_URL = isTestnet
  ? (process.env.NEXT_PUBLIC_RPC_URL_TEST || 'https://hk-testnet.rpc.alt.technology')
  : (process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.hsk.xyz/');

const publicClient = createPublicClient({
  chain: hashkey,
  transport: http(RPC_URL)
})

export class OwnerOperations {
  private client: WalletClient
  private account: Address

  constructor(privateKey: string) {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    this.account = account.address
    this.client = createWalletClient({
      account,
      chain: hashkey,
      transport: http(RPC_URL)
    })
  }

  async setRegistrationFee(newFee: string) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS as `0x${string}`,
        abi: KycSBTAbi,
        functionName: 'setRegistrationFee',
        args: [newFee],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Registration fee updated:', receipt)
      return receipt
    } catch (error) {
      console.error('Error setting registration fee:', error)
      throw error
    }
  }

  async setMinNameLength(newLength: bigint) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'setMinNameLength',
        args: [newLength],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Min name length updated:', receipt)
      return receipt
    } catch (error) {
      console.error('Error setting min name length:', error)
      throw error
    }
  }

  async setSuffix(newSuffix: string) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'setSuffix',
        args: [newSuffix],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Suffix updated:', receipt)
      return receipt
    } catch (error) {
      console.error('Error setting suffix:', error)
      throw error
    }
  }

  async setENSAndResolver(ensAddress: Address, resolverAddress: Address) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'setENSAndResolver',
        args: [ensAddress, resolverAddress],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('ENS and Resolver updated:', receipt)
      return receipt
    } catch (error) {
      console.error('Error setting ENS and Resolver:', error)
      throw error
    }
  }

  async transferOwnership(newOwner: Address) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'transferOwnership',
        args: [newOwner],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Ownership transferred:', receipt)
      return receipt
    } catch (error) {
      console.error('Error transferring ownership:', error)
      throw error
    }
  }

  async withdrawFees() {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'withdrawFees',
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Fees withdrawn:', receipt)
      return receipt
    } catch (error) {
      console.error('Error withdrawing fees:', error)
      throw error
    }
  }

  async setEnsFee(newFee: bigint) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'setEnsFee',
        args: [newFee],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('ENS fee updated:', receipt)
      return receipt
    } catch (error) {
      console.error('Error setting ENS fee:', error)
      throw error
    }
  }

  async getContractConfig() {
    try {
      const [registrationFee, ensFee, minLength, suffix, validityPeriod] = await Promise.all([
        publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'registrationFee'
        }),
        publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'ensFee'
        }),
        publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'minNameLength'
        }),
        publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'suffix'
        }),
        publicClient.readContract({
          address: KYC_SBT_ADDRESS,
          abi: KycSBTAbi,
          functionName: 'validityPeriod'
        })
      ])

      return {
        registrationFee,
        ensFee,
        minNameLength: minLength,
        suffix,
        validityPeriod
      }
    } catch (error) {
      console.error('Error getting contract config:', error)
      throw error
    }
  }

  /**
   * Approve ENS name for a user
   * @param user - User address
   * @param ensName - ENS name to approve (without suffix)
   */
  async approveEnsName(user: Address, ensName: string) {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'approveEnsName',
        args: [user, ensName],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('ENS name approved:', receipt)
      return receipt
    } catch (error) {
      console.error('Error approving ENS name:', error)
      throw error
    }
  }

  /**
   * Check if ENS name is approved for a user
   * @param user - User address
   * @param ensName - ENS name to check (without suffix)
   * @returns boolean indicating if the ENS name is approved
   */
  async isEnsNameApproved(user: Address, ensName: string): Promise<boolean> {
    try {
      const isApproved = await publicClient.readContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'isEnsNameApproved',
        args: [user, ensName]
      })
      return isApproved as boolean
    } catch (error) {
      console.error('Error checking ENS name approval:', error)
      throw error
    }
  }
} 