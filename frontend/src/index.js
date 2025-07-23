import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('/api/v1/countries')
      .then(res => res.json())
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  const loadCountry = code => {
    fetch(`/api/v1/countries/${code}`)
      .then(res => res.json())
      .then(data => {
        setSelected(data);
        return fetch(`/api/v1/countries/${code}/budget/history`);
      })
      .then(res => res.json())
      .then(setHistory)
      .catch(() => {
        setSelected(null);
        setHistory([]);
      });
  };

  return (
    <div>
      <h1>Global Transparency Dashboard</h1>
      <ul>
        {countries.map(c => (
          <li key={c.code}>
            <button onClick={() => loadCountry(c.code)}>
              {c.name} ({c.code})
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <div data-testid="country-details">
          <h2>{selected.name}</h2>
          <p>Budget: {selected.budget}</p>
          <p>CPI: {selected.cpi}</p>
          <p>Health Expenditure: {selected.health_exp}</p>
          <p>Education Expenditure: {selected.education_exp}</p>
          <h3>Budget History</h3>
          <ul>
            {history.map(row => (
              <li key={row.year}>{row.year}: {row.value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
