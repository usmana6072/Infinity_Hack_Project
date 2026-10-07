import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Topbar from '../components/Topbar';
import { ArrowLeft, Clock, Calendar, User, ShieldAlert } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await api.getProject(id);
        setProject(data);
      } catch (err) {
        if (err.status === 404) {
          setError('Project not found or you are not authorized to view this project.');
        } else {
          setError(err.message || 'Failed to load project details.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  if (loading) {
    return <div className="empty">Loading project details...</div>;
  }

  if (error || !project) {
    return (
      <div>
        <button className="btn ghost" onClick={() => navigate('/projects')} style={{ marginBottom: '16px' }}>
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </button>
        <div className="card alert error" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={24} />
          <div>
            <div className="strong">Access Denied or Not Found</div>
            <div>{error || 'Unable to access this project.'}</div>
          </div>
        </div>
      </div>
    );
  }

  const totalEffort = project.tasks?.reduce((sum, t) => sum + (t.estimatedHours || 0), 0) || 0;

  return (
    <div>
      <button className="btn ghost" onClick={() => navigate('/projects')} style={{ marginBottom: '16px' }}>
        <ArrowLeft size={16} />
        <span>Back to Projects</span>
      </button>

      <Topbar
        title={project.name}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge blue">{project.clientName}</span>
            <span className="badge green">{project.tasks?.length || 0} Tasks ({totalEffort}h)</span>
          </div>
        }
      />

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Project Overview</h3>
        <p className="muted" style={{ lineHeight: 1.6, margin: '0 0 20px 0' }}>
          {project.description || 'No description provided.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={18} className="muted" />
            <div>
              <div className="muted small">Project Manager</div>
              <div className="strong">{project.manager?.name} ({project.manager?.id})</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} className="muted" />
            <div>
              <div className="muted small">Project Deadline</div>
              <div className="strong">{project.deadline}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={18} className="muted" />
            <div>
              <div className="muted small">Total Development Effort</div>
              <div className="strong">{totalEffort} hours</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', margin: 0 }}>Authorized Project Tasks</h2>
        <span className="muted small">Filtered by server-side authorization</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Task Title & Description</th>
              <th>Assignee</th>
              <th>Task Deadline</th>
              <th>Est. Effort</th>
            </tr>
          </thead>
          <tbody>
            {project.tasks?.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty">No tasks available for this project.</td>
              </tr>
            ) : (
              project.tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className="strong">{task.title}</div>
                    {task.description && <div className="desc">{task.description}</div>}
                  </td>
                  <td>
                    <span className="strong">{task.assignee?.name}</span>
                    <div className="muted small">{task.assignee?.id}</div>
                  </td>
                  <td>
                    <span className="badge amber">{task.deadline}</span>
                  </td>
                  <td>
                    <span className="strong">{task.estimatedHours} hrs</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
