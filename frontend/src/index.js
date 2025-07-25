import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RadialTimeChart from './components/RadialTimeChart';
import OrganicBubbleChart from './components/OrganicBubbleChart';
import CircularProgress from './components/CircularProgress';
import FlowingMultiChart from './components/FlowingMultiChart';
import FloatingParticles from './components/FloatingParticles';
import CountryNetworkChart from './components/CountryNetworkChart';
import './styles/animations.css';

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
    <>
      <FloatingParticles count={25} />
      <div style={{ 
        padding: '20px', 
        fontFamily: 'Georgia, serif',
        background: 'linear-gradient(135deg, #f8f6f3 0%, #f0e8e0 50%, #e8f0f8 100%)',
        backgroundSize: '300% 300%',
        animation: 'smoothGradientShift 20s ease infinite',
        minHeight: '100vh',
        position: 'relative'
      }}>
      <div className="animated-container" style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        background: 'linear-gradient(135deg, #E8D5C4, #F4E4C1, #E8A598)',
        backgroundSize: '200% 200%',
        animation: 'smoothGradientShift 12s ease infinite',
        padding: '30px',
        borderRadius: '25px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.15), 0 0 40px rgba(142, 124, 195, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <h1 className="animated-title" style={{ 
          color: '#8E7CC3', 
          margin: '0 0 10px 0',
          fontSize: '2.5em',
          fontWeight: '300',
          letterSpacing: '2px',
          textShadow: '0 2px 10px rgba(142, 124, 195, 0.2)'
        }}>
          Global Transparency Dashboard
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.1em',
          fontStyle: 'italic',
          margin: 0
        }}>
          Organic visualization of government transparency metrics inspired by nature's patterns
        </p>
      </div>
      
      <div className="animated-container" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#8E7CC3', marginBottom: '20px' }}>Explore Data</h2>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => setShowNetwork(false)}
            className={`smooth-button ${!showNetwork ? 'active' : ''}`}
            style={{
              padding: '15px 25px',
              backgroundColor: !showNetwork ? '#8E7CC3' : 'rgba(255, 255, 255, 0.9)',
              color: !showNetwork ? 'white' : '#333',
              border: `3px solid ${!showNetwork ? '#8E7CC3' : 'rgba(232, 213, 196, 0.8)'}`,
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: !showNetwork
                ? '0 8px 20px rgba(142, 124, 195, 0.4), 0 0 30px rgba(142, 124, 195, 0.2)' 
                : '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            Country Details
          </button>
          <button 
            onClick={() => setShowNetwork(true)}
            className={`smooth-button ${showNetwork ? 'active' : ''}`}
            style={{
              padding: '15px 25px',
              backgroundColor: showNetwork ? '#8E7CC3' : 'rgba(255, 255, 255, 0.9)',
              color: showNetwork ? 'white' : '#333',
              border: `3px solid ${showNetwork ? '#8E7CC3' : 'rgba(232, 213, 196, 0.8)'}`,
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: showNetwork
                ? '0 8px 20px rgba(142, 124, 195, 0.4), 0 0 30px rgba(142, 124, 195, 0.2)' 
                : '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            Meeting Network
          </button>
        </div>
      </div>

      {showNetwork ? (
        <div className="animated-container" style={{ marginBottom: '40px' }}>
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
        <div className="animated-container" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ color: '#8E7CC3', marginBottom: '20px' }}>Select a Country</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
            {countries.map((c, index) => (
              <button 
                key={c.code}
                onClick={() => loadCountry(c.code)}
                className={`smooth-button stagger-fade-in`}
                style={{
                  padding: '15px 25px',
                  backgroundColor: selected?.code === c.code ? '#8E7CC3' : 'rgba(255, 255, 255, 0.9)',
                  color: selected?.code === c.code ? 'white' : '#333',
                  border: `3px solid ${selected?.code === c.code ? '#8E7CC3' : 'rgba(232, 213, 196, 0.8)'}`,
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  animationDelay: `${index * 0.1}s`,
                  boxShadow: selected?.code === c.code 
                    ? '0 8px 20px rgba(142, 124, 195, 0.4), 0 0 30px rgba(142, 124, 195, 0.2)' 
                    : '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div data-testid="country-details" style={{ marginTop: '40px' }}>
          <h2 style={{ 
            textAlign: 'center', 
            color: '#8E7CC3', 
            fontSize: '2em',
            marginBottom: '40px',
            fontWeight: '300'
          }}>
            {selected.name} - Transparency Insights
          </h2>
          
          {/* Organic Key Metrics with Circular Progress */}
          <div className="animated-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '50px',
            justifyItems: 'center'
          }}>
            <div className="stagger-fade-in">
              <CircularProgress 
                value={selected.cpi} 
                maxValue={100}
                title="Corruption Perception"
                color="#A8C8E8"
              />
            </div>
            <div className="metric-card stagger-fade-in" style={{
              '--card-color-1': '#E8A598',
              '--card-color-2': '#F0D0C0',
              borderRadius: '25px',
              padding: '30px',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '1.1em' }}>Total Budget</h3>
              <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '0', color: '#fff' }}>
                {formatCurrency(selected.budget)}
              </p>
              <small style={{ color: 'rgba(255,255,255,0.8)' }}>Current Year</small>
            </div>
            <div className="metric-card stagger-fade-in" style={{
              '--card-color-1': '#E8B4B8',
              '--card-color-2': '#F4E4C1',
              borderRadius: '25px',
              padding: '30px',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '1.1em' }}>Health Per Capita</h3>
              <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '0', color: '#fff' }}>
                {formatCurrency(selected.health_exp)}
              </p>
              <small style={{ color: 'rgba(255,255,255,0.8)' }}>Annual Expenditure</small>
            </div>
            <div className="metric-card stagger-fade-in" style={{
              '--card-color-1': '#A8C8A8',
              '--card-color-2': '#C0E0C0',
              borderRadius: '25px',
              padding: '30px',
              textAlign: 'center',
              minWidth: '200px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '1.1em' }}>Education Per Capita</h3>
              <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '0', color: '#fff' }}>
                {formatCurrency(selected.education_exp)}
              </p>
              <small style={{ color: 'rgba(255,255,255,0.8)' }}>Annual Expenditure</small>
            </div>
          </div>

          {/* Fragapane-style Charts */}
          <div className="animated-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '30px',
            marginBottom: '40px'
          }}>
            {/* Budget Breakdown as Organic Bubble Chart */}
            {breakdown && (
              <div className="chart-container stagger-fade-in">
                <OrganicBubbleChart 
                  data={breakdown}
                  title="Budget Allocation by Sector"
                  formatValue={formatLargeNumber}
                />
              </div>
            )}

            {/* Budget History as Radial Time Chart */}
            {history.length > 0 && (
              <div className="chart-container stagger-fade-in">
                <RadialTimeChart 
                  data={history}
                  title="Budget Evolution Over Time"
                  color="#8E7CC3"
                  formatValue={formatLargeNumber}
                />
              </div>
            )}

            {/* Health & Education Flowing Multi-Chart */}
            {healthHistory.length > 0 && educationHistory.length > 0 && (
              <div className="chart-container stagger-fade-in">
                <FlowingMultiChart 
                  healthData={healthHistory}
                  educationData={educationHistory}
                  title="Health vs Education Spending Trends"
                  formatValue={formatCurrency}
                />
              </div>
            )}

            {/* CPI History as Radial Chart */}
            {cpiHistory.length > 0 && (
              <div className="chart-container stagger-fade-in">
                <RadialTimeChart 
                  data={cpiHistory}
                  title="Corruption Perception Over Time"
                  color="#A8C8E8"
                  formatValue={(value) => `${value}/100`}
                />
              </div>
            )}
          </div>

          {/* Organic Footer Note */}
          <div className="animated-container glass-effect" style={{
            textAlign: 'center',
            padding: '30px',
            background: 'linear-gradient(135deg, rgba(244, 228, 193, 0.8), rgba(232, 213, 196, 0.8))',
            borderRadius: '25px',
            marginTop: '40px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 0 40px rgba(142, 124, 195, 0.05)'
          }}>
            <p style={{ 
              color: '#8E7CC3', 
              fontStyle: 'italic',
              margin: 0,
              fontSize: '1.1em'
            }}>
              "Data visualized through nature's lens reveals patterns hidden in traditional charts"
            </p>
            <small style={{ color: '#999', display: 'block', marginTop: '10px' }}>
              Visualization style inspired by Federica Fragapane's organic data storytelling
            </small>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
