import { create } from 'zustand';

interface WalletState {
  isConnected: boolean;
  walletAddress: string | null;
  connect: (address: string) => void;
  disconnect: () => void;
  setWalletAddress: (address: string) => void;
  setIsConnected: (connected: boolean) => void;
}

export const useWalletStore = create<WalletState>(set => ({
  isConnected: false,
  walletAddress: null,
  connect: (address: string) => set({ isConnected: true, walletAddress: address }),
  disconnect: () => set({ isConnected: false, walletAddress: null }),
  setWalletAddress: (address: string) => set({ walletAddress: address }),
  setIsConnected: (connected: boolean) => set({ isConnected: connected }),
}));
