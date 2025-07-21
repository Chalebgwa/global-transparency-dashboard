import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetch('/api/v1/countries')
      .then(res => res.json())
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  return (
    <div>
      <h1>Global Transparency Dashboard</h1>
      <ul>
        {countries.map(c => (
          <li key={c.code}>{c.name} ({c.code})</li>
        ))}
      </ul>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
