import { createNetworkConfig, IotaClientProvider, WalletProvider } from '@iota/dapp-kit';
import { getFullnodeUrl } from '@iota/iota-sdk/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Create a query client for React Query
const queryClient = new QueryClient();

// Configure IOTA network (testnet)
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

interface IotaWalletProviderProps {
  children: ReactNode;
}

/**
 * IOTA Wallet Provider Component
 * 
 * Wraps the application with IOTA dApp Kit providers to enable:
 * - Connection to IOTA Wallet browser extension
 * - Transaction signing and execution
 * - Network configuration (testnet/mainnet)
 */
export function IotaWalletProvider({ children }: IotaWalletProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </IotaClientProvider>
    </QueryClientProvider>
  );
}
