import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const CountryNetworkChart = ({ countries, relationships, meetings, onNodeClick }) => {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [networkStats, setNetworkStats] = useState(null);

  useEffect(() => {
    if (!countries || !relationships || countries.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    svg.attr("width", width).attr("height", height);

    // Create container for zoom/pan
    const container = svg.append("g");

    // Create nodes from countries
    const nodes = countries.map(country => ({
      id: country.code,
      name: country.name,
      ...country,
      // Add meeting count for sizing
      meetingCount: meetings ? meetings.filter(m => m.countries.includes(country.code)).length : 0
    }));

    // Create links from relationships
    const links = [];
    Object.keys(relationships).forEach(relationshipKey => {
      const [source, target] = relationshipKey.split('-');
      const relationship = relationships[relationshipKey];
      
      if (relationship.meeting_count > 0) {
        links.push({
          source,
          target,
          strength: relationship.relationship_strength,
          meetingCount: relationship.meeting_count,
          lastMeeting: relationship.last_meeting,
          topics: relationship.common_topics,
          ...relationship
        });
      }
    });

    // Calculate network statistics
    const totalMeetings = meetings ? meetings.length : 0;
    const avgRelationshipStrength = links.length > 0 ? 
      links.reduce((sum, link) => sum + link.strength, 0) / links.length : 0;
    
    setNetworkStats({
      totalCountries: nodes.length,
      totalMeetings,
      activeRelationships: links.length,
      avgStrength: avgRelationshipStrength
    });

    // Color scale based on CPI scores
    const cpiExtent = d3.extent(nodes, d => d.cpi);
    const colorScale = d3.scaleLinear()
      .domain(cpiExtent)
      .range(['#E8A598', '#A8C8E8']); // Low CPI (more corrupt) to high CPI (less corrupt)

    // Size scale based on meeting count
    const meetingExtent = d3.extent(nodes, d => d.meetingCount);
    const sizeScale = d3.scaleLinear()
      .domain(meetingExtent.every(d => d === 0) ? [0, 1] : meetingExtent)
      .range([15, 40]);

    // Link width scale based on relationship strength
    const linkWidthScale = d3.scaleLinear()
      .domain(d3.extent(links, d => d.strength))
      .range([1, 8]);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).strength(d => d.strength * 0.5))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => sizeScale(d.meetingCount) + 5));

    // Create links
    const link = container.selectAll(".link")
      .data(links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke", "#999")
      .style("stroke-opacity", 0.6)
      .style("stroke-width", d => linkWidthScale(d.strength))
      .style("cursor", "pointer");

    // Create nodes
    const node = container.selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    // Add circles for countries
    node.append("circle")
      .attr("r", d => sizeScale(d.meetingCount))
      .style("fill", d => colorScale(d.cpi))
      .style("stroke", "#fff")
      .style("stroke-width", 2)
      .style("opacity", 0.8);

    // Add country labels
    node.append("text")
      .text(d => d.code)
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .style("pointer-events", "none");

    // Add country names on hover
    node.append("title")
      .text(d => `${d.name}\nCPI: ${d.cpi}\nMeetings: ${d.meetingCount}\nBudget: $${(d.budget / 1000).toFixed(0)}B`);

    // Add link tooltips
    link.append("title")
      .text(d => `${d.source.id} ↔ ${d.target.id}\nStrength: ${(d.strength * 100).toFixed(0)}%\nMeetings: ${d.meetingCount}\nTopics: ${d.topics.join(', ')}`);

    // Add interaction handlers
    node.on("click", (event, d) => {
      setSelectedNode(d);
      if (onNodeClick) onNodeClick(d);
      
      // Highlight connected nodes and links
      node.style("opacity", n => n === d || links.some(l => 
        (l.source === d && l.target === n) || (l.target === d && l.source === n)
      ) ? 1 : 0.3);
      
      link.style("opacity", l => l.source === d || l.target === d ? 1 : 0.1);
    });

    node.on("mouseover", function(event, d) {
      d3.select(this).select("circle")
        .transition().duration(200)
        .attr("r", sizeScale(d.meetingCount) * 1.2)
        .style("stroke-width", 4);
    });

    node.on("mouseout", function(event, d) {
      d3.select(this).select("circle")
        .transition().duration(200)
        .attr("r", sizeScale(d.meetingCount))
        .style("stroke-width", 2);
    });

    // Reset selection on background click
    svg.on("click", (event) => {
      if (event.target === svg.node()) {
        setSelectedNode(null);
        node.style("opacity", 1);
        link.style("opacity", 0.6);
      }
    });

    // Add drag behavior
    const drag = d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

  }, [countries, relationships, meetings, onNodeClick]);

  return (
    <div className="network-chart-container" style={{ 
      background: 'linear-gradient(135deg, #f8f6f3 0%, #f0e8e0 100%)',
      borderRadius: '20px',
      padding: '20px',
      position: 'relative'
    }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        color: '#8E7CC3',
        fontSize: '1.2em',
        fontWeight: 'bold'
      }}>
        World Leader Meeting Network
      </div>
      
      {networkStats && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '10px',
          fontSize: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div><strong>Network Stats:</strong></div>
          <div>Countries: {networkStats.totalCountries}</div>
          <div>Total Meetings: {networkStats.totalMeetings}</div>
          <div>Active Relationships: {networkStats.activeRelationships}</div>
          <div>Avg Relationship Strength: {(networkStats.avgStrength * 100).toFixed(0)}%</div>
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div><strong>Legend:</strong></div>
        <div>• Node size = Meeting frequency</div>
        <div>• Node color = CPI score</div>
        <div>• Link width = Relationship strength</div>
        <div>• Click nodes to highlight connections</div>
      </div>

      {selectedNode && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '20px',
          background: 'rgba(142, 124, 195, 0.95)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          fontSize: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          maxWidth: '200px'
        }}>
          <div><strong>{selectedNode.name}</strong></div>
          <div>CPI Score: {selectedNode.cpi}/100</div>
          <div>Total Meetings: {selectedNode.meetingCount}</div>
          <div>Budget: ${(selectedNode.budget / 1000).toFixed(0)}B</div>
          <div>Health: ${selectedNode.health_exp}/capita</div>
          <div>Education: ${selectedNode.education_exp}/capita</div>
        </div>
      )}

      <svg 
        ref={svgRef}
        style={{ 
          display: 'block',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '15px'
        }}
      />
    </div>
  );
};

export default CountryNetworkChart;