import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Topbar from '../components/Topbar';
import GlassBanner from '../components/GlassBanner';
import { CheckSquare, Clock, Calendar, ArrowRight, Filter } from 'lucide-react';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadTasks = async () => {
    try {
      const res = await api.getMyTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      setError(err.message || 'Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (task, newStatus) => {
    try {
      const updated = await api.updateTask(task.id, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === updated.id ? { 
        ...t, 
        status: updated.status, 
        remainingHours: updated.remainingHours 
      } : t));
    } catch (err) {
      alert(err.message || 'Failed to update task status.');
    }
  };

  const handleHoursChange = async (task, newHours) => {
    if (isNaN(newHours) || newHours < 0) {
      alert('Remaining hours must be a valid non-negative number.');
      return;
    }
    if (newHours === task.remainingHours) return;

    try {
      const updated = await api.updateTask(task.id, { remainingHours: newHours });
      setTasks(prev => prev.map(t => t.id === updated.id ? { 
        ...t, 
        remainingHours: updated.remainingHours,
        status: updated.status 
      } : t));
    } catch (err) {
      alert(err.message || 'Failed to update remaining hours.');
    }
  };

  const filteredTasks = filterStatus === 'ALL' 
    ? tasks 
    : tasks.filter(t => (t.status || 'TODO') === filterStatus);

  const totalEffort = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const remainingEffort = tasks.reduce((sum, t) => sum + (t.remainingHours !== undefined ? t.remainingHours : (t.estimatedHours || 0)), 0);
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div>
      <Topbar
        title="My Assigned Tasks"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge green">{completedCount}/{tasks.length} Completed</span>
            <span className="badge amber">{remainingEffort}h / {totalEffort}h Remaining</span>
          </div>
        }
      />

      <GlassBanner
        badge="DEVELOPER WORKBENCH"
        badgeColor="orange"
        title="Assigned Sprint Backlog & Live Effort Tracking"
        description="Update your remaining hours directly inline as you deliver code. Changes sync immediately across the CRM and management views."
        stats={[
          { label: 'Completed', value: `${completedCount} Tasks`, color: '#16a34a' },
          { label: 'Remaining Hours', value: `${remainingEffort} hrs`, color: '#ea580c' },
        ]}
      />

      {error && <div className="alert error">{error}</div>}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
          <button
            key={st}
            className={`btn small ${filterStatus === st ? 'primary' : 'ghost'}`}
            onClick={() => setFilterStatus(st)}
            style={{ textTransform: 'capitalize' }}
          >
            {st === 'ALL' ? 'All Tasks' : st === 'TODO' ? 'To Do' : st === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">Loading your tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="card empty">
          <CheckSquare size={40} style={{ color: '#94a3b8', marginBottom: '12px' }} />
          <h3>No tasks in this view</h3>
          <p className="muted">
            {filterStatus === 'ALL' 
              ? 'You do not have any tasks assigned to you at the moment.' 
              : `You have no tasks marked as "${filterStatus.toLowerCase().replace('_', ' ')}".`}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Task & Details</th>
                <th>Project</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Remaining / Est.</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className="strong">{task.title}</div>
                    {task.description && <div className="desc">{task.description}</div>}
                  </td>
                  <td>
                    <span className="badge blue">{task.projectName}</span>
                  </td>
                  <td>
                    <select
                      value={task.status || 'TODO'}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      style={{ 
                        padding: '4px 8px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        borderRadius: '6px',
                        width: 'auto',
                        background: task.status === 'COMPLETED' ? '#dcfce7' : task.status === 'IN_PROGRESS' ? '#ffedd5' : '#f1f5f9',
                        color: task.status === 'COMPLETED' ? '#166534' : task.status === 'IN_PROGRESS' ? '#ea580c' : '#475569',
                        borderColor: task.status === 'COMPLETED' ? '#bbf7d0' : task.status === 'IN_PROGRESS' ? '#fed7aa' : '#cbd5e1'
                      }}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                  <td>
                    <span className="badge amber">{task.deadline}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        key={`${task.id}-${task.remainingHours}`}
                        defaultValue={task.remainingHours !== undefined ? task.remainingHours : task.estimatedHours}
                        onBlur={(e) => handleHoursChange(task, parseFloat(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.target.blur();
                        }}
                        title="Edit remaining hours (Press Enter or click away to save)"
                        style={{
                          width: '65px',
                          padding: '4px 6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          textAlign: 'center',
                          borderRadius: '6px',
                          borderColor: task.remainingHours === 0 ? '#bbf7d0' : '#fed7aa',
                          background: task.remainingHours === 0 ? '#f0fdf4' : '#fff7ed',
                          color: task.remainingHours === 0 ? '#166534' : '#ea580c'
                        }}
                      />
                      <span className="muted small">/ {task.estimatedHours}h</span>
                    </div>
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
