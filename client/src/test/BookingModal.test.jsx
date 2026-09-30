import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BookingModal from '../components/common/BookingModal';
import bookingService from '../services/bookingService';

vi.mock('../services/bookingService', () => ({
  default: {
    create: vi.fn(),
  },
}));

const mockGig = {
  _id: 'gig-123',
  title: 'Fullstack Next.js Web Application',
  category: 'Web Development',
  price: 2500,
  owner: {
    name: 'John Doe',
    email: 'john@example.com',
  },
};

describe('BookingModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <BookingModal gig={mockGig} isOpen={false} onClose={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders gig details, price formatting, and payment methods when open', () => {
    render(<BookingModal gig={mockGig} isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/confirm & secure booking/i)).toBeInTheDocument();
    expect(screen.getByText('Fullstack Next.js Web Application')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText(/Card Demo/i)).toBeInTheDocument();
    expect(screen.getByText(/Instant EFT/i)).toBeInTheDocument();
  });

  it('submits simulated booking and displays confirmation receipt on success', async () => {
    bookingService.create.mockResolvedValue({
      success: true,
      booking: {
        _id: 'b-999',
        price: 2500,
        transaction: {
          transactionId: 'TXN-TEST-1234',
          paymentMethod: 'simulated_card',
          status: 'completed',
        },
        gig: mockGig,
        freelancer: mockGig.owner,
      },
    });

    render(<BookingModal gig={mockGig} isOpen={true} onClose={() => {}} />);

    const submitBtn = screen.getByRole('button', { name: /confirm & pay/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/booking confirmed!/i)).toBeInTheDocument();
    expect(screen.getByText('TXN-TEST-1234')).toBeInTheDocument();
  });
});
