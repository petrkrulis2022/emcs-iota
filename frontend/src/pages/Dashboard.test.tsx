import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { useWalletStore } from '../stores/useWalletStore';
import { useConsignmentStore } from '../stores/useConsignmentStore';

// Mock the ConsignmentTable component
vi.mock('../components/ConsignmentTable', () => ({
  default: ({ consignments }: any) => (
    <div data-testid="consignment-table">
      {consignments.map((c: any) => (
        <div key={c.arc} data-testid={`consignment-${c.arc}`}>
          {c.arc} - {c.status}
        </div>
      ))}
    </div>
  ),
}));

const mockConsignments = [
  {
    arc: '24FR12345678901234567',
    consignor: '0x123',
    consignee: '0x456',
    goodsType: 'Wine',
    quantity: 1000,
    unit: 'Liters',
    origin: 'France',
    destination: 'Germany',
    status: 'Draft' as const,
    createdAt: '2025-11-13T10:00:00Z',
  },
  {
    arc: '24FR98765432109876543',
    consignor: '0x123',
    consignee: '0x789',
    goodsType: 'Beer',
    quantity: 500,
    unit: 'Liters',
    origin: 'Belgium',
    destination: 'Netherlands',
    status: 'In Transit' as const,
    createdAt: '2025-11-13T11:00:00Z',
  },
  {
    arc: '24FR11111111111111111',
    consignor: '0x999',
    consignee: '0x123',
    goodsType: 'Spirits',
    quantity: 200,
    unit: 'Liters',
    origin: 'Scotland',
    destination: 'USA',
    status: 'Received' as const,
    createdAt: '2025-11-13T09:00:00Z',
  },
];

describe('Dashboard', () => {
  const mockAddress = '0x123';

  beforeEach(() => {
    vi.clearAllMocks();
    useWalletStore.setState({ isConnected: true, walletAddress: mockAddress });
    useConsignmentStore.setState({ consignments: [], loading: false });
  });

  it('shows connect wallet message when wallet is not connected', () => {
    useWalletStore.setState({ isConnected: false, walletAddress: null });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    useConsignmentStore.setState({ consignments: [], loading: true });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('shows empty state when no consignments', () => {
    useConsignmentStore.setState({ consignments: [], loading: false });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/no consignments yet/i)).toBeInTheDocument();
  });

  it('displays all consignments when filter is set to all', () => {
    useConsignmentStore.setState({ consignments: mockConsignments, loading: false });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/showing 3 of 3 consignment/i)).toBeInTheDocument();
    expect(screen.getByTestId('consignment-24FR12345678901234567')).toBeInTheDocument();
    expect(screen.getByTestId('consignment-24FR98765432109876543')).toBeInTheDocument();
    expect(screen.getByTestId('consignment-24FR11111111111111111')).toBeInTheDocument();
  });

  it('filters consignments by Draft status', async () => {
    const user = userEvent.setup();
    useConsignmentStore.setState({ consignments: mockConsignments, loading: false });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const draftButton = screen.getByRole('button', { name: /^draft$/i });
    await user.click(draftButton);

    await waitFor(() => {
      expect(screen.getByText(/showing 1 of 3 consignment/i)).toBeInTheDocument();
      expect(screen.getByTestId('consignment-24FR12345678901234567')).toBeInTheDocument();
      expect(screen.queryByTestId('consignment-24FR98765432109876543')).not.toBeInTheDocument();
    });
  });

  it('filters consignments by In Transit status', async () => {
    const user = userEvent.setup();
    useConsignmentStore.setState({ consignments: mockConsignments, loading: false });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const inTransitButton = screen.getByRole('button', { name: /in transit/i });
    await user.click(inTransitButton);

    await waitFor(() => {
      expect(screen.getByText(/showing 1 of 3 consignment/i)).toBeInTheDocument();
      expect(screen.getByTestId('consignment-24FR98765432109876543')).toBeInTheDocument();
      expect(screen.queryByTestId('consignment-24FR12345678901234567')).not.toBeInTheDocument();
    });
  });

  it('filters consignments by Received status', async () => {
    const user = userEvent.setup();
    useConsignmentStore.setState({ consignments: mockConsignments, loading: false });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const receivedButton = screen.getByRole('button', { name: /received/i });
    await user.click(receivedButton);

    await waitFor(() => {
      expect(screen.getByText(/showing 1 of 3 consignment/i)).toBeInTheDocument();
      expect(screen.getByTestId('consignment-24FR11111111111111111')).toBeInTheDocument();
      expect(screen.queryByTestId('consignment-24FR12345678901234567')).not.toBeInTheDocument();
    });
  });

  it('shows message when no consignments match filter', async () => {
    const user = userEvent.setup();
    const singleConsignment = [mockConsignments[0]]; // Only Draft
    useConsignmentStore.setState({ consignments: singleConsignment, loading: false });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const receivedButton = screen.getByRole('button', { name: /received/i });
    await user.click(receivedButton);

    await waitFor(() => {
      expect(screen.getByText(/no consignments found with status: received/i)).toBeInTheDocument();
    });
  });

  it('highlights active filter button', async () => {
    const user = userEvent.setup();
    useConsignmentStore.setState({ consignments: mockConsignments, loading: false });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const draftButton = screen.getByRole('button', { name: /^draft$/i });
    await user.click(draftButton);

    await waitFor(() => {
      expect(draftButton).toHaveClass('bg-blue-600');
    });
  });
});
