import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Topbar from '../components/Topbar';
import TiltCard from '../components/TiltCard';
import GlassBanner from '../components/GlassBanner';
import { FolderKanban, CheckSquare, Clock, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, taskRes] = await Promise.all([
          api.getProjects(),
          api.getTasks(),
        ]);
        setProjects(projRes.projects || []);
        setTasks(taskRes.tasks || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const remainingHours = tasks.reduce((sum, t) => sum + (t.remainingHours !== undefined ? t.remainingHours : (t.estimatedHours || 0)), 0);

  return (
    <div>
      <Topbar
        title="Admin Overview Dashboard"
        actions={
          <button className="btn primary" onClick={() => navigate('/transcript')}>
            <Sparkles size={16} />
            <span>Create from Transcript</span>
          </button>
        }
      />

      <GlassBanner
        badge="AI ORCHESTRATION"
        badgeColor="orange"
        title="NovaWorks Autonomous Project Delivery Matrix"
        description="Meeting transcript intelligence, role-isolated task governance & real-time remaining effort tracking across 10 specialized agents."
        stats={[
          { label: 'System Mode', value: 'Live Autonomous', color: '#16a34a' },
          { label: 'Role Security', value: 'RBAC Enforced', color: '#ea580c' },
        ]}
      />

      {error && <div className="alert error">{error}</div>}

      <div className="stats">
        <TiltCard className="stat" maxTilt={6}>
          <div className="label">Total Projects</div>
          <div className="num" style={{ color: '#ea580c' }}>{projects.length}</div>
        </TiltCard>
        <TiltCard className="stat" maxTilt={6}>
          <div className="label">Total Tasks</div>
          <div className="num" style={{ color: '#0ea5e9' }}>{tasks.length}</div>
        </TiltCard>
        <TiltCard className="stat" maxTilt={6}>
          <div className="label">Planned Dev Hours</div>
          <div className="num" style={{ color: '#10b981' }}>{totalHours}h</div>
        </TiltCard>
        <TiltCard className="stat" maxTilt={6}>
          <div className="label">Remaining Dev Hours</div>
          <div className="num" style={{ color: '#ea580c' }}>{remainingHours}h</div>
        </TiltCard>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', margin: 0 }}>Active Projects</h2>
        <button className="btn ghost" onClick={() => navigate('/projects')}>
          <span>View all</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="empty">Loading dashboard...</div>
      ) : projects.length === 0 ? (
        <div className="card empty">
          <h3>No projects created yet</h3>
          <p className="muted">Use the AI Transcript converter to create projects and tasks from a meeting transcript.</p>
          <button className="btn primary" style={{ marginTop: '14px' }} onClick={() => navigate('/transcript')}>
            <Sparkles size={16} />
            <span>Convert Transcript</span>
          </button>
        </div>
      ) : (
        <div className="grid">
          {projects.map((proj) => (
            <TiltCard
              key={proj.id}
              className="project-card"
              onClick={() => navigate(`/projects/${proj.id}`)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span className="badge">{proj.clientName}</span>
                  <span className="badge green">{proj.taskCount} tasks</span>
                </div>
                <h3>{proj.name}</h3>
                <p className="muted small" style={{ margin: '8px 0 14px 0', lineClamp: 2 }}>
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div className="meta">
                <div>
                  <span>Manager</span>
                  <span className="strong">{proj.manager?.name} ({proj.manager?.id})</span>
                </div>
                <div>
                  <span>Delivery Deadline</span>
                  <span className="strong">{proj.deadline}</span>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      )}
    </div>
  );
}
