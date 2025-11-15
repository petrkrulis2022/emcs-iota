import { ConnectButton, useCurrentAccount } from '@iota/dapp-kit';

/**
 * Wallet Connection Button Component
 * 
 * Displays:
 * - "Connect Wallet" button when disconnected
 * - Wallet address and disconnect button when connected
 * 
 * Uses IOTA dApp Kit's ConnectButton for seamless integration
 * with IOTA Wallet browser extension (Brave, Chrome, etc.)
 */
export default function WalletButton() {
  const currentAccount = useCurrentAccount();

  return (
    <div className="flex items-center gap-4">
      {currentAccount && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Connected:</span>{' '}
          <span className="font-mono">{currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}</span>
        </div>
      )}
      <ConnectButton />
    </div>
  );
}
