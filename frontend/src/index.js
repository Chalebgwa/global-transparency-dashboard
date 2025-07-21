import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/api/v1/countries')
      .then(res => res.json())
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  const loadCountry = code => {
    fetch(`/api/v1/countries/${code}`)
      .then(res => res.json())
      .then(setSelected)
      .catch(() => setSelected(null));
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
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
