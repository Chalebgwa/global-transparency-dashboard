import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Global Transparency Dashboard</h1>
      <p>API MVP - Comprehensive transparency metrics for government budgets, corruption perception, and expenditures</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Countries</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {countries.map(c => (
            <button 
              key={c.code}
              onClick={() => loadCountry(c.code)}
              style={{
                padding: '10px 15px',
                backgroundColor: selected?.code === c.code ? '#007bff' : '#f8f9fa',
                color: selected?.code === c.code ? 'white' : 'black',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {c.name} ({c.code})
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div data-testid="country-details" style={{ marginTop: '30px' }}>
          <h2>{selected.name} - Key Metrics</h2>
          
          {/* Current Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Total Budget</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                {formatCurrency(selected.budget)}
              </p>
              <small style={{ color: '#666' }}>Current Year</small>
            </div>
            
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Corruption Perception Index</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                {selected.cpi}/100
              </p>
              <small style={{ color: '#666' }}>Higher = Less Corrupt</small>
            </div>
            
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>Health Expenditure</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                {formatCurrency(selected.health_exp)}
              </p>
              <small style={{ color: '#666' }}>Per Capita</small>
            </div>
            
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>Education Expenditure</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                {formatCurrency(selected.education_exp)}
              </p>
              <small style={{ color: '#666' }}>Per Capita</small>
            </div>
          </div>

          {/* Budget Breakdown */}
          {breakdown && (
            <div style={{ marginBottom: '30px' }}>
              <h3>Budget Breakdown by Sector ({breakdown.year})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {Object.entries(breakdown.sectors).map(([sector, amount]) => (
                  <div key={sector} style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px' }}>
                    <strong style={{ textTransform: 'capitalize' }}>
                      {sector.replace('_', ' ')}
                    </strong>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                      {formatLargeNumber(amount)}
                    </div>
                    <small style={{ color: '#666' }}>
                      {((amount / breakdown.total) * 100).toFixed(1)}% of total
                    </small>
                  </div>
                ))}
              </div>
              <small style={{ color: '#666', marginTop: '10px', display: 'block' }}>
                Source: {breakdown.source}
              </small>
            </div>
          )}

          {/* Historical Data */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Budget History */}
            <div>
              <h3>Budget History</h3>
              <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px' }}>
                {history.map(row => (
                  <div key={row.year} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                    <span>{row.year}</span>
                    <span style={{ fontWeight: 'bold' }}>{formatLargeNumber(row.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CPI History */}
            {cpiHistory.length > 0 && (
              <div>
                <h3>CPI History</h3>
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px' }}>
                  {cpiHistory.map(row => (
                    <div key={row.year} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                      <span>{row.year}</span>
                      <span style={{ fontWeight: 'bold' }}>{row.value}/100</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health History */}
            {healthHistory.length > 0 && (
              <div>
                <h3>Health Expenditure History</h3>
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px' }}>
                  {healthHistory.map(row => (
                    <div key={row.year} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                      <span>{row.year}</span>
                      <span style={{ fontWeight: 'bold' }}>{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education History */}
            {educationHistory.length > 0 && (
              <div>
                <h3>Education Expenditure History</h3>
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px' }}>
                  {educationHistory.map(row => (
                    <div key={row.year} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                      <span>{row.year}</span>
                      <span style={{ fontWeight: 'bold' }}>{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
