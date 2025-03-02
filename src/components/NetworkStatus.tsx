'use client'

import { useNetwork } from '@/hooks/useNetwork';

export const NetworkStatus = () => {
  const { isMainnet, networkName, networkId } = useNetwork();
  
  return (
    <div className="network-status">
      <h3>Network Status</h3>
      <div style={{ 
        padding: '10px', 
        borderRadius: '5px', 
        backgroundColor: isMainnet ? '#d4edda' : '#f8d7da',
        color: isMainnet ? '#155724' : '#721c24',
        marginBottom: '10px'
      }}>
        <p><strong>Current Network:</strong> {networkName} (ID: {networkId})</p>
        <p><strong>Status:</strong> {isMainnet ? 'Production Network' : 'Test Network'}</p>
      </div>
    </div>
  );
};