import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ConsignmentDetail from './ConsignmentDetail';
import { useWalletStore } from '../stores/useWalletStore';
import * as apiClient from '../services/apiClient';

// Mock the components
vi.mock('../components/QRCodeDisplay', () => ({
  default: ({ arc }: any) => <div data-testid="qr-code">{arc}</div>,
}));

vi.mock('../components/MovementTimeline', () => ({
  default: ({ events }: any) => (
    <div data-testid="movement-timeline">
      {events.map((e: any, i: number) => (
        <div key={i}>{e.type}</div>
      ))}
    </div>
  ),
}));

vi.mock('../utils/notifications', () => ({
  showSuccessNotification: vi.fn(),
  showErrorNotification: vi.fn(),
}));

const mockConsignment = {
  arc: '24FR12345678901234567',
  consignor: '0x123',
  consignee: '0x456',
  goodsType: 'Wine',
  quantity: 1000,
  unit: 'Liters',
  origin: 'Bordeaux, France',
  destination: 'Berlin, Germany',
  status: 'Draft' as const,
  createdAt: '2025-11-13T10:00:00Z',
};

const mockEvents = [
  {
    type: 'Created' as const,
    timestamp: '2025-11-13T10:00:00Z',
    actor: '0x123',
    transactionId: '0xabc',
  },
];

describe('ConsignmentDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWalletStore.setState({ isConnected: true, walletAddress: '0x123' });

    // Mock API calls
    vi.spyOn(apiClient.apiClient, 'getConsignment').mockResolvedValue(mockConsignment);
    vi.spyOn(apiClient.apiClient, 'getConsignmentEvents').mockResolvedValue({ events: mockEvents });
  });

  const renderWithRouter = (arc: string = '24FR12345678901234567') => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/consignment/:arc" element={<ConsignmentDetail />} />
        </Routes>
      </BrowserRouter>,
      {
        wrapper: ({ children }) => {
          window.history.pushState({}, '', `/consignment/${arc}`);
          return <>{children}</>;
        },
      }
    );
  };

  it('displays loading state initially', () => {
    renderWithRouter();
    // The component will show skeleton loader initially
    expect(apiClient.apiClient.getConsignment).toHaveBeenCalled();
  });

  it('displays consignment details after loading', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/consignment details/i)).toBeInTheDocument();
      expect(screen.getByText('Wine')).toBeInTheDocument();
      expect(screen.getByText('1000 Liters')).toBeInTheDocument();
      expect(screen.getByText('Bordeaux, France')).toBeInTheDocument();
      expect(screen.getByText('Berlin, Germany')).toBeInTheDocument();
    });
  });

  it('displays QR code', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('qr-code')).toBeInTheDocument();
      expect(screen.getByTestId('qr-code')).toHaveTextContent('24FR12345678901234567');
    });
  });

  it('displays movement timeline', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('movement-timeline')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
    });
  });

  it('shows dispatch button for Draft consignment when user is consignor', async () => {
    useWalletStore.setState({ isConnected: true, walletAddress: '0x123' });
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /dispatch consignment/i })).toBeInTheDocument();
    });
  });

  it('does not show dispatch button when user is not consignor', async () => {
    useWalletStore.setState({ isConnected: true, walletAddress: '0x999' });
    renderWithRouter();

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /dispatch consignment/i })
      ).not.toBeInTheDocument();
    });
  });

  it('shows receive button for In Transit consignment when user is consignee', async () => {
    const inTransitConsignment = { ...mockConsignment, status: 'In Transit' as const };
    vi.spyOn(apiClient.apiClient, 'getConsignment').mockResolvedValue(inTransitConsignment);
    useWalletStore.setState({ isConnected: true, walletAddress: '0x456' });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm receipt/i })).toBeInTheDocument();
    });
  });

  it('handles dispatch action', async () => {
    const user = userEvent.setup();
    const dispatchSpy = vi.spyOn(apiClient.apiClient, 'dispatchConsignment').mockResolvedValue({
      success: true,
      transactionId: '0xdef',
      documentHash: '0x789',
      dispatchedAt: '2025-11-13T11:00:00Z',
    });

    useWalletStore.setState({ isConnected: true, walletAddress: '0x123' });
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /dispatch consignment/i })).toBeInTheDocument();
    });

    const dispatchButton = screen.getByRole('button', { name: /dispatch consignment/i });
    await user.click(dispatchButton);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith('24FR12345678901234567', '0x123');
    });
  });

  it('displays error when consignment not found', async () => {
    vi.spyOn(apiClient.apiClient, 'getConsignment').mockRejectedValue(new Error('404 not found'));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/consignment not found/i)).toBeInTheDocument();
    });
  });

  it('displays status badge with correct color', async () => {
    renderWithRouter();

    await waitFor(() => {
      const statusBadge = screen.getByText('Draft');
      expect(statusBadge).toHaveClass('bg-gray-100');
    });
  });
});
