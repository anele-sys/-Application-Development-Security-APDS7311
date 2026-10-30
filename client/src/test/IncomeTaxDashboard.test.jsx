import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IncomeTaxDashboard from '../components/dashboard/IncomeTaxDashboard';
import bookingService from '../services/bookingService';

vi.mock('../services/bookingService', () => ({
  default: {
    getIncomeAnalytics: vi.fn(),
    simulateTax: vi.fn(),
  },
}));

const mockAnalytics = {
  grossEarned: 150000,
  realizedIncome: 120000,
  pendingIncome: 30000,
  orderStats: {
    totalOrders: 6,
    completedOrders: 4,
    activeOrders: 2,
    cancelledOrders: 0,
    averageOrderValue: 25000,
  },
  monthlyTimeline: [
    {
      key: '2026-08',
      label: 'Aug 2026',
      grossIncome: 50000,
      completedIncome: 50000,
      orderCount: 2,
      estimatedTax: 0,
      netIncome: 50000,
    },
    {
      key: '2026-09',
      label: 'Sep 2026',
      grossIncome: 100000,
      completedIncome: 70000,
      orderCount: 4,
      estimatedTax: 765,
      netIncome: 99235,
    },
  ],
  categoryBreakdown: [
    {
      category: 'Web Development',
      totalIncome: 100000,
      orderCount: 4,
      percentage: 67,
    },
    {
      category: 'UI/UX Design',
      totalIncome: 50000,
      orderCount: 2,
      percentage: 33,
    },
  ],
  taxSummary: {
    grossIncome: 150000,
    deductibleExpenses: 0,
    taxableIncome: 150000,
    grossTaxBeforeRebate: 27000,
    primaryRebate: 17235,
    netTaxPayable: 9765,
    effectiveTaxRate: 6.51,
    marginalTaxRate: 0.18,
    marginalTaxRatePercent: '18%',
    netTakeHomePay: 140235,
    isBelowThreshold: false,
    taxThreshold: 95750,
    provisionalTax: {
      period1Amount: 4882.5,
      period1DueDate: '31 August (1st Provisional Return)',
      period2Amount: 4882.5,
      period2DueDate: '28 February (2nd Provisional Return)',
    },
    bracketBreakdown: [
      {
        bracket: 1,
        label: 'R0 - R237,100',
        min: 0,
        max: 237100,
        rate: 0.18,
        ratePercent: '18%',
        taxableAmountInBracket: 150000,
        taxInBracket: 27000,
        isCurrentBracket: true,
      },
      {
        bracket: 2,
        label: 'R237,101 - R370,500',
        min: 237100,
        max: 370500,
        rate: 0.26,
        ratePercent: '26%',
        taxableAmountInBracket: 0,
        taxInBracket: 0,
        isCurrentBracket: false,
      },
    ],
  },
};

describe('IncomeTaxDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bookingService.getIncomeAnalytics.mockResolvedValue({
      success: true,
      analytics: mockAnalytics,
    });
  });

  it('renders loading state initially and then displays financial KPI metrics', async () => {
    render(<IncomeTaxDashboard />);

    expect(
      screen.getByText(/computing income aggregation and SARS tax calculations/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Freelancer Income & Tax Intelligence')).toBeInTheDocument();
    });

    expect(screen.getByText(/Total Gross Earnings/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Tax Payable/i)).toBeInTheDocument();
    expect(screen.getByText(/Net Take-Home Income/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Effective Tax Rate/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/6.51%/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders SARS progressive bracket breakdown table and provisional tax milestones', async () => {
    render(<IncomeTaxDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(/SARS Progressive Tax Bracket Analysis/i)
      ).toBeInTheDocument();
    });

    expect(screen.getAllByText('Tier 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Current Marginal Tier')).toBeInTheDocument();
    expect(screen.getByText('1st Provisional Payment')).toBeInTheDocument();
    expect(screen.getByText('2nd Provisional Payment')).toBeInTheDocument();
    expect(screen.getByText(/31 August/i)).toBeInTheDocument();
    expect(screen.getByText(/28 \/ 29 February/i)).toBeInTheDocument();
  });

  it('allows expanding and reviewing comprehensive tax calculation explanations', async () => {
    render(<IncomeTaxDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(/How HustleHub\+ Calculates Your Taxes/i)
      ).toBeInTheDocument();
    });

    const toggleHeader = screen.getByText(
      /How HustleHub\+ Calculates Your Taxes/i
    );
    fireEvent.click(toggleHeader);

    expect(screen.getByText(/Progressive Tax vs Flat Tax/i)).toBeInTheDocument();
    expect(screen.getByText(/The Mathematical Formula/i)).toBeInTheDocument();
    expect(screen.getByText(/Rebates & Thresholds/i)).toBeInTheDocument();

    // Switch to formula tab
    fireEvent.click(screen.getByText(/The Mathematical Formula/i));
    expect(screen.getByText(/Worked Example:/i)).toBeInTheDocument();
    expect(screen.getByText(/Base Bracket Tax/i)).toBeInTheDocument();
  });

  it('simulates deductible expenses and updates tax calculations in real time', async () => {
    bookingService.simulateTax.mockResolvedValue({
      success: true,
      simulation: {
        grossIncome: 150000,
        deductibleExpenses: 20000,
        taxableIncome: 130000,
        grossTaxBeforeRebate: 23400,
        primaryRebate: 17235,
        netTaxPayable: 6165,
        effectiveTaxRate: 4.11,
        marginalTaxRatePercent: '18%',
        netTakeHomePay: 143835,
        isBelowThreshold: false,
        provisionalTax: { period1Amount: 3082.5, period2Amount: 3082.5 },
        bracketBreakdown: mockAnalytics.taxSummary.bracketBreakdown,
      },
    });

    render(<IncomeTaxDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Tax & Expense Simulator/i)).toBeInTheDocument();
    });

    const deductionsInput = screen.getByLabelText(/Allowable Business Deductions/i);
    fireEvent.change(deductionsInput, { target: { value: '20000' } });

    const simBtn = screen.getByRole('button', { name: /Calculate Scenario/i });
    fireEvent.click(simBtn);

    await waitFor(() => {
      expect(bookingService.simulateTax).toHaveBeenCalledWith({
        grossIncome: 150000,
        deductibleExpenses: 20000,
      });
      expect(screen.getByText(/Tax Saved by Deductions:/i)).toBeInTheDocument();
      expect(screen.getByText(/Simulator Mode Active/i)).toBeInTheDocument();
    });
  });
});
