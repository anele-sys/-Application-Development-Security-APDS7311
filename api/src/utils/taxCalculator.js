/**
 * Tax Calculator Utility for HustleHub+
 * Implements South African Revenue Service (SARS) progressive income tax brackets,
 * primary rebates, provisional tax estimation, and allowable business expense deductions.
 */

// SARS 2024/2025/2026 Individual Income Tax Brackets (ZAR)
const SARS_TAX_BRACKETS = [
  {
    bracket: 1,
    min: 0,
    max: 237100,
    rate: 0.18,
    baseTax: 0,
    label: 'R0 - R237,100',
  },
  {
    bracket: 2,
    min: 237100,
    max: 370500,
    rate: 0.26,
    baseTax: 42678,
    label: 'R237,101 - R370,500',
  },
  {
    bracket: 3,
    min: 370500,
    max: 512800,
    rate: 0.31,
    baseTax: 77362,
    label: 'R370,501 - R512,800',
  },
  {
    bracket: 4,
    min: 512800,
    max: 673000,
    rate: 0.36,
    baseTax: 121475,
    label: 'R512,801 - R673,000',
  },
  {
    bracket: 5,
    min: 673000,
    max: 857900,
    rate: 0.39,
    baseTax: 179147,
    label: 'R673,001 - R857,900',
  },
  {
    bracket: 6,
    min: 857900,
    max: 1817000,
    rate: 0.41,
    baseTax: 251258,
    label: 'R857,901 - R1,817,000',
  },
  {
    bracket: 7,
    min: 1817000,
    max: Infinity,
    rate: 0.45,
    baseTax: 644489,
    label: 'R1,817,001 and above',
  },
];

// SARS Primary Rebate (Individual under 65 years)
const PRIMARY_REBATE = 17235;

// Tax threshold under 65 (17,235 / 0.18 = 95,750)
const TAX_THRESHOLD = 95750;

/**
 * Calculate progressive personal income tax for a given annual gross income.
 * 
 * Formula:
 * 1. Taxable Income = max(0, Gross Income - Deductible Expenses)
 * 2. Find bracket matching Taxable Income:
 *    Gross Tax = Base Tax + ((Taxable Income - Bracket Floor) * Marginal Rate)
 * 3. Net Tax Payable = max(0, Gross Tax - Primary Rebate)
 * 4. Effective Tax Rate = (Net Tax Payable / Gross Income) * 100
 * 
 * @param {number} grossIncome - Annualized or total gross revenue in ZAR
 * @param {object} [options] - Optional calculations parameters
 * @param {number} [options.deductibleExpenses=0] - Allowable business expenses (s11(a))
 * @returns {object} Detailed tax breakdown object
 */
function calculateTax(grossIncome = 0, options = {}) {
  const gross = Math.max(0, Number(grossIncome) || 0);
  const deductibleExpenses = Math.max(0, Number(options.deductibleExpenses) || 0);
  const taxableIncome = Math.max(0, gross - deductibleExpenses);

  if (taxableIncome <= 0) {
    return {
      grossIncome: gross,
      deductibleExpenses,
      taxableIncome: 0,
      grossTaxBeforeRebate: 0,
      primaryRebate: PRIMARY_REBATE,
      netTaxPayable: 0,
      effectiveTaxRate: 0,
      marginalTaxRate: 0.18,
      netTakeHomePay: gross,
      isBelowThreshold: true,
      taxThreshold: TAX_THRESHOLD,
      provisionalTax: {
        period1Amount: 0,
        period1DueDate: '31 August',
        period2Amount: 0,
        period2DueDate: '28 February',
      },
      bracketBreakdown: SARS_TAX_BRACKETS.map((b) => ({
        ...b,
        taxableAmountInBracket: 0,
        taxInBracket: 0,
        isCurrentBracket: b.bracket === 1,
      })),
    };
  }

  // Find the current applicable bracket
  const currentBracket =
    SARS_TAX_BRACKETS.find(
      (b) => taxableIncome > b.min && taxableIncome <= b.max
    ) || SARS_TAX_BRACKETS[SARS_TAX_BRACKETS.length - 1];

  // Calculate gross tax before applying rebates
  const amountAboveFloor = taxableIncome - currentBracket.min;
  const taxOnMargin = amountAboveFloor * currentBracket.rate;
  const grossTaxBeforeRebate = Math.round((currentBracket.baseTax + taxOnMargin) * 100) / 100;

  // Apply primary rebate (tax liability cannot be negative)
  const netTaxPayable = Math.max(
    0,
    Math.round((grossTaxBeforeRebate - PRIMARY_REBATE) * 100) / 100
  );

  const effectiveTaxRate =
    gross > 0 ? Math.round((netTaxPayable / gross) * 10000) / 100 : 0;

  const netTakeHomePay = Math.round((gross - netTaxPayable) * 100) / 100;

  // Generate breakdown for each bracket for visualization
  const bracketBreakdown = SARS_TAX_BRACKETS.map((b) => {
    let taxableAmountInBracket = 0;
    let taxInBracket = 0;

    if (taxableIncome > b.min) {
      if (taxableIncome >= b.max) {
        taxableAmountInBracket = b.max - b.min;
      } else {
        taxableAmountInBracket = taxableIncome - b.min;
      }
      taxInBracket = Math.round(taxableAmountInBracket * b.rate * 100) / 100;
    }

    return {
      bracket: b.bracket,
      label: b.label,
      min: b.min,
      max: b.max,
      rate: b.rate,
      ratePercent: `${Math.round(b.rate * 100)}%`,
      taxableAmountInBracket,
      taxInBracket,
      isCurrentBracket: b.bracket === currentBracket.bracket,
    };
  });

  // Provisional tax obligations (Freelancers / Sole Proprietors in South Africa)
  // Split into 2 semi-annual payments (August and February)
  const period1Amount = Math.round((netTaxPayable * 0.5) * 100) / 100;
  const period2Amount = Math.round((netTaxPayable - period1Amount) * 100) / 100;

  return {
    grossIncome: gross,
    deductibleExpenses,
    taxableIncome,
    grossTaxBeforeRebate,
    primaryRebate: PRIMARY_REBATE,
    netTaxPayable,
    effectiveTaxRate,
    marginalTaxRate: currentBracket.rate,
    marginalTaxRatePercent: `${Math.round(currentBracket.rate * 100)}%`,
    netTakeHomePay,
    isBelowThreshold: taxableIncome <= TAX_THRESHOLD,
    taxThreshold: TAX_THRESHOLD,
    provisionalTax: {
      period1Amount,
      period1DueDate: '31 August (1st Provisional Return)',
      period2Amount,
      period2DueDate: '28 February (2nd Provisional Return)',
    },
    bracketBreakdown,
  };
}

/**
 * Aggregates freelancer bookings, extracts monthly timeline and category stats,
 * and attaches SARS tax estimates.
 * 
 * @param {Array} bookings - Array of Mongoose Booking documents or plain objects
 * @param {object} [options] - Optional calculation options
 * @returns {object} Aggregated financial and tax analytics
 */
function aggregateFreelancerIncome(bookings = [], options = {}) {
  const validBookings = bookings.filter((b) => b.status !== 'cancelled');

  let totalGross = 0;
  let realizedIncome = 0;
  let pendingIncome = 0;

  const monthlyMap = {};
  const categoryMap = {};

  validBookings.forEach((booking) => {
    const amount = Number(booking.price || 0);
    totalGross += amount;

    if (booking.status === 'completed') {
      realizedIncome += amount;
    } else {
      pendingIncome += amount;
    }

    // Monthly grouping based on booking creation date
    const date = new Date(booking.createdAt || Date.now());
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('en-ZA', { month: 'short', year: 'numeric' });

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = {
        key: monthKey,
        label: monthName,
        grossIncome: 0,
        completedIncome: 0,
        orderCount: 0,
      };
    }
    monthlyMap[monthKey].grossIncome += amount;
    if (booking.status === 'completed') {
      monthlyMap[monthKey].completedIncome += amount;
    }
    monthlyMap[monthKey].orderCount += 1;

    // Category grouping
    const category = booking.gig?.category || 'General';
    if (!categoryMap[category]) {
      categoryMap[category] = {
        category,
        totalIncome: 0,
        orderCount: 0,
      };
    }
    categoryMap[category].totalIncome += amount;
    categoryMap[category].orderCount += 1;
  });

  // Sort monthly timeline chronologically
  const monthlyTimeline = Object.values(monthlyMap)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((month) => {
      const monthTax = calculateTax(month.grossIncome);
      return {
        ...month,
        estimatedTax: monthTax.netTaxPayable,
        netIncome: monthTax.netTakeHomePay,
      };
    });

  // Calculate percentage shares for categories
  const categoryBreakdown = Object.values(categoryMap)
    .map((cat) => ({
      ...cat,
      percentage: totalGross > 0 ? Math.round((cat.totalIncome / totalGross) * 100) : 0,
    }))
    .sort((a, b) => b.totalIncome - a.totalIncome);

  // Overall tax calculation on total gross
  const taxSummary = calculateTax(totalGross, options);

  const totalOrders = bookings.length;
  const completedOrders = bookings.filter((b) => b.status === 'completed').length;
  const activeOrders = bookings.filter((b) => ['pending', 'in_progress'].includes(b.status)).length;
  const cancelledOrders = bookings.filter((b) => b.status === 'cancelled').length;

  const averageOrderValue =
    validBookings.length > 0
      ? Math.round((totalGross / validBookings.length) * 100) / 100
      : 0;

  return {
    grossEarned: totalGross,
    realizedIncome,
    pendingIncome,
    orderStats: {
      totalOrders,
      completedOrders,
      activeOrders,
      cancelledOrders,
      averageOrderValue,
    },
    monthlyTimeline,
    categoryBreakdown,
    taxSummary,
  };
}

module.exports = {
  SARS_TAX_BRACKETS,
  PRIMARY_REBATE,
  TAX_THRESHOLD,
  calculateTax,
  aggregateFreelancerIncome,
};
