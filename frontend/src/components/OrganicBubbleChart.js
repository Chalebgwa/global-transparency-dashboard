import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const OrganicBubbleChart = ({ data, title, formatValue }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.sectors) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 350;
    const centerX = width / 2;
    const centerY = height / 2;

    svg.attr('width', width).attr('height', height);

    // Fragapane-inspired organic color palette
    const organicColors = [
      '#E8A598', '#D4B5A5', '#F2D7B3', '#C8E6C9', '#B3D9E3',
      '#E1BEE7', '#FFE0B2', '#FFCCBC', '#DCEDC1', '#F8BBD9'
    ];

    // Convert sectors data to array
    const sectors = Object.entries(data.sectors).map(([key, value], i) => ({
      id: key,
      name: key.replace('_', ' '),
      value: value,
      color: organicColors[i % organicColors.length]
    }));

    // Create size scale for bubbles
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(sectors, d => d.value)])
      .range([10, 60]);

    // Create force simulation for organic positioning
    const simulation = d3.forceSimulation(sectors)
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide().radius(d => sizeScale(d.value) + 5))
      .force('x', d3.forceX(centerX).strength(0.1))
      .force('y', d3.forceY(centerY).strength(0.1));

    // Create groups for each bubble
    const bubbles = svg.selectAll('.bubble')
      .data(sectors)
      .enter()
      .append('g')
      .attr('class', 'bubble');

    // Add organic drop shadows
    bubbles.append('circle')
      .attr('class', 'shadow')
      .attr('r', d => sizeScale(d.value) + 3)
      .attr('fill', 'rgba(0,0,0,0.1)')
      .attr('cx', 3)
      .attr('cy', 3);

    // Main bubble circles with organic texture
    const circles = bubbles.append('circle')
      .attr('class', 'main-circle')
      .attr('r', 0)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('opacity', 0.9);

    // Add organic texture overlay
    bubbles.append('circle')
      .attr('class', 'texture')
      .attr('r', d => sizeScale(d.value))
      .attr('fill', 'url(#organicPattern)')
      .attr('opacity', 0.2);

    // Add sector labels
    const labels = bubbles.append('text')
      .attr('class', 'sector-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('font-size', d => Math.min(12, sizeScale(d.value) / 3))
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(d => d.name)
      .attr('opacity', 0);

    // Add value labels
    const valueLabels = bubbles.append('text')
      .attr('class', 'value-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', d => Math.min(10, sizeScale(d.value) / 4))
      .attr('fill', '#666')
      .text(d => formatValue ? formatValue(d.value) : d.value)
      .attr('opacity', 0);

    // Add organic pattern definition
    const defs = svg.append('defs');
    const pattern = defs.append('pattern')
      .attr('id', 'organicPattern')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 20)
      .attr('height', 20);

    pattern.append('circle')
      .attr('cx', 5)
      .attr('cy', 5)
      .attr('r', 2)
      .attr('fill', '#fff')
      .attr('opacity', 0.3);

    pattern.append('circle')
      .attr('cx', 15)
      .attr('cy', 15)
      .attr('r', 1.5)
      .attr('fill', '#fff')
      .attr('opacity', 0.3);

    // Animate entrance
    circles.transition()
      .duration(1200)
      .delay((d, i) => i * 150)
      .attr('r', d => sizeScale(d.value));

    labels.transition()
      .duration(800)
      .delay((d, i) => i * 150 + 600)
      .attr('opacity', 1);

    valueLabels.transition()
      .duration(800)
      .delay((d, i) => i * 150 + 800)
      .attr('opacity', 0.8);

    // Update positions during simulation
    simulation.on('tick', () => {
      bubbles.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    // Add connecting lines to create organic web
    simulation.on('end', () => {
      const connections = [];
      sectors.forEach((d, i) => {
        sectors.forEach((e, j) => {
          if (i < j && Math.sqrt((d.x - e.x) ** 2 + (d.y - e.y) ** 2) < 120) {
            connections.push({ source: d, target: e });
          }
        });
      });

      svg.selectAll('.connection')
        .data(connections)
        .enter()
        .insert('path', '.bubble')
        .attr('class', 'connection')
        .attr('d', d => {
          const path = d3.path();
          const midX = (d.source.x + d.target.x) / 2 + Math.random() * 20 - 10;
          const midY = (d.source.y + d.target.y) / 2 + Math.random() * 20 - 10;
          path.moveTo(d.source.x, d.source.y);
          path.quadraticCurveTo(midX, midY, d.target.x, d.target.y);
          return path.toString();
        })
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .attr('opacity', 0.3);
    });

    // Add title
    svg.append('text')
      .attr('x', centerX)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(title);

    // Add year subtitle
    svg.append('text')
      .attr('x', centerX)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text(`Year: ${data.year}`);

  }, [data, title, formatValue]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#fafafa',
      borderRadius: '15px',
      margin: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default OrganicBubbleChart;