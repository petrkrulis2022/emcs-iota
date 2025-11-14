import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WalletConnect from './WalletConnect';
import { useWalletStore } from '../stores/useWalletStore';

describe('WalletConnect', () => {
  beforeEach(() => {
    // Reset wallet store
    useWalletStore.setState({ isConnected: false, walletAddress: null });

    // Clear window.iota mock
    delete (window as any).iota;
  });

  it('renders connect button when wallet is not connected', () => {
    render(<WalletConnect />);

    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    expect(connectButton).toBeInTheDocument();
  });

  it('shows error when wallet extension is not installed', async () => {
    const user = userEvent.setup();
    render(<WalletConnect />);

    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    await user.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText(/IOTA Wallet extension not detected/i)).toBeInTheDocument();
    });
  });

  it('connects wallet successfully when extension is available', async () => {
    const user = userEvent.setup();
    const mockAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    // Mock IOTA wallet extension
    (window as any).iota = {
      requestAccounts: vi.fn().mockResolvedValue([mockAddress]),
      getAccounts: vi.fn().mockResolvedValue([]),
    };

    render(<WalletConnect />);

    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    await user.click(connectButton);

    await waitFor(() => {
      expect(useWalletStore.getState().isConnected).toBe(true);
      expect(useWalletStore.getState().walletAddress).toBe(mockAddress);
    });
  });

  it('displays truncated wallet address when connected', () => {
    const mockAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    useWalletStore.setState({ isConnected: true, walletAddress: mockAddress });

    render(<WalletConnect />);

    expect(screen.getByText('0x1234...cdef')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
  });

  it('disconnects wallet when disconnect button is clicked', async () => {
    const user = userEvent.setup();
    const mockAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    useWalletStore.setState({ isConnected: true, walletAddress: mockAddress });

    render(<WalletConnect />);

    const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
    await user.click(disconnectButton);

    expect(useWalletStore.getState().isConnected).toBe(false);
    expect(useWalletStore.getState().walletAddress).toBeNull();
  });
});
