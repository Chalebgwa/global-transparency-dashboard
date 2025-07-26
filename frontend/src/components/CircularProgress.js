import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CircularProgress = ({ value, maxValue = 100, title, color = '#8E7CC3' }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (value === undefined || value === null) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 200;
    const height = 200;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 70;

    svg.attr('width', width).attr('height', height);

    // Organic color gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'organicGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', 1);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d3.rgb(color).brighter(0.5));

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.rgb(color).darker(0.5));

    // Background organic ring with texture
    const backgroundArc = d3.arc()
      .innerRadius(radius - 15)
      .outerRadius(radius + 5)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    svg.append('path')
      .datum({ endAngle: 2 * Math.PI })
      .attr('d', backgroundArc)
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#ddd')
      .attr('stroke-width', 2);

    // Add organic texture to background
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const x = centerX + (radius - 5) * Math.cos(angle);
      const y = centerY + (radius - 5) * Math.sin(angle);
      
      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 2)
        .attr('fill', '#fff')
        .attr('opacity', 0.6);
    }

    // Progress arc
    const progressArc = d3.arc()
      .innerRadius(radius - 15)
      .outerRadius(radius + 5)
      .startAngle(0)
      .cornerRadius(8); // Organic rounded ends

    const progressPath = svg.append('path')
      .datum({ endAngle: 0 })
      .attr('d', progressArc)
      .attr('transform', `translate(${centerX}, ${centerY})`)
      .attr('fill', 'url(#organicGradient)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3);

    // Animate progress with more fluid easing
    const targetAngle = (value / maxValue) * 2 * Math.PI;
    progressPath.transition()
      .duration(2500)
      .ease(d3.easeBackOut.overshoot(1.2))
      .attrTween('d', d => {
        const interpolate = d3.interpolate(d.endAngle, targetAngle);
        return t => {
          d.endAngle = interpolate(t);
          return progressArc(d);
        };
      });

    // Center decoration - organic flower pattern
    const centerGroup = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Organic petals
    const petalData = d3.range(8).map(i => ({
      angle: (i * Math.PI * 2) / 8,
      radius: 25
    }));

    centerGroup.selectAll('.center-petal')
      .data(petalData)
      .enter()
      .append('ellipse')
      .attr('class', 'center-petal')
      .attr('cx', d => (d.radius - 10) * Math.cos(d.angle))
      .attr('cy', d => (d.radius - 10) * Math.sin(d.angle))
      .attr('rx', 6)
      .attr('ry', 12)
      .attr('fill', color)
      .attr('opacity', 0.3)
      .attr('transform', d => `rotate(${d.angle * 180 / Math.PI})`);

    // Center circle with pulsing animation
    centerGroup.append('circle')
      .attr('r', 0)
      .attr('fill', color)
      .attr('opacity', 0.8)
      .transition()
      .duration(1500)
      .delay(500)
      .ease(d3.easeBackOut)
      .attr('r', 15)
      .on('end', function() {
        // Add continuous pulsing effect
        d3.select(this)
          .transition()
          .duration(2000)
          .ease(d3.easeCubicInOut)
          .attr('r', 18)
          .transition()
          .duration(2000)
          .ease(d3.easeCubicInOut)
          .attr('r', 15)
          .on('end', function repeat() {
            d3.select(this)
              .transition()
              .duration(2000)
              .ease(d3.easeCubicInOut)
              .attr('r', 18)
              .transition()
              .duration(2000)
              .ease(d3.easeCubicInOut)
              .attr('r', 15)
              .on('end', repeat);
          });
      });

    // Value text
    const valueText = centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('opacity', 0)
      .text(value);

    valueText.transition()
      .duration(1000)
      .delay(1000)
      .attr('opacity', 1);

    // Organic floating elements around the progress ring
    const floatingElements = d3.range(6).map(i => ({
      angle: (i * Math.PI * 2) / 6 + Math.random() * 0.5,
      radius: radius + 20 + Math.random() * 15,
      size: 3 + Math.random() * 4
    }));

    floatingElements.forEach((elem, i) => {
      const x = centerX + elem.radius * Math.cos(elem.angle);
      const y = centerY + elem.radius * Math.sin(elem.angle);
      
      const floatingElement = svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 0)
        .attr('fill', color)
        .attr('opacity', 0.4)
        .transition()
        .duration(1000)
        .delay(i * 200 + 1500)
        .ease(d3.easeBackOut)
        .attr('r', elem.size)
        .on('end', function() {
          // Add floating animation
          d3.select(this)
            .transition()
            .duration(3000 + Math.random() * 2000)
            .ease(d3.easeCubicInOut)
            .attr('cy', y - 10 - Math.random() * 10)
            .transition()
            .duration(3000 + Math.random() * 2000)
            .ease(d3.easeCubicInOut)
            .attr('cy', y + 10 + Math.random() * 10)
            .on('end', function repeat() {
              d3.select(this)
                .transition()
                .duration(3000 + Math.random() * 2000)
                .ease(d3.easeCubicInOut)
                .attr('cy', y - 10 - Math.random() * 10)
                .transition()
                .duration(3000 + Math.random() * 2000)
                .ease(d3.easeCubicInOut)
                .attr('cy', y + 10 + Math.random() * 10)
                .on('end', repeat);
            });
        });
    });

    // Title
    svg.append('text')
      .attr('x', centerX)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', color)
      .text(title);

    // Subtitle with max value
    svg.append('text')
      .attr('x', centerX)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#666')
      .text(`out of ${maxValue}`);

  }, [value, maxValue, title, color]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '1rem',
      background: 'var(--white)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--gray-200)',
      boxShadow: 'var(--shadow-md)'
    }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default CircularProgress;