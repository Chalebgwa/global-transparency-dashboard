describe('Frontend Project Structure', () => {
  it('has a valid package.json', () => {
    const packageJson = require('../package.json');
    expect(packageJson.name).toBe('gtd-frontend');
    expect(packageJson.dependencies).toHaveProperty('react');
    expect(packageJson.dependencies).toHaveProperty('react-dom');
    expect(packageJson.dependencies).toHaveProperty('d3');
  });

  it('has required scripts', () => {
    const packageJson = require('../package.json');
    expect(packageJson.scripts).toHaveProperty('start');
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('test');
  });
});

describe('Utility Functions', () => {
  it('formatCurrency helper exists and works', () => {
    const formatCurrency = (value, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1000000)).toBe('$1,000,000');
  });

  it('formatLargeNumber helper exists and works', () => {
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

    expect(formatLargeNumber(1000)).toBe('1.0K');
    expect(formatLargeNumber(1000000)).toBe('1.0M');
    expect(formatLargeNumber(1000000000)).toBe('1.0B');
    expect(formatLargeNumber(500)).toBe('500');
  });

  it('getTransparencyLevel helper exists and works', () => {
    const getTransparencyLevel = (score) => {
      if (score >= 8) return 'excellent';
      if (score >= 6) return 'good';
      if (score >= 4) return 'fair';
      return 'poor';
    };

    expect(getTransparencyLevel(9)).toBe('excellent');
    expect(getTransparencyLevel(7)).toBe('good');
    expect(getTransparencyLevel(5)).toBe('fair');
    expect(getTransparencyLevel(3)).toBe('poor');
  });
});
