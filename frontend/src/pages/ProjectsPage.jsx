import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Topbar from '../components/Topbar';
import { FolderKanban, Sparkles, ArrowRight } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.getProjects();
        setProjects(res.projects || []);
      } catch (err) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const pageTitle = user?.role === 'ADMIN' ? 'All Client Projects' : user?.role === 'MANAGER' ? 'My Managed Projects' : 'Projects Involving My Tasks';

  return (
    <div>
      <Topbar
        title={pageTitle}
        actions={
          user?.role === 'ADMIN' ? (
            <button className="btn primary" onClick={() => navigate('/transcript')}>
              <Sparkles size={16} />
              <span>Create from Transcript</span>
            </button>
          ) : null
        }
      />

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="empty">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="card empty">
          <FolderKanban size={40} style={{ color: '#94a3b8', marginBottom: '12px' }} />
          <h3>No projects found</h3>
          <p className="muted">
            {user?.role === 'ADMIN' 
              ? 'No projects exist yet. Run transcript extraction to populate projects.' 
              : 'You do not have any projects assigned to your account.'}
          </p>
        </div>
      ) : (
        <div className="grid">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="card project-card"
              onClick={() => navigate(`/projects/${proj.id}`)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge">{proj.clientName}</span>
                  <span className="badge green">{proj.taskCount} tasks</span>
                </div>
                <h3>{proj.name}</h3>
                <p className="muted small" style={{ margin: '8px 0 16px 0', minHeight: '40px' }}>
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div className="meta">
                <div>
                  <span>Project Manager</span>
                  <span className="strong">{proj.manager?.name} ({proj.manager?.id})</span>
                </div>
                <div>
                  <span>Deadline</span>
                  <span className="strong">{proj.deadline}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <span className="btn ghost small" style={{ padding: '6px 12px' }}>
                  <span>View Details</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
