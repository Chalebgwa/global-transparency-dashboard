import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import RadialTimeChart from './components/RadialTimeChart';
import OrganicBubbleChart from './components/OrganicBubbleChart';
import CircularProgress from './components/CircularProgress';
import FlowingMultiChart from './components/FlowingMultiChart';

function App() {
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [cpiHistory, setCpiHistory] = useState([]);
  const [healthHistory, setHealthHistory] = useState([]);
  const [educationHistory, setEducationHistory] = useState([]);

  const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080';

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/countries`)
      .then(res => res.json())
      .then(setCountries)
      .catch((error) => {
        console.error('Error fetching countries:', error);
        setCountries([]);
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
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Georgia, serif',
      backgroundColor: '#f8f6f3',
      minHeight: '100vh'
    }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        background: 'linear-gradient(135deg, #E8D5C4, #F4E4C1)',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          color: '#8E7CC3', 
          margin: '0 0 10px 0',
          fontSize: '2.5em',
          fontWeight: '300',
          letterSpacing: '2px'
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
      
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#8E7CC3', marginBottom: '20px' }}>Select a Country</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
          {countries.map(c => (
            <button 
              key={c.code}
              onClick={() => loadCountry(c.code)}
              style={{
                padding: '15px 25px',
                backgroundColor: selected?.code === c.code ? '#8E7CC3' : '#fff',
                color: selected?.code === c.code ? 'white' : '#333',
                border: `3px solid ${selected?.code === c.code ? '#8E7CC3' : '#E8D5C4'}`,
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                boxShadow: selected?.code === c.code ? '0 6px 16px rgba(142, 124, 195, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                transform: selected?.code === c.code ? 'translateY(-2px)' : 'none'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

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
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '50px',
            justifyItems: 'center'
          }}>
            <CircularProgress 
              value={selected.cpi} 
              maxValue={100}
              title="Corruption Perception"
              color="#A8C8E8"
            />
            <div style={{
              background: 'linear-gradient(135deg, #E8A598, #F0D0C0)',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center',
              boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
              minWidth: '200px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '1.1em' }}>Total Budget</h3>
              <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '0', color: '#fff' }}>
                {formatCurrency(selected.budget)}
              </p>
              <small style={{ color: 'rgba(255,255,255,0.8)' }}>Current Year</small>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #E8B4B8, #F4E4C1)',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center',
              boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
              minWidth: '200px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '1.1em' }}>Health Per Capita</h3>
              <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '0', color: '#fff' }}>
                {formatCurrency(selected.health_exp)}
              </p>
              <small style={{ color: 'rgba(255,255,255,0.8)' }}>Annual Expenditure</small>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #A8C8A8, #C0E0C0)',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center',
              boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
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
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '30px',
            marginBottom: '40px'
          }}>
            {/* Budget Breakdown as Organic Bubble Chart */}
            {breakdown && (
              <OrganicBubbleChart 
                data={breakdown}
                title="Budget Allocation by Sector"
                formatValue={formatLargeNumber}
              />
            )}

            {/* Budget History as Radial Time Chart */}
            {history.length > 0 && (
              <RadialTimeChart 
                data={history}
                title="Budget Evolution Over Time"
                color="#8E7CC3"
                formatValue={formatLargeNumber}
              />
            )}

            {/* Health & Education Flowing Multi-Chart */}
            {healthHistory.length > 0 && educationHistory.length > 0 && (
              <FlowingMultiChart 
                healthData={healthHistory}
                educationData={educationHistory}
                title="Health vs Education Spending Trends"
                formatValue={formatCurrency}
              />
            )}

            {/* CPI History as Radial Chart */}
            {cpiHistory.length > 0 && (
              <RadialTimeChart 
                data={cpiHistory}
                title="Corruption Perception Over Time"
                color="#A8C8E8"
                formatValue={(value) => `${value}/100`}
              />
            )}
          </div>

          {/* Organic Footer Note */}
          <div style={{
            textAlign: 'center',
            padding: '30px',
            background: 'linear-gradient(135deg, #F4E4C1, #E8D5C4)',
            borderRadius: '20px',
            marginTop: '40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
