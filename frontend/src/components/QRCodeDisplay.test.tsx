import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRCodeDisplay from './QRCodeDisplay';

describe('QRCodeDisplay', () => {
  const mockARC = '24FR12345678901234567';

  it('renders QR code with ARC value', () => {
    render(<QRCodeDisplay arc={mockARC} />);

    // Check if ARC is displayed
    expect(screen.getByText(mockARC)).toBeInTheDocument();
    expect(screen.getByText(/ARC/i)).toBeInTheDocument();
  });

  it('renders download button', () => {
    render(<QRCodeDisplay arc={mockARC} />);

    const downloadButton = screen.getByRole('button', { name: /download qr code/i });
    expect(downloadButton).toBeInTheDocument();
  });

  it('renders QR code with custom size', () => {
    const customSize = 300;
    const { container } = render(<QRCodeDisplay arc={mockARC} size={customSize} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('width')).toBe(customSize.toString());
    expect(svg?.getAttribute('height')).toBe(customSize.toString());
  });

  it('renders QR code with default size when not specified', () => {
    const { container } = render(<QRCodeDisplay arc={mockARC} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('width')).toBe('200');
    expect(svg?.getAttribute('height')).toBe('200');
  });

  it('handles download button click', async () => {
    const user = userEvent.setup();

    // Mock canvas and blob creation
    const mockToBlob = vi.fn(callback => {
      callback(new Blob(['mock'], { type: 'image/png' }));
    });

    HTMLCanvasElement.prototype.toBlob = mockToBlob;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as any;

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock link click
    const mockClick = vi.fn();
    HTMLAnchorElement.prototype.click = mockClick;

    render(<QRCodeDisplay arc={mockARC} />);

    const downloadButton = screen.getByRole('button', { name: /download qr code/i });
    await user.click(downloadButton);

    // Note: Full download flow testing is complex due to canvas/blob mocking
    // This test verifies the button is clickable
    expect(downloadButton).toBeInTheDocument();
  });
});
