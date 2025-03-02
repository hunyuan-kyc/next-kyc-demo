import { createPublicClient, createWalletClient, http, type Address, type WalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { hashkey } from 'viem/chains'
import KycSBTAbi from '@/abis/KycSBT.json'
import { type KycInfo, KycLevel, KycStatus } from '../types/index'

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

export class UserOperations {
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

  async getTotalFee() {
    try { 
      const fee = await publicClient.readContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'getTotalFee',
      })
      console.log('Total fee:', fee)
      return fee as bigint
    } catch (error) {
      console.error('Error getting total fee:', error)
      throw error
    }
  }

  async requestKyc(ensName: string) {
    try {
      const totalFee = await this.getTotalFee()
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'requestKyc',
        args: [ensName],
        account: this.account,
        value: totalFee
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('KYC requested:', receipt)
      return receipt
    } catch (error) {
      console.error('Error requesting KYC:', error)
      throw error
    }
  }

  async revokeKyc() {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'revokeKyc',
        args: [this.account],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('KYC revoked:', receipt)
      return receipt
    } catch (error) {
      console.error('Error revoking KYC:', error)
      throw error
    }
  }

  async restoreKyc() {
    try {
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'restoreKyc',
        args: [this.account],
        account: this.account
      })

      const hash = await this.client.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('KYC restored:', receipt)
      return receipt
    } catch (error) {
      console.error('Error restoring KYC:', error)
      throw error
    }
  }

  async getKycInfo(address: Address) {
    try {
      const info = await publicClient.readContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'getKycInfo',
        args: [address],
      }) as [string, number, number, bigint]

      const kycInfo: KycInfo = {
        ensName: info[0],
        level: info[1] as KycLevel,
        status: info[2] as KycStatus,
        createTime: info[3]
      }

      return kycInfo
    } catch (error) {
      console.error('Error getting KYC info:', error)
      throw error
    }
  }

  async isHuman(address: Address) {
    try {
      const [isValid, level] = await publicClient.readContract({
        address: KYC_SBT_ADDRESS,
        abi: KycSBTAbi,
        functionName: 'isHuman',
        args: [address],
      }) as [boolean, number]

      return {
        isValid,
        level: level as KycLevel
      }
    } catch (error) {
      console.error('Error checking human status:', error)
      throw error
    }
  }
} 