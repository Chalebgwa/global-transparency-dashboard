import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RadialTimeChart from './components/RadialTimeChart';
import OrganicBubbleChart from './components/OrganicBubbleChart';
import CircularProgress from './components/CircularProgress';
import FlowingMultiChart from './components/FlowingMultiChart';
import FloatingParticles from './components/FloatingParticles';
import CorruptionTracker from './components/CorruptionTracker';
import ContractsTracker from './components/ContractsTracker';
import NDP12Dashboard from './components/NDP12Dashboard';
import './styles/modern.css';

const BOTSWANA_CODE = 'BW';
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080';

const fetchJson = async (url, fallback, onUnsupported, context = 'API') => {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 501 && onUnsupported) {
      onUnsupported(true);
    } else {
      console.error(`API request failed (${context})`, { status: response.status });
    }
    return fallback;
  }
  try {
    return await response.json();
  } catch (error) {
    console.error(`API response parse failed (${context})`, { error });
    return fallback;
  }
};

function App() {
  const [country, setCountry] = useState(null);
  const [history, setHistory] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [cpiHistory, setCpiHistory] = useState([]);
  const [healthHistory, setHealthHistory] = useState([]);
  const [educationHistory, setEducationHistory] = useState([]);
  const [corruptionCases, setCorruptionCases] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [corruptionUnavailable, setCorruptionUnavailable] = useState(false);
  const [contractsUnavailable, setContractsUnavailable] = useState(false);

  useEffect(() => {
    const loadBotswana = async () => {
      setLoading(true);
      setCorruptionUnavailable(false);
      setContractsUnavailable(false);
      try {
        const [countryData, budgetHistory, budgetBreakdown, cpiData, healthData, educationData, corruptionData, contractsData] = await Promise.all([
          fetchJson(`${API_BASE_URL}/api/v1/countries/${BOTSWANA_CODE}`, null, undefined, 'Botswana profile'),
          fetchJson(`${API_BASE_URL}/api/v1/countries/${BOTSWANA_CODE}/budget/history`, [], undefined, 'Budget history'),
          fetchJson(`${API_BASE_URL}/api/v1/countries/${BOTSWANA_CODE}/budget/breakdown`, null, undefined, 'Budget breakdown'),
          fetchJson(`${API_BASE_URL}/api/v1/countries/${BOTSWANA_CODE}/cpi/history`, [], undefined, 'Governance history'),
          fetchJson(`${API_BASE_URL}/api/v1/countries/${BOTSWANA_CODE}/health/history`, [], undefined, 'Health history'),
          fetchJson(`${API_BASE_URL}/api/v1/countries/${BOTSWANA_CODE}/education/history`, [], undefined, 'Education history'),
          fetchJson(`${API_BASE_URL}/api/v1/countries/${BOTSWANA_CODE}/corruption`, [], setCorruptionUnavailable, 'Corruption cases'),
          fetchJson(`${API_BASE_URL}/api/v1/countries/${BOTSWANA_CODE}/contracts`, [], setContractsUnavailable, 'Contracts')
        ]);

        setCountry(countryData);
        setHistory(budgetHistory);
        setBreakdown(budgetBreakdown);
        setCpiHistory(cpiData);
        setHealthHistory(healthData);
        setEducationHistory(educationData);
        setCorruptionCases(corruptionData);
        setContracts(contractsData);
      } catch (error) {
        console.error('Error loading Botswana data:', error);
        setCountry(null);
        setHistory([]);
        setBreakdown(null);
        setCpiHistory([]);
        setHealthHistory([]);
        setEducationHistory([]);
        setCorruptionCases([]);
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    loadBotswana();
  }, []);

  const formatCurrency = (value, currency = 'USD') => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatCompactCurrency = (value, currency = 'USD') => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatLargeNumber = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const budgetIndicator = country?.indicators?.budget;
  const healthIndicator = country?.indicators?.health;
  const educationIndicator = country?.indicators?.education;
  const corruptionIndicator = country?.indicators?.corruption;
  const hasCorruptionScore = corruptionIndicator?.value !== null && corruptionIndicator?.value !== undefined;

  return (
    <div className="modern-app">
      <FloatingParticles count={18} />
      <div className="modern-header modern-fade-in">
        <h1 className="modern-title">🇧🇼 Botswana Transparency & Service Delivery Dashboard</h1>
        <p className="modern-subtitle">
          A citizen-friendly view of public finance and governance metrics for Botswana.
        </p>
        <p className="modern-subtitle" style={{ fontSize: '0.9rem', marginTop: '5px' }}>
          Data sources: World Bank indicators and RestCountries country profile.
        </p>
      </div>

      <div className="modern-nav modern-fade-in">
        <h2>National Overview</h2>
        <div className="modern-btn-group">
          <button
            onClick={() => setActiveView('overview')}
            className={`modern-btn ${activeView === 'overview' ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
          >
            🇧🇼 Botswana Overview
          </button>
          <button
            onClick={() => setActiveView('ndp12')}
            className={`modern-btn ${activeView === 'ndp12' ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
          >
            📌 NDP 12 Delivery
          </button>
        </div>
      </div>

      {activeView === 'ndp12' ? (
        <div className="modern-section modern-fade-in">
          <NDP12Dashboard apiBaseUrl={API_BASE_URL} />
        </div>
      ) : (
        <div data-testid="country-details">
          <div className="modern-section modern-fade-in">
            <h2 className="modern-section-title">Botswana Public Data Snapshot</h2>
            {loading && (
              <div className="modern-chart-empty">
                <h3>Loading Botswana metrics</h3>
                <p>Connecting to public data sources...</p>
              </div>
            )}

            {!loading && !country && (
              <div className="modern-chart-empty">
                <h3>Data temporarily unavailable</h3>
                <p>We could not load Botswana indicators. Please try again later.</p>
              </div>
            )}

            {!loading && country && (
              <>
                <div className="modern-metrics-grid">
                  <div className="modern-metric-card accent modern-stagger modern-fade-in">
                    {hasCorruptionScore ? (
                      <CircularProgress
                        value={corruptionIndicator.value}
                        maxValue={100}
                        title="Governance Integrity"
                        color="#0ea5e9"
                      />
                    ) : (
                      <div className="modern-chart-empty" style={{ padding: '20px' }}>
                        <h3>Governance Integrity</h3>
                        <p>Score not available</p>
                      </div>
                    )}
                    <small style={{ marginTop: '10px', display: 'block' }}>
                      {corruptionIndicator?.year ? `World Bank estimate (${corruptionIndicator.year})` : 'World Bank estimate'}
                    </small>
                  </div>

                  <div className="modern-metric-card primary modern-stagger modern-fade-in">
                    <h3 className="modern-metric-title">💰 Government Spending</h3>
                    <p className="modern-metric-value">
                      {formatCurrency(budgetIndicator?.value, budgetIndicator?.currency)}
                    </p>
                    <small className="modern-metric-subtitle">
                      Latest available year {budgetIndicator?.year ? `(${budgetIndicator.year})` : ''}
                    </small>
                  </div>

                  <div className="modern-metric-card warning modern-stagger modern-fade-in">
                    <h3 className="modern-metric-title">🏥 Health Spend Per Person</h3>
                    <p className="modern-metric-value">
                      {formatCurrency(healthIndicator?.value, healthIndicator?.currency)}
                    </p>
                    <small className="modern-metric-subtitle">
                      Per capita (USD) {healthIndicator?.year ? `• ${healthIndicator.year}` : ''}
                    </small>
                  </div>

                  <div className="modern-metric-card success modern-stagger modern-fade-in">
                    <h3 className="modern-metric-title">🎓 Education Spend Per Person</h3>
                    <p className="modern-metric-value">
                      {formatCurrency(educationIndicator?.value, educationIndicator?.currency)}
                    </p>
                    <small className="modern-metric-subtitle">
                      Per capita (USD) {educationIndicator?.year ? `• ${educationIndicator.year}` : ''}
                    </small>
                  </div>

                  <div className="modern-metric-card modern-stagger modern-fade-in">
                    <h3 className="modern-metric-title">👥 Population</h3>
                    <p className="modern-metric-value">
                      {formatLargeNumber(country.population)}
                    </p>
                    <small className="modern-metric-subtitle">
                      Capital: {country.capital}
                    </small>
                  </div>

                  <div className="modern-metric-card modern-stagger modern-fade-in">
                    <h3 className="modern-metric-title">💱 Local Currency</h3>
                    <p className="modern-metric-value">
                      {country.local_currency?.code || 'BWP'}
                    </p>
                    <small className="modern-metric-subtitle">
                      {country.local_currency?.name || 'Botswana Pula'}
                    </small>
                  </div>
                </div>

                <div className="modern-charts-grid">
                  <div className="modern-chart-container modern-stagger modern-fade-in">
                    {breakdown ? (
                      <OrganicBubbleChart
                        data={breakdown}
                        title="💰 Estimated Budget Allocation"
                        formatValue={(value) => formatCompactCurrency(value, breakdown.currency)}
                      />
                    ) : (
                      <div className="modern-chart-empty">
                        <h3>Budget Allocation</h3>
                        <p>Sector breakdown not available.</p>
                      </div>
                    )}
                  </div>

                  <div className="modern-chart-container modern-stagger modern-fade-in">
                    {history.length > 0 ? (
                      <RadialTimeChart
                        data={history}
                        title="📈 Government Spending Trend"
                        color="#2563eb"
                        formatValue={(value) => formatCompactCurrency(value, budgetIndicator?.currency)}
                      />
                    ) : (
                      <div className="modern-chart-empty">
                        <h3>Government Spending Trend</h3>
                        <p>Historical series not available.</p>
                      </div>
                    )}
                  </div>

                  <div className="modern-chart-container modern-stagger modern-fade-in">
                    {healthHistory.length > 0 && educationHistory.length > 0 ? (
                      <FlowingMultiChart
                        healthData={healthHistory}
                        educationData={educationHistory}
                        title="🏥📚 Health vs Education Spending"
                        formatValue={(value) => formatCompactCurrency(value, healthIndicator?.currency)}
                      />
                    ) : (
                      <div className="modern-chart-empty">
                        <h3>Health vs Education Spending</h3>
                        <p>Trend data not available.</p>
                      </div>
                    )}
                  </div>

                  <div className="modern-chart-container modern-stagger modern-fade-in">
                    {cpiHistory.length > 0 ? (
                      <RadialTimeChart
                        data={cpiHistory}
                        title="🔍 Governance Integrity Trend"
                        color="#0ea5e9"
                        formatValue={(value) => `${value}/100`}
                      />
                    ) : (
                      <div className="modern-chart-empty">
                        <h3>Governance Integrity Trend</h3>
                        <p>Trend data not available.</p>
                      </div>
                    )}
                  </div>

                  <div className="modern-chart-container modern-stagger modern-fade-in">
                    <CorruptionTracker
                      cases={corruptionCases}
                      title="🚨 Reported Corruption Cases"
                    />
                    {corruptionUnavailable && (
                      <div className="modern-chart-empty">
                        <p>Public corruption case data is not yet published via API.</p>
                      </div>
                    )}
                  </div>

                  <div className="modern-chart-container modern-stagger modern-fade-in">
                    <ContractsTracker
                      contracts={contracts}
                      title="📋 Public Procurement Highlights"
                    />
                    {contractsUnavailable && (
                      <div className="modern-chart-empty">
                        <p>Public contract data is not yet published via API.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modern-footer modern-fade-in">
            <p className="modern-footer-quote">
              "Together we build trust — every citizen deserves clear, reliable public data."
            </p>
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                📊 <strong>Coverage:</strong> Budget, health, education, and governance indicators
              </p>
              <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                🧭 <strong>Purpose:</strong> Support informed dialogue and service delivery oversight
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                🔍 <strong>Sources:</strong> World Bank Open Data & RestCountries
              </p>
            </div>
            <small className="modern-footer-attribution">
              Botswana Transparency Dashboard — Updated as public data becomes available
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
