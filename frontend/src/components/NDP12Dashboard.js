import React, { useEffect, useState } from 'react';

const NDP12Dashboard = ({ apiBaseUrl }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, projRes, kpiRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/v1/ndp12/dashboard`),
        fetch(`${apiBaseUrl}/api/v1/ndp12/projects`),
        fetch(`${apiBaseUrl}/api/v1/ndp12/kpis`)
      ]);

      const [dashData, projData, kpiData] = await Promise.all([
        dashRes.json(),
        projRes.json(),
        kpiRes.json()
      ]);

      setDashboardData(dashData);
      setProjects(projData);
      setKpis(kpiData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching NDP12 data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B BWP`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M BWP`;
    }
    return `${value.toLocaleString()} BWP`;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#10b981',
      ongoing: '#3b82f6',
      delayed: '#ef4444',
      planning: '#6366f1'
    };
    return colors[status] || '#6b7280';
  };

  const getKPIProgress = (kpi) => {
    const progress = ((kpi.current_value - kpi.baseline_value) / (kpi.target_value - kpi.baseline_value)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const filteredProjects = selectedFilter === 'all' 
    ? projects 
    : projects.filter(p => p.status === selectedFilter);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#6b7280' }}>Loading NDP 12 Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="ndp12-dashboard">
      {/* Summary Cards */}
      {dashboardData && (
        <div className="modern-metrics-grid" style={{ marginBottom: '30px' }}>
          <div className="modern-metric-card primary">
            <h3 className="modern-metric-title">📊 Total Projects</h3>
            <p className="modern-metric-value">{dashboardData.total_projects}</p>
            <small className="modern-metric-subtitle">NDP 12 Initiatives</small>
          </div>

          <div className="modern-metric-card success">
            <h3 className="modern-metric-title">✅ Completed</h3>
            <p className="modern-metric-value">{dashboardData.completed_projects}</p>
            <small className="modern-metric-subtitle">
              {Math.round((dashboardData.completed_projects / dashboardData.total_projects) * 100)}% completion rate
            </small>
          </div>

          <div className="modern-metric-card accent">
            <h3 className="modern-metric-title">🔄 Ongoing</h3>
            <p className="modern-metric-value">{dashboardData.ongoing_projects}</p>
            <small className="modern-metric-subtitle">Active projects</small>
          </div>

          <div className="modern-metric-card warning">
            <h3 className="modern-metric-title">💰 Total Budget</h3>
            <p className="modern-metric-value">{formatCurrency(dashboardData.total_budget_allocated)}</p>
            <small className="modern-metric-subtitle">
              {formatCurrency(dashboardData.total_budget_spent)} spent ({Math.round((dashboardData.total_budget_spent / dashboardData.total_budget_allocated) * 100)}%)
            </small>
          </div>

          <div className="modern-metric-card">
            <h3 className="modern-metric-title">🎯 KPIs Tracked</h3>
            <p className="modern-metric-value">{dashboardData.total_kpis}</p>
            <small className="modern-metric-subtitle">{dashboardData.kpis_on_track} on track</small>
          </div>

          <div className="modern-metric-card">
            <h3 className="modern-metric-title">📈 Avg Progress</h3>
            <p className="modern-metric-value">{dashboardData.avg_completion}%</p>
            <small className="modern-metric-subtitle">Overall completion</small>
          </div>
        </div>
      )}

      {/* KPIs Section */}
      <div className="modern-section modern-fade-in" style={{ marginBottom: '30px' }}>
        <h2 className="modern-section-title">🎯 NDP 12 Key Performance Indicators</h2>
        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {kpis.map(kpi => {
            const progress = getKPIProgress(kpi);
            const isOnTrack = kpi.current_value >= kpi.baseline_value;
            
            return (
              <div key={kpi.kpi_code} className="modern-metric-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '10px', color: '#1f2937' }}>{kpi.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2563eb' }}>
                      {kpi.current_value}{kpi.unit === 'percentage' ? '%' : ''}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      Target: {kpi.target_value}{kpi.unit === 'percentage' ? '%' : ''} by {kpi.target_year}
                    </div>
                  </div>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    background: `conic-gradient(${isOnTrack ? '#10b981' : '#ef4444'} ${progress * 3.6}deg, #e5e7eb 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {Math.round(progress)}%
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  <strong>Category:</strong> {kpi.category} | <strong>Baseline:</strong> {kpi.baseline_value} ({kpi.baseline_year})
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '5px' }}>
                  {kpi.responsible_ministry}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Projects Section */}
      <div className="modern-section modern-fade-in">
        <h2 className="modern-section-title">🏗️ NDP 12 Projects Portfolio</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <div className="modern-btn-group">
            <button 
              onClick={() => setSelectedFilter('all')}
              className={`modern-btn ${selectedFilter === 'all' ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
            >
              All Projects
            </button>
            <button 
              onClick={() => setSelectedFilter('ongoing')}
              className={`modern-btn ${selectedFilter === 'ongoing' ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
            >
              Ongoing
            </button>
            <button 
              onClick={() => setSelectedFilter('completed')}
              className={`modern-btn ${selectedFilter === 'completed' ? 'modern-btn-primary' : 'modern-btn-secondary'}`}
            >
              Completed
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredProjects.map(project => (
            <div key={project.id} className="modern-metric-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#1f2937', flex: 1 }}>{project.name}</h3>
                <span style={{ 
                  padding: '4px 12px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold',
                  backgroundColor: getStatusColor(project.status) + '20',
                  color: getStatusColor(project.status)
                }}>
                  {project.status.toUpperCase()}
                </span>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '15px' }}>
                {project.description}
              </p>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px' }}>
                  <strong>Sector:</strong> {project.sector}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px' }}>
                  <strong>Ministry:</strong> {project.ministry}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '5px' }}>
                  <strong>Region:</strong> {project.region}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                  <span>Budget Progress</span>
                  <span>{Math.round((project.budget_spent / project.budget_allocated) * 100)}%</span>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: '#e5e7eb', 
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  marginBottom: '5px'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(project.budget_spent / project.budget_allocated) * 100}%`,
                    background: '#3b82f6'
                  }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {formatCurrency(project.budget_spent)} / {formatCurrency(project.budget_allocated)}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                  <span>Completion</span>
                  <span>{project.completion_percentage}%</span>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: '#e5e7eb', 
                  borderRadius: '4px', 
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${project.completion_percentage}%`,
                    background: '#10b981'
                  }} />
                </div>
              </div>

              <div style={{ marginTop: '15px', fontSize: '0.75rem', color: '#6b7280' }}>
                <strong>Timeline:</strong> {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NDP12Dashboard;
