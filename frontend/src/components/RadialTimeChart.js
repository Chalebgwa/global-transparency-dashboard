import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RadialTimeChart = ({ data, title, color = '#8E7CC3', formatValue }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    svg.attr('width', width).attr('height', height);

    // Create organic color palette inspired by Fragapane
    const colors = [
      '#E8D5C4', '#F4E4C1', '#E8B4B8', '#A8C8A8', '#C8A8D8',
      '#B8D4E8', '#D8C8A8', '#F0D0C0', '#C0E0C0', '#D0C0F0'
    ];

    // Create spiral layout
    const angleScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, Math.PI * 4]); // Two full rotations for organic spiral

    const radiusScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([30, radius]);

    // Value scale for circle sizes
    const valueScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.value))
      .range([4, 16]);

    // Create smooth curved path connecting all points
    const line = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveCatmullRom.alpha(0.5)); // Organic smooth curves

    const points = data.map((d, i) => {
      const angle = angleScale(i);
      const r = radiusScale(i);
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        value: d.value,
        year: d.year,
        radius: valueScale(d.value),
        color: colors[i % colors.length]
      };
    });

    // Draw connecting spiral path with animation
    const spiralPath = svg.append('path')
      .datum(points)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('opacity', 0.6)
      .attr('stroke-dasharray', '5,5')
      .attr('stroke-linecap', 'round');

    // Animate the spiral path drawing
    const spiralLength = spiralPath.node().getTotalLength();
    spiralPath
      .attr('stroke-dasharray', spiralLength + ' ' + spiralLength)
      .attr('stroke-dashoffset', spiralLength)
      .transition()
      .duration(2000)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0);

    // Draw data points as organic circles
    const circles = svg.selectAll('.data-point')
      .data(points)
      .enter()
      .append('g')
      .attr('class', 'data-point')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Add organic drop shadows
    circles.append('circle')
      .attr('r', d => d.radius + 2)
      .attr('fill', 'rgba(0,0,0,0.1)')
      .attr('cx', 2)
      .attr('cy', 2);

    // Main circles with organic feel and enhanced animations
    circles.append('circle')
      .attr('r', 0)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .transition()
      .duration(1200)
      .delay((d, i) => i * 150)
      .ease(d3.easeBackOut.overshoot(1.3))
      .attr('r', d => d.radius)
      .on('end', function(d, i) {
        // Add breathing animation to each circle
        d3.select(this)
          .transition()
          .duration(2000 + Math.random() * 1000)
          .ease(d3.easeCubicInOut)
          .attr('r', d => d.radius * 1.2)
          .transition()
          .duration(2000 + Math.random() * 1000)
          .ease(d3.easeCubicInOut)
          .attr('r', d => d.radius)
          .on('end', function repeat() {
            d3.select(this)
              .transition()
              .duration(2000 + Math.random() * 1000)
              .ease(d3.easeCubicInOut)
              .attr('r', d => d.radius * 1.2)
              .transition()
              .duration(2000 + Math.random() * 1000)
              .ease(d3.easeCubicInOut)
              .attr('r', d => d.radius)
              .on('end', repeat);
          });
      });

    // Add year labels
    circles.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text(d => d.year)
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 200)
      .attr('opacity', 1);

    // Add value labels with organic positioning
    circles.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.radius + 15)
      .attr('font-size', '9px')
      .attr('fill', '#666')
      .text(d => formatValue ? formatValue(d.value) : d.value)
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 400)
      .attr('opacity', 0.8);

    // Add center decoration - organic flower-like shape with rotation
    const centerGroup = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    const petalData = d3.range(6).map(i => ({
      angle: (i * Math.PI * 2) / 6,
      radius: 15
    }));

    const petals = centerGroup.selectAll('.petal')
      .data(petalData)
      .enter()
      .append('ellipse')
      .attr('class', 'petal')
      .attr('cx', d => d.radius * Math.cos(d.angle))
      .attr('cy', d => d.radius * Math.sin(d.angle))
      .attr('rx', 8)
      .attr('ry', 4)
      .attr('fill', color)
      .attr('opacity', 0.3)
      .attr('transform', d => `rotate(${d.angle * 180 / Math.PI})`);

    // Add continuous rotation to petals
    petals.transition()
      .duration(20000)
      .ease(d3.easeLinear)
      .attrTween('transform', d => {
        return function(t) {
          const rotation = d.angle * 180 / Math.PI + (t * 360);
          return `rotate(${rotation})`;
        };
      })
      .on('end', function repeat() {
        d3.select(this)
          .transition()
          .duration(20000)
          .ease(d3.easeLinear)
          .attrTween('transform', d => {
            return function(t) {
              const rotation = d.angle * 180 / Math.PI + (t * 360);
              return `rotate(${rotation})`;
            };
          })
          .on('end', repeat);
      });

    centerGroup.append('circle')
      .attr('r', 8)
      .attr('fill', color)
      .attr('opacity', 0.8);

    // Add title
    svg.append('text')
      .attr('x', centerX)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', color)
      .text(title);

  }, [data, title, color, formatValue]);

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

export default RadialTimeChart;