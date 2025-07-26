import React from 'react';
import * as d3 from 'd3';

const CorruptionTracker = ({ cases, title = "Corruption Cases Tracker" }) => {
  const containerRef = React.useRef();
  
  React.useEffect(() => {
    if (!cases || cases.length === 0) return;
    
    const container = d3.select(containerRef.current);
    container.selectAll("*").remove();
    
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 60, left: 80 };
    
    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Group cases by severity
    const severityColors = {
      low: '#22c55e',
      medium: '#eab308', 
      high: '#f97316',
      critical: '#ef4444'
    };
    
    const severityCount = d3.rollup(cases, v => v.length, d => d.severity);
    const data = Array.from(severityCount, ([severity, count]) => ({ severity, count }));
    
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.severity))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([height - margin.bottom, margin.top]);
    
    // Bars
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.severity))
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.count))
      .attr('fill', d => severityColors[d.severity])
      .attr('rx', 4)
      .style('opacity', 0.8);
    
    // Labels
    svg.selectAll('.count-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'count-label')
      .attr('x', d => xScale(d.severity) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-family', 'system-ui, sans-serif')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text(d => d.count);
    
    // X-axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .style('font-family', 'system-ui, sans-serif')
      .style('font-size', '12px');
    
    // Y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .style('font-family', 'system-ui, sans-serif')
      .style('font-size', '12px');
    
    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-family', 'system-ui, sans-serif')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#111827')
      .text(title);
    
  }, [cases, title]);
  
  if (!cases || cases.length === 0) {
    return (
      <div className="modern-chart-container">
        <div className="modern-chart-empty">
          <h3>{title}</h3>
          <p>No corruption cases data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="modern-chart-container">
      <div ref={containerRef}></div>
      <div className="corruption-cases-list">
        <h4>Recent Cases</h4>
        {cases.slice(0, 3).map(caseItem => (
          <div key={caseItem.id} className={`case-item severity-${caseItem.severity}`}>
            <div className="case-header">
              <span className="case-title">{caseItem.title}</span>
              <span className={`case-status status-${caseItem.status}`}>{caseItem.status}</span>
            </div>
            <div className="case-details">
              <p>{caseItem.description}</p>
              <div className="case-meta">
                <span>Amount: {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: caseItem.currency,
                  minimumFractionDigits: 0
                }).format(caseItem.amount_involved)}</span>
                <span>Reported: {new Date(caseItem.date_reported).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CorruptionTracker;