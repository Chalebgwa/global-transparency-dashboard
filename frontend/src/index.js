import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RadialTimeChart from './components/RadialTimeChart';
import OrganicBubbleChart from './components/OrganicBubbleChart';
import CircularProgress from './components/CircularProgress';
import FlowingMultiChart from './components/FlowingMultiChart';
import FloatingParticles from './components/FloatingParticles';
import CountryNetworkChart from './components/CountryNetworkChart';
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
          fetch(`${API_BASE_URL}/api/v1/countries/${code}/education/history`).then(res => res.json())
        ]);
      })
      .then(([budgetHistory, budgetBreakdown, cpiData, healthData, educationData]) => {
        setHistory(budgetHistory);
        setBreakdown(budgetBreakdown);
        setCpiHistory(cpiData);
        setHealthHistory(healthData);
        setEducationHistory(educationData);
      })
      .catch((error) => {
        console.error('Error loading country data:', error);
        setSelected(null);
        setHistory([]);
        setBreakdown(null);
        setCpiHistory([]);
        setHealthHistory([]);
        setEducationHistory([]);
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
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <div className="modern-app">
      <div className="modern-header modern-fade-in">
        <h1 className="modern-title">
          Global Transparency Dashboard
        </h1>
        <p className="modern-subtitle">
          Professional insights into government transparency metrics across nations
        </p>
      </div>
      
      <div className="modern-nav modern-fade-in">
        <h2>Explore Data</h2>
        <div className="modern-btn-group">
          <button 
            onClick={() => setShowNetwork(false)}
            className={`modern-btn ${!showNetwork ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
          >
            Country Details
          </button>
          <button 
            onClick={() => setShowNetwork(true)}
            className={`modern-btn ${showNetwork ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
          >
            Meeting Network
          </button>
        </div>
      </div>

      {showNetwork ? (
        <div className="modern-section modern-fade-in">
          <CountryNetworkChart 
            countries={countries}
            relationships={relationships}
            meetings={meetings}
            onNodeClick={(country) => {
              setSelected(country);
              setShowNetwork(false);
              loadCountry(country.code);
            }}
          />
        </div>
      ) : (
        <div className="modern-nav modern-fade-in">
          <h2>Select a Country</h2>
          <div className="modern-country-grid">
            {countries.map((c, index) => (
              <button 
                key={c.code}
                onClick={() => loadCountry(c.code)}
                className={`modern-btn modern-stagger modern-fade-in ${selected?.code === c.code ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div data-testid="country-details">
          <div className="modern-section modern-fade-in">
            <h2 className="modern-section-title">
              {selected.name} - Transparency Insights
            </h2>
            
            {/* Key Metrics */}
            <div className="modern-metrics-grid">
              <div className="modern-metric-card accent modern-stagger modern-fade-in">
                <CircularProgress 
                  value={selected.cpi} 
                  maxValue={100}
                  title="Corruption Perception"
                  color="#0ea5e9"
                />
              </div>
              <div className="modern-metric-card primary modern-stagger modern-fade-in">
                <h3 className="modern-metric-title">Total Budget</h3>
                <p className="modern-metric-value">
                  {formatCurrency(selected.budget)}
                </p>
                <small className="modern-metric-subtitle">Current Year</small>
              </div>
              <div className="modern-metric-card warning modern-stagger modern-fade-in">
                <h3 className="modern-metric-title">Health Per Capita</h3>
                <p className="modern-metric-value">
                  {formatCurrency(selected.health_exp)}
                </p>
                <small className="modern-metric-subtitle">Annual Expenditure</small>
              </div>
              <div className="modern-metric-card success modern-stagger modern-fade-in">
                <h3 className="modern-metric-title">Education Per Capita</h3>
                <p className="modern-metric-value">
                  {formatCurrency(selected.education_exp)}
                </p>
                <small className="modern-metric-subtitle">Annual Expenditure</small>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="modern-charts-grid">
              {/* Budget Breakdown Chart */}
              {breakdown && (
                <div className="modern-chart-container modern-stagger modern-fade-in">
                  <OrganicBubbleChart 
                    data={breakdown}
                    title="Budget Allocation by Sector"
                    formatValue={formatLargeNumber}
                  />
                </div>
              )}

              {/* Budget History Chart */}
              {history.length > 0 && (
                <div className="modern-chart-container modern-stagger modern-fade-in">
                  <RadialTimeChart 
                    data={history}
                    title="Budget Evolution Over Time"
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
                    title="Health vs Education Spending Trends"
                    formatValue={formatCurrency}
                  />
                </div>
              )}

              {/* CPI History Chart */}
              {cpiHistory.length > 0 && (
                <div className="modern-chart-container modern-stagger modern-fade-in">
                  <RadialTimeChart 
                    data={cpiHistory}
                    title="Corruption Perception Over Time"
                    color="#0ea5e9"
                    formatValue={(value) => `${value}/100`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Professional Footer */}
          <div className="modern-footer modern-fade-in">
            <p className="modern-footer-quote">
              "Professional transparency analysis powered by comprehensive data visualization"
            </p>
            <small className="modern-footer-attribution">
              Global Transparency Dashboard - Empowering informed decisions through data
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
