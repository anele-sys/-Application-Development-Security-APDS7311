import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Receipt,
  Wallet,
  Percent,
  Calendar,
  Layers,
  HelpCircle,
  Calculator,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  PieChart as PieIcon,
  Sliders,
  Sparkles,
  ArrowRight,
  Info,
  DollarSign,
  Award,
} from 'lucide-react';
import bookingService from '../../services/bookingService';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 2,
  }).format(Number(val) || 0);

const IncomeTaxDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Simulation state
  const [deductionsInput, setDeductionsInput] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [customGrossInput, setCustomGrossInput] = useState('');
  const [simulatedData, setSimulatedData] = useState(null);

  // Explanation accordion state
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeExplainTab, setActiveExplainTab] = useState('brackets');

  const fetchAnalytics = async (deductions = 0) => {
    try {
      const response = await bookingService.getIncomeAnalytics(deductions);
      if (response.success && response.analytics) {
        setAnalytics(response.analytics);
        if (!isSimulating) {
          setCustomGrossInput(String(response.analytics.grossEarned || ''));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load income and tax analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(0);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchAnalytics(deductionsInput);
  };

  const handleSimulate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const income =
        Number(customGrossInput) >= 0 ? Number(customGrossInput) : analytics?.grossEarned || 0;
      const deductions = Number(deductionsInput) || 0;
      const res = await bookingService.simulateTax({
        grossIncome: income,
        deductibleExpenses: deductions,
      });
      if (res.success) {
        setSimulatedData(res.simulation);
        setIsSimulating(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Simulation failed');
    }
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setSimulatedData(null);
    setDeductionsInput(0);
    setCustomGrossInput(String(analytics?.grossEarned || ''));
    fetchAnalytics(0);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Computing income aggregation and SARS tax calculations..." />;
  }

  // Active display data (simulated or real)
  const activeTax = isSimulating && simulatedData ? simulatedData : analytics?.taxSummary;
  const gross = isSimulating && simulatedData ? simulatedData.grossIncome : analytics?.grossEarned || 0;
  const realized = analytics?.realizedIncome || 0;
  const pending = analytics?.pendingIncome || 0;
  const taxPayable = activeTax?.netTaxPayable || 0;
  const takeHome = activeTax?.netTakeHomePay || gross;
  const effectiveRate = activeTax?.effectiveTaxRate || 0;
  const marginalRate = activeTax?.marginalTaxRatePercent || '18%';
  const isBelowThreshold = activeTax?.isBelowThreshold;
  const deductions = activeTax?.deductibleExpenses || 0;

  // Derived user-friendly metrics
  const takeHomePercent = gross > 0 ? Number(((takeHome / gross) * 100).toFixed(1)) : 100;
  const taxPercent = gross > 0 ? Number(((taxPayable / gross) * 100).toFixed(1)) : 0;
  const takeHomePer1000 = gross > 0 ? Math.round((takeHome / gross) * 1000) : 1000;
  const taxPer1000 = gross > 0 ? Math.round((taxPayable / gross) * 1000) : 0;
  const monthlyTaxSavings = Math.round((taxPayable / 12) * 100) / 100;

  // Max value for monthly chart scaling
  const maxMonthIncome = Math.max(
    ...(analytics?.monthlyTimeline || []).map((m) => m.grossIncome),
    1000
  );

  return (
    <div className="tax-dashboard-container">
      {/* Top Banner and Controls */}
      <div className="tax-header-bar">
        <div>
          <div className="tax-badge-row">
            <span className="badge badge-primary">
              <ShieldCheck size={13} style={{ marginRight: 4 }} />
              SARS Individual Tax Engine (2025/2026 Rates)
            </span>
            <span className="badge badge-info">Currency: ZAR (R)</span>
            {isSimulating && (
              <span className="badge badge-warning">
                <Sliders size={13} style={{ marginRight: 4 }} />
                Simulator Mode Active
              </span>
            )}
          </div>
          <h2 className="tax-main-title">Freelancer Income &amp; Tax Intelligence</h2>
          <p className="tax-subtitle">
            Automated revenue tracking, progressive tax obligations, provisional milestones, and expense deductions.
          </p>
        </div>

        <div className="tax-header-actions">
          {isSimulating && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetSimulation}
            >
              Reset Simulation
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Updating...' : 'Sync Data'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handlePrint}
          >
            <Printer size={14} />
            Print Report
          </button>
        </div>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError(null)} />}

      {/* Human-Friendly "What This Means For Your Pocket" Takeaway Banner */}
      <div className={`tax-pocket-summary-card ${isBelowThreshold ? 'below-threshold' : 'above-threshold'}`}>
        <div className="pocket-summary-left">
          <div className="pocket-badge-pill">
            {isBelowThreshold ? (
              <>
                <CheckCircle size={15} /> 100% Tax-Free Earnings
              </>
            ) : (
              <>
                <Award size={15} /> Retained Take-Home: {takeHomePercent}% of Gross
              </>
            )}
          </div>

          <h3 className="pocket-headline">
            {isBelowThreshold ? (
              <>You currently owe <strong>R0.00</strong> in income tax</>
            ) : (
              <>
                You keep <strong>{formatCurrency(takeHome)}</strong> in your pocket
              </>
            )}
          </h3>

          <p className="pocket-explanation">
            {isBelowThreshold ? (
              <>
                Because your platform revenue of <strong>{formatCurrency(gross)}</strong> is below the statutory SARS tax-free threshold of <strong>{formatCurrency(95750)}</strong>, the primary tax rebate completely offsets your tax liability. Every rand you earn is 100% yours to keep!
              </>
            ) : (
              <>
                Even though your top marginal tax bracket is <strong>{marginalRate}</strong>, your actual effective tax rate is only <strong>{effectiveRate}%</strong>. For every <strong>R1,000</strong> you bill a client, you pocket <strong>R{takeHomePer1000}</strong>, and only need to reserve <strong>R{taxPer1000}</strong> for SARS.
              </>
            )}
          </p>

          {/* Visual Cash Flow Bar: Where Every Rand Goes */}
          <div className="cash-flow-visual-box">
            <div className="cash-flow-bar-header">
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Where Every Rand Goes:
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {takeHomePercent}% Kept • {taxPercent}% Tax Reserve
              </span>
            </div>
            <div className="cash-flow-bar-track">
              <div
                className="cash-flow-bar-net"
                style={{ width: `${Math.max(5, takeHomePercent)}%` }}
                title={`Take-Home Pay: ${formatCurrency(takeHome)} (${takeHomePercent}%)`}
              />
              {taxPercent > 0 && (
                <div
                  className="cash-flow-bar-tax"
                  style={{ width: `${Math.max(2, taxPercent)}%` }}
                  title={`Estimated Tax: ${formatCurrency(taxPayable)} (${taxPercent}%)`}
                />
              )}
            </div>
          </div>
        </div>

        <div className="pocket-summary-right">
          <div className="pocket-stat-box">
            <span className="pocket-stat-title">
              {isBelowThreshold ? 'Remaining Tax-Free Headroom' : 'Suggested Monthly Tax Reserve'}
            </span>
            <div className="pocket-stat-number">
              {isBelowThreshold
                ? formatCurrency(Math.max(0, 95750 - (activeTax?.taxableIncome || 0)))
                : `${formatCurrency(monthlyTaxSavings)} / mo`}
            </div>
            <span className="pocket-stat-desc">
              {isBelowThreshold
                ? 'You can earn this much more before owing any tax'
                : 'Set aside monthly into savings for zero-stress returns'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="stats-grid tax-kpi-grid">
        {/* Card 1: Gross Income */}
        <div className="stat-card card-kpi-highlight">
          <div className="kpi-icon-wrapper kpi-icon-gross">
            <TrendingUp size={22} />
          </div>
          <div className="stat-label">Total Gross Earnings</div>
          <div className="stat-value text-primary">{formatCurrency(gross)}</div>
          <div className="kpi-subtext">
            <span>Realized: <strong>{formatCurrency(realized)}</strong></span>
            <span style={{ margin: '0 6px' }}>•</span>
            <span>Pending: <strong>{formatCurrency(pending)}</strong></span>
          </div>
        </div>

        {/* Card 2: Estimated Tax Obligation */}
        <div className="stat-card card-kpi-highlight">
          <div className="kpi-icon-wrapper kpi-icon-tax">
            <Receipt size={22} />
          </div>
          <div className="stat-label">Estimated Tax Payable</div>
          <div className="stat-value" style={{ color: taxPayable > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {formatCurrency(taxPayable)}
          </div>
          <div className="kpi-subtext">
            {isBelowThreshold ? (
              <span className="text-success" style={{ fontWeight: 600 }}>
                ✓ Below R95,750 Tax Threshold (0% Net Tax)
              </span>
            ) : (
              <span>SARS Primary Rebate (R17,235) Applied</span>
            )}
          </div>
        </div>

        {/* Card 3: Net Take-Home Pay */}
        <div className="stat-card card-kpi-highlight">
          <div className="kpi-icon-wrapper kpi-icon-net">
            <Wallet size={22} />
          </div>
          <div className="stat-label">Net Take-Home Income</div>
          <div className="stat-value text-success">{formatCurrency(takeHome)}</div>
          <div className="kpi-subtext">
            <span>
              Retained: <strong>{takeHomePercent}%</strong> of gross revenue
            </span>
          </div>
        </div>

        {/* Card 4: Effective & Marginal Rates */}
        <div className="stat-card card-kpi-highlight">
          <div className="kpi-icon-wrapper kpi-icon-rate">
            <Percent size={22} />
          </div>
          <div className="stat-label">Effective Tax Rate</div>
          <div className="stat-value text-info">{effectiveRate}%</div>
          <div className="kpi-subtext">
            <span>Marginal Bracket: <strong>{marginalRate}</strong></span>
          </div>
        </div>
      </div>

      {/* Visual Progressive Bracket Ladder: Clear & Intuitive */}
      <div className="card tax-card progressive-ladder-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} className="text-primary" />
            <h3 className="card-title">SARS Progressive Tax Bracket Ladder</h3>
          </div>
          <p className="card-subtitle">
            Only income that spills into a higher step is taxed at that step's rate. Moving up a bracket never reduces your total take-home pay!
          </p>
        </div>

        <div className="bracket-ladder-grid">
          {(activeTax?.bracketBreakdown || []).map((b) => {
            const isFull = b.max !== Infinity && (activeTax?.taxableIncome || 0) >= b.max;
            const isCurrent = b.isCurrentBracket;
            const capacity = b.max !== Infinity ? b.max - b.min : 500000;
            const fillPercent =
              capacity > 0
                ? Math.min(100, Math.round((b.taxableAmountInBracket / capacity) * 100))
                : 0;

            return (
              <div
                className={`ladder-step ${isCurrent ? 'ladder-step-current' : ''} ${isFull ? 'ladder-step-full' : ''}`}
                key={b.bracket}
              >
                <div className="ladder-step-top">
                  <div className="ladder-tier-badge">
                    <strong>Tier {b.bracket}</strong>
                    <span className="ladder-rate-tag">{b.ratePercent}</span>
                  </div>
                  {isCurrent && (
                    <span className="badge badge-primary pulse-badge">
                      <CheckCircle size={11} style={{ marginRight: 3 }} /> You Are Here
                    </span>
                  )}
                </div>

                <div className="ladder-range-label">{b.label}</div>

                <div className="ladder-progress-track">
                  <div
                    className={`ladder-progress-fill ${isCurrent ? 'fill-current' : isFull ? 'fill-full' : ''}`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>

                <div className="ladder-step-footer">
                  <span>Taxed in Tier:</span>
                  <strong>{formatCurrency(b.taxInBracket)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="tax-visuals-grid">
        {/* Visual 1: Monthly Timeline Bar Chart */}
        <div className="card tax-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} className="text-primary" />
              <h3 className="card-title">Monthly Revenue &amp; Tax Distribution</h3>
            </div>
            <p className="card-subtitle">
              Visual breakdown of gross earnings, tax obligations, and retained net pay by month.
            </p>
          </div>

          {(!analytics?.monthlyTimeline || analytics.monthlyTimeline.length === 0) ? (
            <div className="empty-chart-box">
              <Calendar size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No monthly booking data recorded yet</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                As clients purchase your gigs, your monthly revenue trend and projected tax liability chart will automatically render here.
              </p>
            </div>
          ) : (
            <div className="svg-chart-container">
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color legend-gross" /> Gross Revenue
                </span>
                <span className="legend-item">
                  <span className="legend-color legend-tax" /> Est. Tax
                </span>
                <span className="legend-item">
                  <span className="legend-color legend-net" /> Net Retained
                </span>
              </div>

              <div className="bar-chart-wrapper">
                {analytics.monthlyTimeline.map((item) => {
                  const grossHeight = Math.max(14, Math.round((item.grossIncome / maxMonthIncome) * 160));
                  const taxHeight = Math.max(3, Math.round((item.estimatedTax / maxMonthIncome) * 160));
                  const netHeight = Math.max(10, Math.round((item.netIncome / maxMonthIncome) * 160));

                  return (
                    <div className="bar-group" key={item.key}>
                      <div className="bars-track">
                        {/* Gross Bar */}
                        <div
                          className="bar-col bar-col-gross"
                          style={{ height: `${grossHeight}px` }}
                          title={`Gross: ${formatCurrency(item.grossIncome)} (${item.orderCount} orders)`}
                        >
                          <span className="bar-tooltip">{formatCurrency(item.grossIncome)}</span>
                        </div>
                        {/* Tax Bar */}
                        <div
                          className="bar-col bar-col-tax"
                          style={{ height: `${taxHeight}px` }}
                          title={`Tax: ${formatCurrency(item.estimatedTax)}`}
                        >
                          <span className="bar-tooltip">{formatCurrency(item.estimatedTax)}</span>
                        </div>
                        {/* Net Bar */}
                        <div
                          className="bar-col bar-col-net"
                          style={{ height: `${netHeight}px` }}
                          title={`Net: ${formatCurrency(item.netIncome)}`}
                        >
                          <span className="bar-tooltip">{formatCurrency(item.netIncome)}</span>
                        </div>
                      </div>
                      <span className="bar-label">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Visual 2: Category Income Share */}
        <div className="card tax-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieIcon size={18} className="text-secondary" />
              <h3 className="card-title">Income by Service Category</h3>
            </div>
            <p className="card-subtitle">
              Distribution of earnings across your published freelance service categories.
            </p>
          </div>

          {(!analytics?.categoryBreakdown || analytics.categoryBreakdown.length === 0) ? (
            <div className="empty-chart-box">
              <Layers size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No category earnings recorded</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Category metrics will display as clients order your diverse freelance listings.
              </p>
            </div>
          ) : (
            <div className="category-list">
              {analytics.categoryBreakdown.map((cat, idx) => (
                <div className="category-row" key={cat.category}>
                  <div className="category-info">
                    <span className="category-name">{cat.category}</span>
                    <span className="category-amount">
                      <strong>{formatCurrency(cat.totalIncome)}</strong> ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill category-fill-${(idx % 4) + 1}`}
                      style={{ width: `${Math.max(5, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SARS Progressive Tax Bracket Detailed Breakdown Table */}
      <div className="card tax-card bracket-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} className="text-primary" />
            <h3 className="card-title">SARS Progressive Tax Bracket Analysis (2025/2026)</h3>
          </div>
          <p className="card-subtitle">
            Visual inspection of how your income is segmented and taxed across official South African tax brackets.
          </p>
        </div>

        <div className="table-responsive">
          <table className="data-table bracket-table">
            <thead>
              <tr>
                <th>Bracket Tier</th>
                <th>Taxable Income Range (ZAR)</th>
                <th>Statutory Marginal Rate</th>
                <th>Your Income in Tier</th>
                <th>Tax Incurred in Tier</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(activeTax?.bracketBreakdown || []).map((b) => (
                <tr
                  key={b.bracket}
                  className={b.isCurrentBracket ? 'active-bracket-row' : ''}
                >
                  <td>
                    <strong>Tier {b.bracket}</strong>
                  </td>
                  <td>{b.label}</td>
                  <td>
                    <span className="badge badge-info">{b.ratePercent}</span>
                  </td>
                  <td>
                    <strong>{formatCurrency(b.taxableAmountInBracket)}</strong>
                  </td>
                  <td>
                    <span style={{ color: b.taxInBracket > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                      {formatCurrency(b.taxInBracket)}
                    </span>
                  </td>
                  <td>
                    {b.isCurrentBracket ? (
                      <span className="badge badge-primary">
                        <CheckCircle size={12} style={{ marginRight: 3 }} />
                        Current Marginal Tier
                      </span>
                    ) : b.taxableAmountInBracket > 0 ? (
                      <span className="badge badge-success">Completed Tier</span>
                    ) : (
                      <span className="badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                        Unreached
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>
                  <strong>Total Statutory Tax Before Rebates</strong>
                </td>
                <td>
                  <strong>{formatCurrency(activeTax?.taxableIncome || 0)}</strong>
                </td>
                <td>
                  <strong style={{ color: 'var(--color-danger)' }}>
                    {formatCurrency(activeTax?.grossTaxBeforeRebate || 0)}
                  </strong>
                </td>
                <td>—</td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <span className="text-success">Less: SARS Primary Tax Rebate (Individual Under 65)</span>
                </td>
                <td>—</td>
                <td>
                  <strong className="text-success">- {formatCurrency(activeTax?.primaryRebate || 17235)}</strong>
                </td>
                <td>
                  <span className="badge badge-success">Annual SARS Rebate</span>
                </td>
              </tr>
              <tr style={{ background: 'var(--color-primary-light)', fontWeight: 700 }}>
                <td colSpan={3}>
                  <strong style={{ color: 'var(--color-primary)' }}>Final Net Estimated Tax Liability</strong>
                </td>
                <td>—</td>
                <td>
                  <strong style={{ color: 'var(--color-danger)', fontSize: '1.05rem' }}>
                    {formatCurrency(activeTax?.netTaxPayable || 0)}
                  </strong>
                </td>
                <td>
                  <span className="badge badge-primary">
                    Effective Rate: {activeTax?.effectiveTaxRate || 0}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Provisional Tax Obligations and Interactive Simulator */}
      <div className="tax-dual-grid">
        {/* Provisional Tax Tracker */}
        <div className="card tax-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} className="text-warning" />
              <h3 className="card-title">SARS Provisional Tax Milestones (IRP6)</h3>
            </div>
            <p className="card-subtitle">
              South African freelancers and sole proprietors pay tax semi-annually in two installments.
            </p>
          </div>

          <div className="provisional-timeline">
            {/* Period 1 */}
            <div className="provisional-card">
              <div className="provisional-header">
                <div>
                  <h4>1st Provisional Payment</h4>
                  <p className="text-muted">Due Date: <strong>31 August</strong></p>
                </div>
                <span className="badge badge-info">50% Annual Estimate</span>
              </div>
              <div className="provisional-amount">
                {formatCurrency(activeTax?.provisionalTax?.period1Amount || 0)}
              </div>
              <p className="provisional-note">
                Calculated as half of your estimated annual tax liability, covering the first 6 months.
              </p>
            </div>

            {/* Period 2 */}
            <div className="provisional-card">
              <div className="provisional-header">
                <div>
                  <h4>2nd Provisional Payment</h4>
                  <p className="text-muted">Due Date: <strong>28 / 29 February</strong></p>
                </div>
                <span className="badge badge-info">Remaining 50%</span>
              </div>
              <div className="provisional-amount">
                {formatCurrency(activeTax?.provisionalTax?.period2Amount || 0)}
              </div>
              <p className="provisional-note">
                Reconciles the full annual taxable income minus the 1st provisional installment paid.
              </p>
            </div>

            {/* Monthly Action Advice Box */}
            <div className="provisional-action-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                <Info size={16} /> Freelancer Practical Tip:
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Set aside approximately <strong>{formatCurrency(monthlyTaxSavings)}</strong> every month into an interest-bearing business savings pocket so you are 100% prepared when deadlines arrive.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Expense & Tax Simulator */}
        <div className="card tax-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={18} className="text-success" />
              <h3 className="card-title">Tax &amp; Expense Simulator</h3>
            </div>
            <p className="card-subtitle">
              Simulate deductible business expenses (s11(a)) and test prospective income scenarios.
            </p>
          </div>

          <form className="tax-sim-form" onSubmit={handleSimulate}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="custom-gross">
                  Simulated Annual Gross Income (ZAR)
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {formatCurrency(customGrossInput || 0)}
                </span>
              </div>
              <input
                id="custom-gross"
                type="number"
                min="0"
                step="500"
                className="form-input"
                placeholder="e.g. 250000"
                value={customGrossInput}
                onChange={(e) => setCustomGrossInput(e.target.value)}
              />
              <span className="form-hint">
                Default: Current platform earnings ({formatCurrency(analytics?.grossEarned || 0)})
              </span>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="deductible-expenses">
                  Allowable Business Deductions (ZAR)
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  {formatCurrency(deductionsInput || 0)}
                </span>
              </div>
              <input
                id="deductible-expenses"
                type="number"
                min="0"
                step="500"
                className="form-input"
                placeholder="e.g. 24000 (Internet, Software, Hardware)"
                value={deductionsInput}
                onChange={(e) => setDeductionsInput(Number(e.target.value))}
              />
              <span className="form-hint">
                Deductible expenses incurred in the production of freelance income (Section 11(a)).
              </span>
            </div>

            <div className="tax-sim-actions">
              <button type="submit" className="btn btn-primary">
                <Sparkles size={15} />
                Calculate Scenario
              </button>
              {isSimulating && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResetSimulation}
                >
                  Reset
                </button>
              )}
            </div>

            {isSimulating && simulatedData && (
              <div className="simulation-results-callout">
                <div className="sim-result-item">
                  <span>New Taxable Income:</span>
                  <strong>{formatCurrency(simulatedData.taxableIncome)}</strong>
                </div>
                <div className="sim-result-item">
                  <span>Updated Tax Payable:</span>
                  <strong style={{ color: 'var(--color-danger)' }}>
                    {formatCurrency(simulatedData.netTaxPayable)}
                  </strong>
                </div>
                <div className="sim-result-item">
                  <span>Tax Saved by Deductions:</span>
                  <strong className="text-success" style={{ fontSize: '1.1rem' }}>
                    {formatCurrency(
                      Math.max(
                        0,
                        (analytics?.taxSummary?.netTaxPayable || 0) - simulatedData.netTaxPayable
                      )
                    )}
                  </strong>
                </div>
                <div className="sim-result-item">
                  <span>New Effective Rate:</span>
                  <strong className="text-info">{simulatedData.effectiveTaxRate}%</strong>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* In-App Explanation of Tax Calculation Logic (POE Rubric Requirement) */}
      <div className="card tax-card tax-explanation-card">
        <div
          className="card-header explanation-header"
          onClick={() => setShowExplanation(!showExplanation)}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={20} className="text-primary" />
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>
                Comprehensive Guide: How HustleHub+ Calculates Your Taxes
              </h3>
              <p className="card-subtitle" style={{ margin: 0 }}>
                Detailed explanation of SARS progressive tax brackets, rebates, thresholds, and formulas.
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" aria-label="Toggle tax explanation">
            {showExplanation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {showExplanation && (
          <div className="explanation-body">
            {/* Tabs for Explanation */}
            <div className="explanation-tabs">
              <button
                type="button"
                className={`tab-btn ${activeExplainTab === 'brackets' ? 'active' : ''}`}
                onClick={() => setActiveExplainTab('brackets')}
              >
                1. Progressive Tax vs Flat Tax
              </button>
              <button
                type="button"
                className={`tab-btn ${activeExplainTab === 'formula' ? 'active' : ''}`}
                onClick={() => setActiveExplainTab('formula')}
              >
                2. The Mathematical Formula
              </button>
              <button
                type="button"
                className={`tab-btn ${activeExplainTab === 'rebates' ? 'active' : ''}`}
                onClick={() => setActiveExplainTab('rebates')}
              >
                3. Rebates &amp; Thresholds
              </button>
              <button
                type="button"
                className={`tab-btn ${activeExplainTab === 'provisional' ? 'active' : ''}`}
                onClick={() => setActiveExplainTab('provisional')}
              >
                4. Provisional Tax &amp; Deductions
              </button>
            </div>

            <div className="explanation-content">
              {activeExplainTab === 'brackets' && (
                <div>
                  <h4>Understanding the Progressive Tax System</h4>
                  <p>
                    South Africa uses a <strong>progressive marginal tax system</strong>. This means you do <em>not</em> pay a single flat rate across all your earnings. Instead, your income is divided into "tiers" or brackets:
                  </p>
                  <ul>
                    <li>The first <strong>R237,100</strong> you earn is taxed at only <strong>18%</strong>.</li>
                    <li>Only the portion between <strong>R237,101 and R370,500</strong> is taxed at <strong>26%</strong>.</li>
                    <li>Higher portions step up incrementally to 31%, 36%, 39%, 41%, and 45%.</li>
                  </ul>
                  <div className="alert-callout info">
                    <strong>Crucial Takeaway:</strong> Moving into a higher tax bracket <em>never</em> reduces your net take-home pay. Only the specific portion of earnings that exceeds the bracket floor is taxed at the higher marginal rate!
                  </div>
                </div>
              )}

              {activeExplainTab === 'formula' && (
                <div>
                  <h4>The Mathematical Formula Used by the Engine</h4>
                  <p>
                    For any given gross freelance revenue, the backend utility performs the following exact calculation:
                  </p>
                  <div className="formula-box">
                    <code>
                      1. Taxable Income = max(0, Gross Income - Deductible Business Expenses)<br />
                      2. Gross Tax = Base Bracket Tax + [(Taxable Income - Bracket Floor) × Marginal Rate]<br />
                      3. Net Tax Payable = max(0, Gross Tax - Primary Tax Rebate)<br />
                      4. Effective Tax Rate = (Net Tax Payable ÷ Gross Income) × 100%
                    </code>
                  </div>
                  <h5 style={{ marginTop: '1rem' }}>Worked Example:</h5>
                  <p>
                    Suppose you earn <strong>R300,000</strong> on HustleHub+ in a tax year:
                  </p>
                  <ol>
                    <li>This falls into <strong>Bracket 2</strong> (R237,101 - R370,500).</li>
                    <li>Base Tax for Bracket 2 = <strong>R42,678</strong>.</li>
                    <li>Amount above floor: R300,000 - R237,100 = <strong>R62,900</strong>.</li>
                    <li>Marginal Tax at 26%: R62,900 × 0.26 = <strong>R16,354</strong>.</li>
                    <li>Gross Tax before rebate: R42,678 + R16,354 = <strong>R59,032</strong>.</li>
                    <li>Less Primary Rebate: R59,032 - R17,235 = <strong>R41,797</strong> Net Tax.</li>
                    <li>
                      <strong>Effective Tax Rate:</strong> R41,797 ÷ R300,000 = <strong>13.93%</strong> (far below the 26% marginal bracket!).
                    </li>
                  </ol>
                </div>
              )}

              {activeExplainTab === 'rebates' && (
                <div>
                  <h4>Primary Tax Rebates and the Tax-Free Threshold</h4>
                  <p>
                    Under South African law, every individual taxpayer under age 65 is granted an automatic statutory <strong>Primary Tax Rebate of R17,235</strong>.
                  </p>
                  <div className="rebate-grid">
                    <div className="rebate-box">
                      <h5>Primary Rebate (Under 65)</h5>
                      <span className="rebate-val">R17,235</span>
                      <p>Direct subtraction from gross calculated income tax.</p>
                    </div>
                    <div className="rebate-box">
                      <h5>Tax-Free Threshold</h5>
                      <span className="rebate-val">R95,750</span>
                      <p>If you earn R95,750 or less, your net tax is R0.00.</p>
                    </div>
                  </div>
                  <p style={{ marginTop: '1rem' }}>
                    Because <code>R95,750 × 18% = R17,235</code>, the rebate completely cancels out all tax up to R95,750. If you are starting out or freelancing part-time and earn under this threshold, you owe <strong>R0 in income tax</strong>.
                  </p>
                </div>
              )}

              {activeExplainTab === 'provisional' && (
                <div>
                  <h4>Provisional Tax &amp; Allowable Deductions for Freelancers</h4>
                  <h5>1. Section 11(a) Allowable Deductions</h5>
                  <p>
                    Freelancers are independent contractors (sole proprietors). Under Section 11(a) of the Income Tax Act (the general deduction formula), you can deduct expenses incurred in the production of income:
                  </p>
                  <ul>
                    <li>Home office space percentage (rates, rent, electricity)</li>
                    <li>Fiber internet &amp; mobile phone bills for business use</li>
                    <li>Software subscriptions (Figma, GitHub, IDE licenses, Cloud hosting)</li>
                    <li>Hardware depreciation (computers, monitors, development phones)</li>
                  </ul>
                  <h5 style={{ marginTop: '1rem' }}>2. Provisional Tax System (IRP6)</h5>
                  <p>
                    Unlike permanent employees whose tax is deducted monthly via PAYE, freelancers must register as <strong>Provisional Taxpayers</strong> and pay in two installments:
                  </p>
                  <ul>
                    <li><strong>1st Period (August 31):</strong> Pay 50% of your estimated annual tax.</li>
                    <li><strong>2nd Period (February 28):</strong> Pay the remaining balance based on actual earnings.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeTaxDashboard;
