import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsignmentForm from './ConsignmentForm';
import { useWalletStore } from '../stores/useWalletStore';

describe('ConsignmentForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  beforeEach(() => {
    vi.clearAllMocks();
    useWalletStore.setState({ isConnected: true, walletAddress: mockAddress });
  });

  it('renders all form fields', () => {
    render(
      <ConsignmentForm onSuccess={mockOnSuccess} onSubmit={mockOnSubmit} isSubmitting={false} />
    );

    expect(screen.getByLabelText(/consignee address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goods type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/origin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid IOTA address', async () => {
    const user = userEvent.setup();
    render(
      <ConsignmentForm onSuccess={mockOnSuccess} onSubmit={mockOnSubmit} isSubmitting={false} />
    );

    const consigneeInput = screen.getByLabelText(/consignee address/i);
    await user.type(consigneeInput, 'invalid-address');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/invalid IOTA address format/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for empty required fields', async () => {
    const user = userEvent.setup();
    render(
      <ConsignmentForm onSuccess={mockOnSuccess} onSubmit={mockOnSubmit} isSubmitting={false} />
    );

    const submitButton = screen.getByRole('button', { name: /create consignment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/consignee address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/goods type is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for quantity less than or equal to 0', async () => {
    const user = userEvent.setup();
    render(
      <ConsignmentForm onSuccess={mockOnSuccess} onSubmit={mockOnSubmit} isSubmitting={false} />
    );

    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.type(quantityInput, '0');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/quantity must be greater than 0/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const validConsignee = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <ConsignmentForm onSuccess={mockOnSuccess} onSubmit={mockOnSubmit} isSubmitting={false} />
    );

    // Fill in all fields
    await user.type(screen.getByLabelText(/consignee address/i), validConsignee);
    await user.selectOptions(screen.getByLabelText(/goods type/i), 'Wine');
    await user.type(screen.getByLabelText(/quantity/i), '1000');
    await user.selectOptions(screen.getByLabelText(/unit/i), 'Liters');
    await user.type(screen.getByLabelText(/origin/i), 'Bordeaux, France');
    await user.type(screen.getByLabelText(/destination/i), 'Berlin, Germany');

    const submitButton = screen.getByRole('button', { name: /create consignment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        consignee: validConsignee,
        goodsType: 'Wine',
        quantity: '1000',
        unit: 'Liters',
        origin: 'Bordeaux, France',
        destination: 'Berlin, Germany',
      });
    });
  });

  it('disables submit button when wallet is not connected', () => {
    useWalletStore.setState({ isConnected: false, walletAddress: null });

    render(
      <ConsignmentForm onSuccess={mockOnSuccess} onSubmit={mockOnSubmit} isSubmitting={false} />
    );

    const submitButton = screen.getByRole('button', { name: /create consignment/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows wallet connection warning when not connected', () => {
    useWalletStore.setState({ isConnected: false, walletAddress: null });

    render(
      <ConsignmentForm onSuccess={mockOnSuccess} onSubmit={mockOnSubmit} isSubmitting={false} />
    );

    expect(screen.getByText(/please connect your wallet/i)).toBeInTheDocument();
  });

  it('disables form fields when submitting', () => {
    render(
      <ConsignmentForm onSuccess={mockOnSuccess} onSubmit={mockOnSubmit} isSubmitting={true} />
    );

    expect(screen.getByLabelText(/consignee address/i)).toBeDisabled();
    expect(screen.getByLabelText(/goods type/i)).toBeDisabled();
    expect(screen.getByLabelText(/quantity/i)).toBeDisabled();
  });
});
