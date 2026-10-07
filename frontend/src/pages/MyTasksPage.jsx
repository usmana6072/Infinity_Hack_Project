import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Topbar from '../components/Topbar';
import { CheckSquare, Clock, Calendar, ArrowRight } from 'lucide-react';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await api.getMyTasks();
        setTasks(res.tasks || []);
      } catch (err) {
        setError(err.message || 'Failed to load your tasks');
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const totalEffort = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  return (
    <div>
      <Topbar
        title="My Assigned Tasks"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge green">{tasks.length} Assigned Tasks</span>
            <span className="badge amber">{totalEffort} Total Hours</span>
          </div>
        }
      />

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="empty">Loading your tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="card empty">
          <CheckSquare size={40} style={{ color: '#94a3b8', marginBottom: '12px' }} />
          <h3>No tasks assigned</h3>
          <p className="muted">You do not have any tasks assigned to you at the moment.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Task & Details</th>
                <th>Project</th>
                <th>Deadline</th>
                <th>Effort</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className="strong">{task.title}</div>
                    {task.description && <div className="desc">{task.description}</div>}
                  </td>
                  <td>
                    <span className="badge blue">{task.projectName}</span>
                  </td>
                  <td>
                    <span className="badge amber">{task.deadline}</span>
                  </td>
                  <td>
                    <span className="strong">{task.estimatedHours} hrs</span>
                  </td>
                  <td>
                    <button
                      className="btn ghost small"
                      onClick={() => navigate(`/projects/${task.projectId}`)}
                      title="View Project"
                    >
                      <span>Project</span>
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
