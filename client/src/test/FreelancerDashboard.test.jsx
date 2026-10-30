import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FreelancerDashboard from '../pages/dashboard/FreelancerDashboard';
import authService from '../services/authService';
import gigService from '../services/gigService';
import bookingService from '../services/bookingService';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'Sarah Connor',
      email: 'sarah@freelance.co.za',
      role: 'freelancer',
    },
    isAuthenticated: true,
  }),
}));

vi.mock('../services/authService', () => ({
  default: {
    checkFreelancerArea: vi.fn(),
  },
}));

vi.mock('../services/gigService', () => ({
  default: {
    getMine: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('../services/bookingService', () => ({
  default: {
    getFreelancerBookings: vi.fn(),
    getIncomeAnalytics: vi.fn(),
    simulateTax: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

const mockGigs = [
  {
    _id: 'gig-1',
    title: 'Fullstack MERN Web App',
    category: 'Web Development',
    description: 'High-performance React and Express backend API service.',
    price: 4500,
    status: 'active',
  },
  {
    _id: 'gig-2',
    title: 'Mobile App Wireframes',
    category: 'UI/UX Design',
    description: 'Figma prototypes and UX design system tokens.',
    price: 2500,
    status: 'inactive',
  },
];

describe('FreelancerDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.checkFreelancerArea.mockResolvedValue({
      message: 'Freelancer security verified',
    });
    gigService.getMine.mockResolvedValue({
      success: true,
      gigs: mockGigs,
    });
    bookingService.getFreelancerBookings.mockResolvedValue({
      success: true,
      bookings: [],
      stats: {
        totalEarned: 4500,
        totalOrders: 1,
        activeOrders: 0,
        completedOrders: 1,
      },
    });
    bookingService.getIncomeAnalytics.mockResolvedValue({
      success: true,
      analytics: {
        grossEarned: 4500,
        realizedIncome: 4500,
        pendingIncome: 0,
        orderStats: { totalOrders: 1, completedOrders: 1, activeOrders: 0 },
        monthlyTimeline: [],
        categoryBreakdown: [{ category: 'Web Development', totalIncome: 4500, percentage: 100 }],
        taxSummary: {
          grossIncome: 4500,
          taxableIncome: 4500,
          netTaxPayable: 0,
          effectiveTaxRate: 0,
          marginalTaxRatePercent: '18%',
          netTakeHomePay: 4500,
          isBelowThreshold: true,
          bracketBreakdown: [],
        },
      },
    });
  });

  it('renders without crashing and displays the freelancer greeting and stats', async () => {
    render(
      <BrowserRouter>
        <FreelancerDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/connecting to freelancer studio/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Freelancer Studio/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Sarah Connor/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Earned Income/i)).toBeInTheDocument();
    expect(screen.getByText(/Client Bookings/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Listings/i)).toBeInTheDocument();
  });

  it('renders listings card grid and filters listings by search query', async () => {
    render(
      <BrowserRouter>
        <FreelancerDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Fullstack MERN Web App')).toBeInTheDocument();
      expect(screen.getByText('Mobile App Wireframes')).toBeInTheDocument();
    });

    // Test search filter
    const searchInput = screen.getByPlaceholderText(/filter your listings by title/i);
    fireEvent.change(searchInput, { target: { value: 'MERN' } });

    expect(screen.getByText('Fullstack MERN Web App')).toBeInTheDocument();
    expect(screen.queryByText('Mobile App Wireframes')).not.toBeInTheDocument();
  });

  it('switches between Gigs, Orders, and Tax & Financial Insights tabs smoothly', async () => {
    render(
      <BrowserRouter>
        <FreelancerDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Freelancer Studio/i)).toBeInTheDocument();
    });

    // Switch to Tax tab
    const taxTabBtn = screen.getByRole('button', { name: /Tax & Financial Insights/i });
    fireEvent.click(taxTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Freelancer Income & Tax Intelligence')).toBeInTheDocument();
    });

    // Switch to Orders tab
    const ordersTabBtn = screen.getByRole('button', { name: /Client Orders/i });
    fireEvent.click(ordersTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Client Bookings & Income Tracker/i)).toBeInTheDocument();
    });
  });
});
