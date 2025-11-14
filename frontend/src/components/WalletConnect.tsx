import { useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';

export default function WalletConnect() {
  const { isConnected, walletAddress, connect, disconnect } = useWalletStore();
  const [manualAddress, setManualAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualConnect = () => {
    const address = manualAddress.trim();
    if (!address) {
      setError('Please enter a wallet address');
      return;
    }
    if (!address.startsWith('0x')) {
      setError('Address must start with 0x');
      return;
    }
    if (address.length !== 66) {
      setError('Address must be 66 characters long (0x + 64 hex characters)');
      return;
    }

    connect(address);
    setError(null);
    setManualAddress('');
  };

  const handleDisconnect = () => {
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
          onClick={handleDisconnect}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">Connect Your IOTA Wallet</p>
        <p className="text-xs text-blue-700 mb-3">
          Copy your wallet address from the IOTA Wallet extension and paste it below
        </p>
        <div className="flex space-x-2">
          <input
            type="text"
            value={manualAddress}
            onChange={e => setManualAddress(e.target.value)}
            placeholder="0x..."
            className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleManualConnect();
              }
            }}
          />
          <button
            onClick={handleManualConnect}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Connect
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
}
