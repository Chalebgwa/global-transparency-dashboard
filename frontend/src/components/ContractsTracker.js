import React from 'react';
import * as d3 from 'd3';

const ContractsTracker = ({ contracts, title = "Government Contracts" }) => {
  const containerRef = React.useRef();
  
  React.useEffect(() => {
    if (!contracts || contracts.length === 0) return;
    
    const container = d3.select(containerRef.current);
    container.selectAll("*").remove();
    
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 60, left: 100 };
    
    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Take top 5 contracts by amount
    const topContracts = contracts
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(topContracts, d => d.amount)])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleBand()
      .domain(topContracts.map(d => d.title.substring(0, 25) + '...'))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);
    
    // Bars
    svg.selectAll('rect')
      .data(topContracts)
      .enter()
      .append('rect')
      .attr('x', margin.left)
      .attr('y', d => yScale(d.title.substring(0, 25) + '...'))
      .attr('width', d => xScale(d.amount) - margin.left)
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.status === 'ongoing' ? '#3b82f6' : d.status === 'completed' ? '#22c55e' : '#6b7280')
      .attr('rx', 4)
      .style('opacity', 0.8);
    
    // Amount labels
    svg.selectAll('.amount-label')
      .data(topContracts)
      .enter()
      .append('text')
      .attr('class', 'amount-label')
      .attr('x', d => xScale(d.amount) + 5)
      .attr('y', d => yScale(d.title.substring(0, 25) + '...') + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .style('font-family', 'system-ui, sans-serif')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text(d => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: d.currency,
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(d.amount));
    
    // Y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .style('font-family', 'system-ui, sans-serif')
      .style('font-size', '10px');
    
    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-family', 'system-ui, sans-serif')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#111827')
      .text(title);
    
  }, [contracts, title]);
  
  if (!contracts || contracts.length === 0) {
    return (
      <div className="modern-chart-container">
        <div className="modern-chart-empty">
          <h3>{title}</h3>
          <p>No contracts data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="modern-chart-container">
      <div ref={containerRef}></div>
      <div className="contracts-summary">
        <h4>Contract Overview</h4>
        <div className="contract-stats">
          <div className="stat">
            <span className="stat-value">{contracts.length}</span>
            <span className="stat-label">Total Contracts</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: contracts[0]?.currency || 'USD',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(contracts.reduce((sum, c) => sum + c.amount, 0))}
            </span>
            <span className="stat-label">Total Value</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {Math.round(
                contracts.reduce((sum, c) => sum + (c.transparency_score || 0), 0) / contracts.length * 10
              ) / 10}
            </span>
            <span className="stat-label">Avg. Transparency</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsTracker;