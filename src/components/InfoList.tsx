'use client'

import { useEffect } from 'react'
import {
    useAppKitState,
    useAppKitTheme,
    useAppKitEvents,
    useAppKitAccount,
    useWalletInfo
     } from '@reown/appkit/react'
import { useClientMounted } from "@/hooks/useClientMount";
import { useNetworkStore } from '@/store/networkStore';
import { KycManager } from './KycManager';

// Define the link style
const linkStyle = {
  color: '#0070f3', // Blue color
  textDecoration: 'underline',
};

export const InfoList = () => {
    // 
    const _kitTheme = useAppKitTheme();
    // 
    const _state = useAppKitState();
    const {address, caipAddress, isConnected} = useAppKitAccount();
    const events = useAppKitEvents()
    // 
    const _walletInfo = useWalletInfo()
    const mounted = useClientMounted();
    const { isMainnet, setNetwork, KYC_SBT_ADDRESS, EXPLORER_URL } = useNetworkStore();
    
    useEffect(() => {
        console.log("Events: ", events);
    }, [events]);

    useEffect(() => {
        if (caipAddress) {
            setNetwork(caipAddress);
        }
    }, [caipAddress, setNetwork]);

  return !mounted ? null : (
    <>
        <section>
            <h2>user info</h2>
                Address: {address}<br />
                {/* caip Address: {caipAddress}<br /> */}
                Connected: {isConnected.toString()}<br />
                Network: {isMainnet ? 'Mainnet (177)' : 'Testnet'}<br />
                Contract Address: <a 
                  href={`${EXPLORER_URL}/address/${KYC_SBT_ADDRESS}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  {KYC_SBT_ADDRESS}
                </a><br />

                GitHub: <a 
                  href="https://github.com/hunyuan-kyc/next-demo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  https://github.com/hunyuan-kyc/next-demo
                </a><br />

                ABI: <a 
                  href="https://github.com/hunyuan-kyc/next-demo/blob/master/src/abis/KycSBT.json" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={linkStyle}
                >
                  https://github.com/hunyuan-kyc/next-demo/blob/master/src/abis/KycSBT.json
                </a><br />

                Audit Report: <a 
                  href="/Smart Contract Audit Report 20250220.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={linkStyle}
                  download
                >
                  Download Audit Report
                </a>
        </section>

        {/* KYC Manager Section */}
        <section style={{ marginTop: '30px' }}>
          <KycManager />
        </section>
{/* 
        <section>
            <h2>Theme</h2>
            <pre>
                Theme: {kitTheme.themeMode}<br />
            </pre>
        </section>

        <section>
            <h2>State</h2>
            <pre>
                activeChain: {state.activeChain}<br />
                loading: {state.loading.toString()}<br />
                open: {state.open.toString()}<br />
            </pre>
        </section>

        <section>
            <h2>WalletInfo</h2>
            <pre>
                Name: {walletInfo.walletInfo?.name?.toString()}<br />
            </pre>
        </section> */}
    </>
  )
}
