import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GigMarketplace from '../components/marketplace/GigMarketplace';
import gigService from '../services/gigService';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../services/gigService', () => ({
  default: {
    getAll: vi.fn(),
  },
}));

const mockGigs = [
  {
    _id: '1',
    title: 'Custom React Frontend Development',
    description: 'High performance React web app.',
    category: 'Development',
    price: 1800,
    owner: { _id: 'u1', name: 'Alice Developer' },
    status: 'active',
  },
  {
    _id: '2',
    title: 'Modern UI/UX Figma Design',
    description: 'Responsive mobile and desktop wireframes.',
    category: 'Design',
    price: 1200,
    owner: { _id: 'u2', name: 'Bob Designer' },
    status: 'active',
  },
];

describe('GigMarketplace Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gigService.getAll.mockResolvedValue({ success: true, gigs: mockGigs });
  });

  it('renders marketplace listings from API', async () => {
    render(
      <AuthProvider>
        <GigMarketplace />
      </AuthProvider>
    );

    expect(await screen.findByText('Custom React Frontend Development')).toBeInTheDocument();
    expect(screen.getByText('Modern UI/UX Figma Design')).toBeInTheDocument();
    expect(screen.getByText('Alice Developer')).toBeInTheDocument();
  });

  it('filters gigs when searching by keyword', async () => {
    render(
      <AuthProvider>
        <GigMarketplace />
      </AuthProvider>
    );

    expect(await screen.findByText('Custom React Frontend Development')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search gigs by skill/i);
    fireEvent.change(searchInput, { target: { value: 'Figma' } });

    expect(screen.getByText('Modern UI/UX Figma Design')).toBeInTheDocument();
    expect(screen.queryByText('Custom React Frontend Development')).not.toBeInTheDocument();
  });
});
