const {
  calculateTax,
  aggregateFreelancerIncome,
  SARS_TAX_BRACKETS,
  PRIMARY_REBATE,
  TAX_THRESHOLD,
} = require('../src/utils/taxCalculator');

describe('Tax Calculator Utility (SARS Progressive Brackets)', () => {
  test('returns 0 tax when gross income is 0 or negative', () => {
    const resZero = calculateTax(0);
    expect(resZero.grossIncome).toBe(0);
    expect(resZero.taxableIncome).toBe(0);
    expect(resZero.netTaxPayable).toBe(0);
    expect(resZero.effectiveTaxRate).toBe(0);

    const resNeg = calculateTax(-5000);
    expect(resNeg.grossIncome).toBe(0);
    expect(resNeg.taxableIncome).toBe(0);
    expect(resNeg.netTaxPayable).toBe(0);
  });

  test('returns 0 net tax for income below or equal to SARS tax threshold (R95,750)', () => {
    // Under 65 threshold is R95,750: 95,750 * 0.18 = 17,235. Rebate is 17,235. Net tax = 0.
    const resThreshold = calculateTax(95750);
    expect(resThreshold.taxableIncome).toBe(95750);
    expect(resThreshold.grossTaxBeforeRebate).toBe(17235);
    expect(resThreshold.primaryRebate).toBe(17235);
    expect(resThreshold.netTaxPayable).toBe(0);
    expect(resThreshold.isBelowThreshold).toBe(true);
    expect(resThreshold.effectiveTaxRate).toBe(0);

    const resBelow = calculateTax(50000);
    expect(resBelow.netTaxPayable).toBe(0);
    expect(resBelow.isBelowThreshold).toBe(true);
  });

  test('correctly calculates tax in Bracket 1 (R0 - R237,100)', () => {
    // Income = R150,000
    // Gross Tax = 150,000 * 0.18 = 27,000
    // Net Tax = 27,000 - 17,235 = 9,765
    const res = calculateTax(150000);
    expect(res.grossTaxBeforeRebate).toBe(27000);
    expect(res.netTaxPayable).toBe(9765);
    expect(res.marginalTaxRate).toBe(0.18);
    expect(res.netTakeHomePay).toBe(150000 - 9765);
    expect(res.isBelowThreshold).toBe(false);
  });

  test('correctly calculates tax in Bracket 2 (R237,101 - R370,500)', () => {
    // Income = R300,000
    // Base Tax = 42,678
    // Marginal = (300,000 - 237,100) * 0.26 = 62,900 * 0.26 = 16,354
    // Gross Tax = 42,678 + 16,354 = 59,032
    // Net Tax = 59,032 - 17,235 = 41,797
    const res = calculateTax(300000);
    expect(res.grossTaxBeforeRebate).toBe(59032);
    expect(res.netTaxPayable).toBe(41797);
    expect(res.marginalTaxRate).toBe(0.26);
    expect(res.netTakeHomePay).toBe(300000 - 41797);
  });

  test('correctly calculates tax in Bracket 3 (R370,501 - R512,800)', () => {
    // Income = R450,000
    // Base Tax = 77,362
    // Marginal = (450,000 - 370,500) * 0.31 = 79,500 * 0.31 = 24,645
    // Gross Tax = 77,362 + 24,645 = 102,007
    // Net Tax = 102,007 - 17,235 = 84,772
    const res = calculateTax(450000);
    expect(res.grossTaxBeforeRebate).toBe(102007);
    expect(res.netTaxPayable).toBe(84772);
    expect(res.marginalTaxRate).toBe(0.31);
  });

  test('deducts business expenses before computing taxable income', () => {
    // Gross: R300,000, Deductible Expenses: R50,000
    // Taxable: R250,000
    // Base: 42,678 + (250,000 - 237,100) * 0.26 = 42,678 + 3,354 = 46,032
    // Net Tax: 46,032 - 17,235 = 28,797
    const res = calculateTax(300000, { deductibleExpenses: 50000 });
    expect(res.grossIncome).toBe(300000);
    expect(res.deductibleExpenses).toBe(50000);
    expect(res.taxableIncome).toBe(250000);
    expect(res.netTaxPayable).toBe(28797);
  });

  test('calculates provisional tax periods split 50/50', () => {
    const res = calculateTax(200000);
    // Net tax = (200,000 * 0.18 = 36,000) - 17,235 = 18,765
    expect(res.netTaxPayable).toBe(18765);
    expect(res.provisionalTax.period1Amount).toBe(9382.5);
    expect(res.provisionalTax.period2Amount).toBe(9382.5);
    expect(res.provisionalTax.period1DueDate).toContain('31 August');
    expect(res.provisionalTax.period2DueDate).toContain('28 February');
  });

  test('generates detailed bracket breakdown and active bracket identification', () => {
    const res = calculateTax(250000);
    expect(res.bracketBreakdown).toHaveLength(SARS_TAX_BRACKETS.length);
    const b1 = res.bracketBreakdown.find((b) => b.bracket === 1);
    const b2 = res.bracketBreakdown.find((b) => b.bracket === 2);
    expect(b1.taxableAmountInBracket).toBe(237100);
    expect(b2.taxableAmountInBracket).toBe(250000 - 237100);
    expect(b2.isCurrentBracket).toBe(true);
    expect(b1.isCurrentBracket).toBe(false);
  });
});

describe('aggregateFreelancerIncome', () => {
  const mockBookings = [
    {
      _id: 'b1',
      price: 15000,
      status: 'completed',
      createdAt: '2026-08-15T10:00:00Z',
      gig: { category: 'Web Development' },
    },
    {
      _id: 'b2',
      price: 25000,
      status: 'completed',
      createdAt: '2026-09-10T12:00:00Z',
      gig: { category: 'Web Development' },
    },
    {
      _id: 'b3',
      price: 10000,
      status: 'in_progress',
      createdAt: '2026-09-20T14:00:00Z',
      gig: { category: 'UI/UX Design' },
    },
    {
      _id: 'b4',
      price: 5000,
      status: 'cancelled',
      createdAt: '2026-09-25T09:00:00Z',
      gig: { category: 'UI/UX Design' },
    },
  ];

  test('aggregates gross, realized, and pending income correctly excluding cancelled orders', () => {
    const res = aggregateFreelancerIncome(mockBookings);
    // Valid are b1 (15000), b2 (25000), b3 (10000) => 50000 gross
    expect(res.grossEarned).toBe(50000);
    expect(res.realizedIncome).toBe(40000);
    expect(res.pendingIncome).toBe(10000);
    expect(res.orderStats.totalOrders).toBe(4);
    expect(res.orderStats.completedOrders).toBe(2);
    expect(res.orderStats.activeOrders).toBe(1);
    expect(res.orderStats.cancelledOrders).toBe(1);
    expect(res.orderStats.averageOrderValue).toBe(Math.round((50000 / 3) * 100) / 100);
  });

  test('groups timeline by month with monthly tax estimates', () => {
    const res = aggregateFreelancerIncome(mockBookings);
    expect(res.monthlyTimeline).toHaveLength(2);
    const aug = res.monthlyTimeline.find((m) => m.key === '2026-08');
    const sep = res.monthlyTimeline.find((m) => m.key === '2026-09');
    expect(aug.grossIncome).toBe(15000);
    expect(sep.grossIncome).toBe(35000);
  });

  test('breaks down income by gig category with correct percentage share', () => {
    const res = aggregateFreelancerIncome(mockBookings);
    expect(res.categoryBreakdown).toHaveLength(2);
    const web = res.categoryBreakdown.find((c) => c.category === 'Web Development');
    const design = res.categoryBreakdown.find((c) => c.category === 'UI/UX Design');
    expect(web.totalIncome).toBe(40000);
    expect(web.percentage).toBe(80); // 40000 / 50000 = 80%
    expect(design.totalIncome).toBe(10000);
    expect(design.percentage).toBe(20); // 10000 / 50000 = 20%
  });
});
