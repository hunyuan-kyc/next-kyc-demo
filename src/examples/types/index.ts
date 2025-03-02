export enum KycLevel {
  NONE,
  BASIC,
  ADVANCED,
  PREMIUM,
  ULTIMATE
}

export enum KycStatus {
  NONE,
  APPROVED,
  REVOKED
}

export interface KycInfo {
  ensName: string
  level: KycLevel
  status: KycStatus
  createTime: bigint
} 