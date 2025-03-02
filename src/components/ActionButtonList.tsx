'use client'
import { useDisconnect, useAppKit, useAppKitNetwork } from '@reown/appkit/react'
import { networks } from '@/config'
import { useNetwork } from '@/hooks/useNetwork'

export const ActionButtonList = () => {
    const { disconnect } = useDisconnect();
    const { open } = useAppKit();
    const { switchNetwork } = useAppKitNetwork();
    const { isMainnet } = useNetwork();

    const handleDisconnect = async () => {
      try {
        await disconnect();
      } catch (error) {
        console.error("Failed to disconnect:", error);
      }
    }

    // 根据当前网络决定切换到哪个网络
    const targetNetwork = isMainnet ? networks[1] : networks[0];
    
    // 切换按钮文本
    const switchButtonText = isMainnet ? 'switch to testnet' : 'switch to mainnet';

    return (
      <div>
          <button onClick={() => open()}>Open</button>
          <button onClick={handleDisconnect}>Disconnect</button>
          <button onClick={() => switchNetwork(targetNetwork)}>{switchButtonText}</button>
      </div>
    )
}
