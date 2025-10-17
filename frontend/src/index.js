import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RadialTimeChart from './components/RadialTimeChart';
import OrganicBubbleChart from './components/OrganicBubbleChart';
import CircularProgress from './components/CircularProgress';
import FlowingMultiChart from './components/FlowingMultiChart';
import FloatingParticles from './components/FloatingParticles';
import CountryNetworkChart from './components/CountryNetworkChart';
import CorruptionTracker from './components/CorruptionTracker';
import ContractsTracker from './components/ContractsTracker';
import NDP12Dashboard from './components/NDP12Dashboard';
import './styles/modern.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [cpiHistory, setCpiHistory] = useState([]);
  const [healthHistory, setHealthHistory] = useState([]);
  const [educationHistory, setEducationHistory] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [relationships, setRelationships] = useState({});
  const [showNetwork, setShowNetwork] = useState(false);
  const [showNDP12, setShowNDP12] = useState(true);
  const [corruptionCases, setCorruptionCases] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');

  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/countries`)
      .then(res => res.json())
      .then(setCountries)
      .catch((error) => {
        console.error('Error fetching countries:', error);
        setCountries([]);
      });

    // Load meetings and relationships data
    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/meetings`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/v1/relationships`).then(res => res.json())
    ])
    .then(([meetingsData, relationshipsData]) => {
      setMeetings(meetingsData);
      setRelationships(relationshipsData);
    })
    .catch((error) => {
      console.error('Error fetching meetings/relationships:', error);
      setMeetings([]);
      setRelationships({});
    });
  }, []);

  const loadCountry = code => {
    // Load country details
    fetch(`${API_BASE_URL}/api/v1/countries/${code}`)
      .then(res => res.json())
      .then(data => {
        setSelected(data);
        return Promise.all([
          fetch(`${API_BASE_URL}/api/v1/countries/${code}/budget/history`).then(res => res.json()),
          fetch(`${API_BASE_URL}/api/v1/countries/${code}/budget/breakdown`).then(res => res.json()),
          fetch(`${API_BASE_URL}/api/v1/countries/${code}/cpi/history`).then(res => res.json()),
          fetch(`${API_BASE_URL}/api/v1/countries/${code}/health/history`).then(res => res.json()),
          fetch(`${API_BASE_URL}/api/v1/countries/${code}/education/history`).then(res => res.json()),
          fetch(`${API_BASE_URL}/api/v1/countries/${code}/corruption`).then(res => res.json()),
          fetch(`${API_BASE_URL}/api/v1/countries/${code}/contracts`).then(res => res.json())
        ]);
      })
      .then(([budgetHistory, budgetBreakdown, cpiData, healthData, educationData, corruptionData, contractsData]) => {
        setHistory(budgetHistory);
        setBreakdown(budgetBreakdown);
        setCpiHistory(cpiData);
        setHealthHistory(healthData);
        setEducationHistory(educationData);
        setCorruptionCases(corruptionData);
        setContracts(contractsData);
      })
      .catch((error) => {
        console.error('Error loading country data:', error);
        setSelected(null);
        setHistory([]);
        setBreakdown(null);
        setCpiHistory([]);
        setHealthHistory([]);
        setEducationHistory([]);
        setCorruptionCases([]);
        setContracts([]);
      });
  };

  const formatCurrency = (value, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatLargeNumber = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getTransparencyLevel = (score) => {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'fair';
    return 'poor';
  };

  const filteredCountries = selectedRegion === 'all' 
    ? countries 
    : countries.filter(c => c.region === selectedRegion || 
        (selectedRegion === 'Southern Africa' && ['BW', 'ZA', 'NA', 'ZW', 'ZM', 'MW', 'MZ'].includes(c.code)));

  const regions = [
    { key: 'all', name: 'All Countries' },
    { key: 'Southern Africa', name: 'Southern Africa' },
    { key: 'East Africa', name: 'East Africa' },
    { key: 'West Africa', name: 'West Africa' }
  ];

  return (
    <div className="modern-app">
      <div className="modern-header modern-fade-in">
        <h1 className="modern-title">
          🇧🇼 National Delivery Dashboard for NDP 12
        </h1>
        <p className="modern-subtitle">
          Real-time monitoring, transparency, and accountability for Botswana's National Development Plan
        </p>
        <p className="modern-subtitle" style={{fontSize: '0.9rem', marginTop: '5px'}}>
          <strong>By Pako Chalebgwa</strong> — Independent GovTech Consultant
        </p>
      </div>
      
      <div className="modern-nav modern-fade-in">
        <h2>NDP 12 Monitoring Dashboard</h2>
        <div className="modern-btn-group">
          <button 
            onClick={() => { setShowNDP12(true); setShowNetwork(false); }}
            className={`modern-btn ${showNDP12 ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
          >
            🇧🇼 NDP 12 Dashboard
          </button>
          <button 
            onClick={() => { setShowNDP12(false); setShowNetwork(false); }}
            className={`modern-btn ${!showNDP12 && !showNetwork ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
          >
            📊 Sector Analysis
          </button>
          <button 
            onClick={() => { setShowNDP12(false); setShowNetwork(true); }}
            className={`modern-btn ${showNetwork ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
          >
            🌐 Stakeholder Network
          </button>
        </div>
      </div>

      <div className="modern-nav modern-fade-in">
        <h2>Filter by Ministry/Sector</h2>
        <div className="region-selector">
          {regions.map(region => (
            <button
              key={region.key}
              onClick={() => setSelectedRegion(region.key)}
              className={`region-btn ${selectedRegion === region.key ? 'active' : ''}`}
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>

      {showNDP12 ? (
        <div className="modern-section modern-fade-in">
          <NDP12Dashboard apiBaseUrl={API_BASE_URL} />
        </div>
      ) : showNetwork ? (
        <div className="modern-section modern-fade-in">
          <CountryNetworkChart 
            countries={countries}
            relationships={relationships}
            meetings={meetings}
            onNodeClick={(country) => {
              setSelected(country);
              setShowNetwork(false);
              setShowNDP12(false);
              loadCountry(country.code);
            }}
          />
        </div>
      ) : (
        <div className="modern-nav modern-fade-in">
          <h2>Select Ministry/Project Area</h2>
          <div className="modern-country-grid">
            {filteredCountries.map((c, index) => (
              <button 
                key={c.code}
                onClick={() => loadCountry(c.code)}
                className={`modern-btn modern-stagger modern-fade-in ${selected?.code === c.code ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
              >
                <span>{c.name}</span>
                {c.region && <small style={{display: 'block', fontSize: '0.8em', opacity: 0.7}}>{c.region}</small>}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div data-testid="country-details">
          <div className="modern-section modern-fade-in">
            <h2 className="modern-section-title">
              {selected.name} - NDP 12 Performance Dashboard 📊
            </h2>
            
            {/* Enhanced Key Metrics */}
            <div className="modern-metrics-grid">
              <div className="modern-metric-card accent modern-stagger modern-fade-in">
                <CircularProgress 
                  value={selected.cpi} 
                  maxValue={100}
                  title="Corruption Perception"
                  color="#0ea5e9"
                />
                <small style={{marginTop: '10px', display: 'block'}}>
                  Rank: {selected.cpi}/100 (Transparency International)
                </small>
              </div>
              
              <div className="modern-metric-card primary modern-stagger modern-fade-in">
                <h3 className="modern-metric-title">💰 Total Budget</h3>
                <p className="modern-metric-value">
                  {formatCurrency(selected.budget, selected.currency)}
                </p>
                <small className="modern-metric-subtitle">Current Year ({selected.currency})</small>
              </div>
              
              {selected.mining_revenue && (
                <div className="modern-metric-card mining-revenue modern-stagger modern-fade-in">
                  <h3 className="modern-metric-title">💎 Mining Revenue</h3>
                  <p className="modern-metric-value">
                    {formatCurrency(selected.mining_revenue, selected.currency)}
                  </p>
                  <small className="modern-metric-subtitle">
                    {selected.diamond_contribution && `${(selected.diamond_contribution * 100).toFixed(0)}% from diamonds`}
                  </small>
                </div>
              )}
              
              <div className="modern-metric-card warning modern-stagger modern-fade-in">
                <h3 className="modern-metric-title">🏥 Health Per Capita</h3>
                <p className="modern-metric-value">
                  {formatCurrency(selected.health_exp, selected.currency)}
                </p>
                <small className="modern-metric-subtitle">Annual Expenditure</small>
              </div>
              
              <div className="modern-metric-card success modern-stagger modern-fade-in">
                <h3 className="modern-metric-title">🎓 Education Per Capita</h3>
                <p className="modern-metric-value">
                  {formatCurrency(selected.education_exp, selected.currency)}
                </p>
                <small className="modern-metric-subtitle">Annual Expenditure</small>
              </div>
              
              {selected.transparency_score && (
                <div className="modern-metric-card modern-stagger modern-fade-in">
                  <h3 className="modern-metric-title">🏛️ Transparency Score</h3>
                  <div className="transparency-indicator">
                    <span className={`transparency-score ${getTransparencyLevel(selected.transparency_score)}`}>
                      {selected.transparency_score}
                    </span>
                    <span>/10</span>
                  </div>
                  <small className="modern-metric-subtitle">Overall Government Transparency</small>
                </div>
              )}
            </div>

            {/* Charts Grid */}
            <div className="modern-charts-grid">
              {/* Corruption Cases Tracker */}
              {corruptionCases.length > 0 && (
                <div className="modern-chart-container modern-stagger modern-fade-in">
                  <CorruptionTracker 
                    cases={corruptionCases}
                    title={`🚨 Corruption Cases - ${selected.name}`}
                  />
                </div>
              )}

              {/* Government Contracts */}
              {contracts.length > 0 && (
                <div className="modern-chart-container modern-stagger modern-fade-in">
                  <ContractsTracker 
                    contracts={contracts}
                    title={`📋 Government Contracts - ${selected.name}`}
                  />
                </div>
              )}

              {/* Budget Breakdown Chart */}
              {breakdown && (
                <div className="modern-chart-container modern-stagger modern-fade-in">
                  <OrganicBubbleChart 
                    data={breakdown}
                    title="💰 Budget Allocation by Sector"
                    formatValue={formatLargeNumber}
                  />
                </div>
              )}

              {/* Budget History Chart */}
              {history.length > 0 && (
                <div className="modern-chart-container modern-stagger modern-fade-in">
                  <RadialTimeChart 
                    data={history}
                    title="📈 Budget Evolution Over Time"
                    color="#2563eb"
                    formatValue={formatLargeNumber}
                  />
                </div>
              )}

              {/* Health & Education Chart */}
              {healthHistory.length > 0 && educationHistory.length > 0 && (
                <div className="modern-chart-container modern-stagger modern-fade-in">
                  <FlowingMultiChart 
                    healthData={healthHistory}
                    educationData={educationHistory}
                    title="🏥📚 Health vs Education Spending Trends"
                    formatValue={(value) => formatCurrency(value, selected.currency)}
                  />
                </div>
              )}

              {/* CPI History Chart */}
              {cpiHistory.length > 0 && (
                <div className="modern-chart-container modern-stagger modern-fade-in">
                  <RadialTimeChart 
                    data={cpiHistory}
                    title="🔍 Corruption Perception Over Time"
                    color="#0ea5e9"
                    formatValue={(value) => `${value}/100`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="modern-footer modern-fade-in">
            <p className="modern-footer-quote">
              "🇧🇼 Building Botswana's most transparent government together — Every citizen deserves accountability"
            </p>
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                🚀 <strong>NDP 12 Vision:</strong> Sustainable economic diversification & inclusive growth
              </p>
              <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                📊 <strong>Real-time Monitoring:</strong> Track national development projects & KPIs
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                📱 <strong>Transparency:</strong> Open data for evidence-based decision making
              </p>
            </div>
            <small className="modern-footer-attribution">
              🌟 National Delivery Dashboard — Pako Chalebgwa, Independent GovTech Consultant
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
