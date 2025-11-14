import { useState, useEffect } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import LoadingSpinner from './LoadingSpinner';

export default function WalletConnect() {
  const { isConnected, walletAddress, connect, disconnect } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is already connected on mount
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      // Check if wallet extension is available
      if (typeof window !== 'undefined' && (window as any).iota) {
        const accounts = await (window as any).iota.getAccounts();
        if (accounts && accounts.length > 0) {
          connect(accounts[0]);
        }
      }
    } catch (err) {
      console.error('Failed to check wallet connection:', err);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if IOTA wallet extension is installed
      if (typeof window === 'undefined' || !(window as any).iota) {
        setError(
          'IOTA Wallet extension not detected. Please install it from the browser extension store.'
        );
        setIsConnecting(false);
        return;
      }

      // Request connection to wallet
      const wallet = (window as any).iota;

      // Request accounts
      const accounts = await wallet.requestAccounts();

      if (!accounts || accounts.length === 0) {
        setError('No accounts found. Please create an account in your IOTA Wallet.');
        setIsConnecting(false);
        return;
      }

      // Get the first account address
      const address = accounts[0];

      // Store in Zustand
      connect(address);

      setIsConnecting(false);
    } catch (err: any) {
      console.error('Wallet connection error:', err);

      if (err.code === 4001) {
        setError('Connection rejected. Please approve the connection request in your wallet.');
      } else if (err.message?.includes('network')) {
        setError('Network mismatch. Please switch to IOTA Testnet in your wallet.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }

      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setError(null);
  };

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center space-x-4">
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-green-800">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
      >
        {isConnecting ? (
          <>
            <LoadingSpinner size="sm" color="white" className="mr-2" />
            Connecting...
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
