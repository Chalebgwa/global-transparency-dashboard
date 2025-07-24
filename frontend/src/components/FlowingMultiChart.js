import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const FlowingMultiChart = ({ healthData, educationData, title, formatValue }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!healthData || !educationData || healthData.length === 0 || educationData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 60, bottom: 40, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Organic color palette
    const healthColor = '#E8A598';
    const educationColor = '#A8C8E8';

    // Scales
    const allYears = [...new Set([...healthData.map(d => d.year), ...educationData.map(d => d.year)])].sort();
    const allValues = [...healthData.map(d => d.value), ...educationData.map(d => d.value)];

    const xScale = d3.scaleLinear()
      .domain(d3.extent(allYears))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(allValues))
      .range([height, 0]);

    // Create organic flowing line generator
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5)); // Organic flowing curves

    // Add organic background pattern
    const defs = svg.append('defs');
    
    // Organic gradient for health line
    const healthGradient = defs.append('linearGradient')
      .attr('id', 'healthGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0);

    healthGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3.rgb(healthColor).copy({ opacity: 0.1 }));

    healthGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.rgb(healthColor).copy({ opacity: 0.4 }));

    // Organic gradient for education line
    const educationGradient = defs.append('linearGradient')
      .attr('id', 'educationGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0);

    educationGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3.rgb(educationColor).copy({ opacity: 0.1 }));

    educationGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.rgb(educationColor).copy({ opacity: 0.4 }));

    // Create area generators for organic fills
    const area = d3.area()
      .x(d => xScale(d.year))
      .y0(height)
      .y1(d => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Draw organic flowing areas with enhanced animation
    g.append('path')
      .datum(healthData)
      .attr('class', 'health-area')
      .attr('d', area)
      .attr('fill', 'url(#healthGradient)')
      .attr('opacity', 0)
      .transition()
      .duration(2000)
      .ease(d3.easeQuadOut)
      .attr('opacity', 1);

    g.append('path')
      .datum(educationData)
      .attr('class', 'education-area')
      .attr('d', area)
      .attr('fill', 'url(#educationGradient)')
      .attr('opacity', 0)
      .transition()
      .duration(2000)
      .delay(500)
      .ease(d3.easeQuadOut)
      .attr('opacity', 1);

    // Draw flowing lines
    const healthPath = g.append('path')
      .datum(healthData)
      .attr('class', 'health-line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', healthColor)
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.9);

    const educationPath = g.append('path')
      .datum(educationData)
      .attr('class', 'education-line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', educationColor)
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.9);

    // Animate line drawing
    const healthPathLength = healthPath.node().getTotalLength();
    const educationPathLength = educationPath.node().getTotalLength();

    healthPath
      .attr('stroke-dasharray', `${healthPathLength},${healthPathLength}`)
      .attr('stroke-dashoffset', healthPathLength)
      .transition()
      .duration(2500)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0);

    educationPath
      .attr('stroke-dasharray', `${educationPathLength},${educationPathLength}`)
      .attr('stroke-dashoffset', educationPathLength)
      .transition()
      .duration(2500)
      .delay(700)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0);

    // Add organic data points
    const healthPoints = g.selectAll('.health-point')
      .data(healthData)
      .enter()
      .append('g')
      .attr('class', 'health-point')
      .attr('transform', d => `translate(${xScale(d.year)}, ${yScale(d.value)})`);

    healthPoints.append('circle')
      .attr('r', 0)
      .attr('fill', healthColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 250 + 1200)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('r', 6)
      .on('end', function(d, i) {
        // Add gentle floating animation
        d3.select(this)
          .transition()
          .duration(2000 + Math.random() * 1000)
          .ease(d3.easeCubicInOut)
          .attr('r', 8)
          .transition()
          .duration(2000 + Math.random() * 1000)
          .ease(d3.easeCubicInOut)
          .attr('r', 6)
          .on('end', function repeat() {
            d3.select(this)
              .transition()
              .duration(2000 + Math.random() * 1000)
              .ease(d3.easeCubicInOut)
              .attr('r', 8)
              .transition()
              .duration(2000 + Math.random() * 1000)
              .ease(d3.easeCubicInOut)
              .attr('r', 6)
              .on('end', repeat);
          });
      });

    // Add floating organic elements around health points
    healthPoints.append('circle')
      .attr('r', 0)
      .attr('fill', healthColor)
      .attr('opacity', 0.3)
      .attr('cx', () => Math.random() * 20 - 10)
      .attr('cy', () => Math.random() * 20 - 10)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200 + 1200)
      .attr('r', 3);

    const educationPoints = g.selectAll('.education-point')
      .data(educationData)
      .enter()
      .append('g')
      .attr('class', 'education-point')
      .attr('transform', d => `translate(${xScale(d.year)}, ${yScale(d.value)})`);

    educationPoints.append('circle')
      .attr('r', 0)
      .attr('fill', educationColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 250 + 1800)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attr('r', 6)
      .on('end', function(d, i) {
        // Add gentle floating animation
        d3.select(this)
          .transition()
          .duration(2000 + Math.random() * 1000)
          .ease(d3.easeCubicInOut)
          .attr('r', 8)
          .transition()
          .duration(2000 + Math.random() * 1000)
          .ease(d3.easeCubicInOut)
          .attr('r', 6)
          .on('end', function repeat() {
            d3.select(this)
              .transition()
              .duration(2000 + Math.random() * 1000)
              .ease(d3.easeCubicInOut)
              .attr('r', 8)
              .transition()
              .duration(2000 + Math.random() * 1000)
              .ease(d3.easeCubicInOut)
              .attr('r', 6)
              .on('end', repeat);
          });
      });

    // Add floating organic elements around education points
    educationPoints.append('circle')
      .attr('r', 0)
      .attr('fill', educationColor)
      .attr('opacity', 0.3)
      .attr('cx', () => Math.random() * 20 - 10)
      .attr('cy', () => Math.random() * 20 - 10)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200 + 1700)
      .attr('r', 3);

    // Organic axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d'))
      .tickSize(-height)
      .tickPadding(10);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => formatValue ? formatValue(d) : d)
      .tickSize(-width)
      .tickPadding(10);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('line')
      .attr('stroke', '#f0f0f0')
      .attr('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('line')
      .attr('stroke', '#f0f0f0')
      .attr('stroke-dasharray', '2,2');

    // Style axis text
    g.selectAll('.x-axis text, .y-axis text')
      .attr('fill', '#666')
      .attr('font-size', '11px');

    // Remove axis paths
    g.selectAll('.x-axis path, .y-axis path').remove();

    // Add organic legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 120}, 20)`);

    // Health legend
    const healthLegend = legend.append('g')
      .attr('class', 'health-legend');

    healthLegend.append('circle')
      .attr('r', 6)
      .attr('fill', healthColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    healthLegend.append('text')
      .attr('x', 15)
      .attr('y', 5)
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text('Health');

    // Education legend
    const educationLegend = legend.append('g')
      .attr('class', 'education-legend')
      .attr('transform', 'translate(0, 25)');

    educationLegend.append('circle')
      .attr('r', 6)
      .attr('fill', educationColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    educationLegend.append('text')
      .attr('x', 15)
      .attr('y', 5)
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text('Education');

    // Add title
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(title);

  }, [healthData, educationData, title, formatValue]);

  return (
    <div className="chart-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '20px',
      background: 'rgba(250, 250, 250, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      margin: '10px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 0 40px rgba(142, 124, 195, 0.05)'
    }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default FlowingMultiChart;