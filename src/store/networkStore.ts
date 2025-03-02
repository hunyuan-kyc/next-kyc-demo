import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NetworkState = {
  isMainnet: boolean;
  chainId: string | null;
  KYC_SBT_ADDRESS: string;
  KYC_RESOLVER_ADDRESS: string;
  EXPLORER_URL: string;
  RPC_URL: string;
  setNetwork: (chainId: string | null) => void;
};

export const useNetworkStore = create<NetworkState>()(
  persist(
    //  - _get is unused but required by the API
    (set, _get) => ({
      isMainnet: false,
      chainId: null,
      KYC_SBT_ADDRESS: process.env.NEXT_PUBLIC_KYC_SBT_ADDRESS_TEST || '',
      KYC_RESOLVER_ADDRESS: process.env.NEXT_PUBLIC_KYC_RESOLVER_ADDRESS_TEST || '',
      EXPLORER_URL: process.env.NEXT_PUBLIC_EXPLORER_URL_TEST || '',
      RPC_URL: process.env.NEXT_PUBLIC_RPC_URL_TEST || '',
      setNetwork: (chainId: string | null) => {
        const isMainnet = chainId?.split(':')[1] === '177';
        
        // Update all values based on the network
        set({
          isMainnet,
          chainId,
          KYC_SBT_ADDRESS: isMainnet 
            ? process.env.NEXT_PUBLIC_KYC_SBT_ADDRESS || ''
            : process.env.NEXT_PUBLIC_KYC_SBT_ADDRESS_TEST || '',
          KYC_RESOLVER_ADDRESS: isMainnet 
            ? process.env.NEXT_PUBLIC_KYC_RESOLVER_ADDRESS || ''
            : process.env.NEXT_PUBLIC_KYC_RESOLVER_ADDRESS_TEST || '',
          EXPLORER_URL: isMainnet 
            ? process.env.NEXT_PUBLIC_EXPLORER_URL || ''
            : process.env.NEXT_PUBLIC_EXPLORER_URL_TEST || '',
          RPC_URL: isMainnet 
            ? process.env.NEXT_PUBLIC_RPC_URL || ''
            : process.env.NEXT_PUBLIC_RPC_URL_TEST || ''
        });
      },
    }),
    {
      name: 'network-storage', // unique name for localStorage
    }
  )
); 