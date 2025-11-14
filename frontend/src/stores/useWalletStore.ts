import { create } from 'zustand';

interface WalletState {
  isConnected: boolean;
  walletAddress: string | null;
  connect: (address: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>(set => ({
  isConnected: false,
  walletAddress: null,
  connect: (address: string) => set({ isConnected: true, walletAddress: address }),
  disconnect: () => set({ isConnected: false, walletAddress: null }),
}));
