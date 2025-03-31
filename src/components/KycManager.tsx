'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useNetworkStore } from '@/store/networkStore';
import { KycStatus, KycLevel, KycInfo } from '@/types/kyc';
import { createPublicClient, createWalletClient, custom } from 'viem';
import { hashkeyTestnet, hashkey } from '@reown/appkit/networks';
import KycSBTAbi from '@/abis/KycSBT.json';

// 定义以太坊提供者类型
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

// 不重新定义window.ethereum类型，而是在使用时进行类型断言
// @ts-ignore
type WindowWithEthereum = Window & { ethereum?: EthereumProvider };

// Button styles
const buttonStyle = {
  padding: '10px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  marginTop: '10px',
};

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
};

const inputStyle = {
  padding: '10px',
  border: '2px solid black',
  borderRadius: '6px',
  fontSize: '16px',
  width: '100%',
};

const kycSectionStyle = {
  marginTop: '20px',
  display: 'flex',
  gap: '10px',
};

const kycInfoStyle = {
  padding: '15px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  width: '100%',
};

// 使用内联样式而不是对象引用，避免类型问题
const ensInputGroupStyles = {
  position: 'relative' as const,
  display: 'flex' as const,
  alignItems: 'center' as const,
  flex: 1 as const,
};

const ensSuffixStyles = {
  position: 'absolute' as const,
  right: '10px',
  color: '#666',
  pointerEvents: 'none' as const,
  userSelect: 'none' as const,
};

export const KycManager = () => {
  const { address } = useAppKitAccount();
  const { isMainnet, KYC_SBT_ADDRESS } = useNetworkStore();
  
  const [ensNameWithoutSuffix, setEnsNameWithoutSuffix] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<KycLevel>(KycLevel.BASIC);
  // balance变量用于跟踪用户余额，虽然当前UI中未显示，但在后台更新以备将来使用
  //  - balance is updated but not displayed in UI
  const [balance, setBalance] = useState<bigint>(BigInt(0)); // 使用BigInt()代替字面量
  const [kycInfo, setKycInfo] = useState<KycInfo>({
    ensName: '',
    level: KycLevel.NONE,
    status: KycStatus.NONE,
    createTime: BigInt(0), // 使用BigInt()代替字面量
  });

  const getPublicClient = useCallback(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Please install MetaMask!');
    }
    return createPublicClient({
      chain: isMainnet ? hashkey : hashkeyTestnet,
      // @ts-ignore - 忽略类型错误
      transport: custom(window.ethereum as EthereumProvider)
    });
  }, [isMainnet]);

  const getWalletClient = useCallback(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Please install MetaMask!');
    }
    return createWalletClient({
      chain: isMainnet ? hashkey : hashkeyTestnet,
      // @ts-ignore - 忽略类型错误
      transport: custom(window.ethereum as EthereumProvider)
    });
  }, [isMainnet]);

  const checkKycStatus = useCallback(async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      const publicClient = getPublicClient();
      console.log('Using KYC address:', KYC_SBT_ADDRESS);
      
      const info = await publicClient.readContract({
        address: KYC_SBT_ADDRESS as `0x${string}`,
        abi: KycSBTAbi,
        functionName: 'getKycInfo',
        args: [address as `0x${string}`],
      }) as [string, number, number, bigint];

      console.log(info, 'info checkKycStatus');
      
      setKycInfo({
        ensName: info[0],
        level: info[1] as KycLevel,
        status: info[2] as KycStatus,
        createTime: info[3],
      });
    } catch (error) {
      console.error('Error checking KYC status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address, KYC_SBT_ADDRESS, getPublicClient]);

  const getBalance = useCallback(async () => {
    if (!address) return;
    
    try {
      const publicClient = getPublicClient();
      const newBalance = await publicClient.getBalance({ 
        address: address as `0x${string}` 
      });
      setBalance(newBalance);
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  }, [address, getPublicClient]);

  const getTotalFee = async () => {
    try {
      const publicClient = getPublicClient();
      const fee = await publicClient.readContract({
        address: KYC_SBT_ADDRESS as `0x${string}`,
        abi: KycSBTAbi,
        functionName: 'getTotalFee',
      }) as bigint;
      return fee;
    } catch (error) {
      console.error('Error getting total fee:', error);
      throw error;
    }
  };

  const requestKyc = async () => {
    if (!ensNameWithoutSuffix) {
      alert('Please enter an ENS name');
      return;
    }

    const fullEnsName = `${ensNameWithoutSuffix}.hsk`;

    try {
      setIsProcessing(true);
      const walletClient = getWalletClient();
      const [walletAddress] = await walletClient.requestAddresses();

      // Get total fee
      const totalFee = await getTotalFee();

      const publicClient = getPublicClient();
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS as `0x${string}`,
        abi: KycSBTAbi,
        functionName: 'requestKyc',
        args: [fullEnsName, selectedLevel],
        account: walletAddress,
        value: totalFee
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction Hash:', hash);
      
      alert('KYC request submitted. Waiting for confirmation...');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction confirmed:', receipt);
      alert('KYC request confirmed!');

      await checkKycStatus();
      await getBalance();
    } catch (error: unknown) {
      console.error('Error requesting KYC:', error);
      alert('Error requesting KYC: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessing(false);
    }
  };

  const revokeKyc = async () => {
    if (!address) return;
    
    try {
      setIsProcessing(true);
      const walletClient = getWalletClient();
      const [walletAddress] = await walletClient.requestAddresses();

      const publicClient = getPublicClient();
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS as `0x${string}`,
        abi: KycSBTAbi,
        functionName: 'revokeKyc',
        args: [address as `0x${string}`],
        account: walletAddress
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction Hash:', hash);
      
      alert('KYC revoke submitted. Waiting for confirmation...');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction confirmed:', receipt);
      alert('KYC revoked successfully!');

      // Refresh KYC status
      await checkKycStatus();
    } catch (error: unknown) {
      console.error('Error revoking KYC:', error);
      alert('Error revoking KYC: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessing(false);
    }
  };

  const restoreKyc = async () => {
    if (!address) return;
    
    try {
      setIsProcessing(true);
      const walletClient = getWalletClient();
      const [walletAddress] = await walletClient.requestAddresses();

      const publicClient = getPublicClient();
      const { request } = await publicClient.simulateContract({
        address: KYC_SBT_ADDRESS as `0x${string}`,
        abi: KycSBTAbi,
        functionName: 'restoreKyc',
        args: [address as `0x${string}`],
        account: walletAddress
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction Hash:', hash);
      
      alert('KYC restore submitted. Waiting for confirmation...');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction confirmed:', receipt);
      alert('KYC restored successfully!');

      // Refresh KYC status
      await checkKycStatus();
    } catch (error: unknown) {
      console.error('Error restoring KYC:', error);
      alert('Error restoring KYC: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessing(false);
    }
  };

  const getKycStatusText = (status: KycStatus) => {
    const statusMap: Record<KycStatus, string> = {
      [KycStatus.NONE]: 'None',
      [KycStatus.APPROVED]: 'Approved',
      [KycStatus.REVOKED]: 'Revoked'
    };
    return statusMap[status] || 'Unknown';
  };

  const getKycLevelText = (level: KycLevel) => {
    const levelMap: Record<KycLevel, string> = {
      [KycLevel.NONE]: 'None',
      [KycLevel.BASIC]: 'Basic',
      [KycLevel.ADVANCED]: 'Advanced',
      [KycLevel.PREMIUM]: 'Premium',
      [KycLevel.ULTIMATE]: 'Ultimate'
    };
    return levelMap[level] || 'Unknown';
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return 'N/A'; // 使用BigInt()代替字面量
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const renderLevelOptions = () => {
    return (
      <select 
        value={selectedLevel} 
        onChange={(e) => setSelectedLevel(Number(e.target.value) as KycLevel)}
        style={{
          padding: '10px',
          border: '2px solid black',
          borderRadius: '6px',
          fontSize: '16px',
          marginRight: '10px'
        }}
      >
        <option value={KycLevel.BASIC}>Basic</option>
        <option value={KycLevel.ADVANCED}>Advanced</option>
        <option value={KycLevel.PREMIUM}>Premium</option>
        <option value={KycLevel.ULTIMATE}>Ultimate</option>
      </select>
    );
  };

  // Effect to check KYC status and balance when address changes
  useEffect(() => {
    if (address) {
      checkKycStatus();
      getBalance();
    } else {
      setIsLoading(false);
    }
  }, [address, isMainnet, KYC_SBT_ADDRESS, checkKycStatus, getBalance]);

  // Effect to watch for block changes to update balance
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum || !address) return;
    
    try {
      const publicClient = getPublicClient();
      const unwatch = publicClient.watchBlocks({
        onBlock: async () => {
          await getBalance();
        },
      });
      
      return () => {
        unwatch();
      };
    } catch (error) {
      console.error('Error setting up block watcher:', error);
    }
  }, [address, isMainnet, getPublicClient, getBalance]);

  // Effect to watch for account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    const handleAccountsChanged = () => {
      checkKycStatus();
      getBalance();
    };
    
    // 类型断言
    // @ts-ignore - 忽略类型错误
    const ethereum = window.ethereum as EthereumProvider;
    ethereum.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      if (window.ethereum) {
        // @ts-ignore - 忽略类型错误
        const ethereum = window.ethereum as EthereumProvider;
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [checkKycStatus, getBalance]);

  return (
    <div>
      <h2>KYC Manager</h2>
      
      {/* KYC Status Section */}
      {isLoading ? (
        <div style={kycSectionStyle}>
          <p>Loading KYC status...</p>
        </div>
      ) : kycInfo.ensName ? (
        <div style={kycSectionStyle}>
          <div style={kycInfoStyle}>
            <h3>KYC Information</h3>
            <p>ENS Name: {kycInfo.ensName}</p>
            <p>Status: {getKycStatusText(kycInfo.status)}</p>
            <p>Level: {getKycLevelText(kycInfo.level)}</p>
            <p>Created: {formatDate(kycInfo.createTime)}</p>
            
            {/* Show restore button if revoked, otherwise show revoke button */}
            {kycInfo.status === KycStatus.REVOKED ? (
              <button 
                onClick={restoreKyc} 
                disabled={isProcessing}
                style={isProcessing ? disabledButtonStyle : buttonStyle}
              >
                {isProcessing ? 'Processing...' : 'Restore KYC'}
              </button>
            ) : (
              <button 
                onClick={revokeKyc} 
                disabled={isProcessing}
                style={isProcessing ? disabledButtonStyle : buttonStyle}
              >
                {isProcessing ? 'Processing...' : 'Revoke KYC'}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Request KYC Section */
        <div style={kycSectionStyle}>
          <div style={ensInputGroupStyles}>
            <input 
              value={ensNameWithoutSuffix}
              onChange={(e) => setEnsNameWithoutSuffix(e.target.value)}
              placeholder="Enter ENS name"
              type="text"
              style={inputStyle}
            />
            <span style={ensSuffixStyles}>.hsk</span>
          </div>
          {renderLevelOptions()}
          <button 
            onClick={requestKyc} 
            disabled={isProcessing}
            style={isProcessing ? disabledButtonStyle : buttonStyle}
          >
            {isProcessing ? 'Processing...' : 'Request KYC'}
          </button>
        </div>
      )}
    </div>
  );
};