import { useNetworkStore } from '@/store/networkStore';

/**
 * Custom hook to access network information
 * @returns Object containing network information
 */
export const useNetwork = () => {
  const { isMainnet, chainId } = useNetworkStore();
  
  return {
    isMainnet,
    chainId,
    networkName: isMainnet ? 'Mainnet' : 'Testnet',
    networkId: chainId?.split(':')[1] || null,
  };
}; 