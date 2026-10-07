import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Topbar from '../components/Topbar';
import GlassBanner from '../components/GlassBanner';
import { 
  ArrowLeft, Clock, Calendar, User, ShieldAlert, 
  UserCheck, CheckCircle2, AlertCircle, RefreshCw, X 
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reassign Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedNewAssignee, setSelectedNewAssignee] = useState('');
  const [reassignLoading, setReassignLoading] = useState(false);
  const [reassignError, setReassignError] = useState('');

  const loadProject = async () => {
    try {
      const [projData, teamData] = await Promise.all([
        api.getProject(id),
        api.getTeam(),
      ]);
      setProject(projData);
      setTeam(teamData.users?.filter(u => u.role === 'AGENT') || []);
    } catch (err) {
      if (err.status === 404) {
        setError('Project not found or you are not authorized to view this project.');
      } else {
        setError(err.message || 'Failed to load project details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleOpenReassign = (task) => {
    setSelectedTask(task);
    setSelectedNewAssignee(task.assignee?.id || '');
    setReassignError('');
    setReassignModalOpen(true);
  };

  const handleConfirmReassign = async () => {
    if (!selectedNewAssignee || selectedNewAssignee === selectedTask.assignee?.id) {
      setReassignModalOpen(false);
      return;
    }

    setReassignLoading(true);
    setReassignError('');
    try {
      const updatedTask = await api.updateTask(selectedTask.id, {
        assigneeId: selectedNewAssignee,
      });

      // Update project state locally
      setProject(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === updatedTask.id ? { ...t, assignee: updatedTask.assignee } : t)
      }));

      setReassignModalOpen(false);
    } catch (err) {
      setReassignError(err.message || 'Failed to reassign task.');
    } finally {
      setReassignLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const updatedTask = await api.updateTask(task.id, { status: newStatus });
      setProject(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === updatedTask.id ? { 
          ...t, 
          status: updatedTask.status,
          remainingHours: updatedTask.remainingHours 
        } : t)
      }));
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
      const updatedTask = await api.updateTask(task.id, { remainingHours: newHours });
      setProject(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === updatedTask.id ? { 
          ...t, 
          remainingHours: updatedTask.remainingHours,
          status: updatedTask.status 
        } : t)
      }));
    } catch (err) {
      alert(err.message || 'Failed to update remaining hours.');
    }
  };

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
  const remainingEffort = project.tasks?.reduce((sum, t) => sum + (t.remainingHours !== undefined ? t.remainingHours : (t.estimatedHours || 0)), 0) || 0;
  const canReassign = user?.role === 'ADMIN' || (user?.role === 'MANAGER' && project.manager?.id === user?.id);
  const canEditTask = (task) => user?.role === 'ADMIN' || (user?.role === 'MANAGER' && project.manager?.id === user?.id) || (user?.role === 'AGENT' && task.assignee?.id === user?.id);

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
            <span className="badge green">{project.tasks?.length || 0} Tasks</span>
            <span className="badge amber">{remainingEffort}h / {totalEffort}h Remaining</span>
          </div>
        }
      />

      <GlassBanner
        badge="DELIVERY PIPELINE"
        badgeColor="orange"
        title={`${project.name} • Execution & Scope Matrix`}
        description={`Client: ${project.clientName} • Managed by ${project.manager?.name} (${project.manager?.id}) • Target Delivery: ${project.deadline}`}
        stats={[
          { label: 'Pipeline State', value: remainingEffort === 0 ? 'Completed' : 'In Progress', color: remainingEffort === 0 ? '#16a34a' : '#ea580c' },
          { label: 'Effort Left', value: `${remainingEffort}h / ${totalEffort}h`, color: '#ea580c' }
        ]}
      />

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Project Overview</h3>
        <p className="muted" style={{ lineHeight: 1.6, margin: '0 0 20px 0' }}>
          {project.description || 'No description provided.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
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
              <div className="muted small">Total Effort</div>
              <div className="strong">{totalEffort} hours</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={18} style={{ color: '#ea580c' }} />
            <div>
              <div className="muted small">Remaining Dev Hours</div>
              <div className="strong" style={{ color: '#ea580c' }}>{remainingEffort} hours left</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', margin: 0 }}>Authorized Project Tasks</h2>
        <span className="muted small">Filtered & protected by server authorization</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Task Title & Description</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Remaining / Est.</th>
              {canReassign && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {project.tasks?.length === 0 ? (
              <tr>
                <td colSpan={canReassign ? 6 : 5} className="empty">No tasks available for this project.</td>
              </tr>
            ) : (
              project.tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className="strong">{task.title}</div>
                    {task.description && <div className="desc">{task.description}</div>}
                  </td>
                  <td>
                    <div className="strong">{task.assignee?.name}</div>
                    <div className="muted small">{task.assignee?.id}</div>
                  </td>
                  <td>
                    <select
                      value={task.status || 'TODO'}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      disabled={!canEditTask(task)}
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
                    {canEditTask(task) ? (
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
                    ) : (
                      <div>
                        <span className="strong" style={{ color: task.remainingHours === 0 ? '#166534' : '#ea580c' }}>
                          {task.remainingHours !== undefined ? task.remainingHours : task.estimatedHours}h
                        </span>
                        <span className="muted small"> / {task.estimatedHours}h</span>
                      </div>
                    )}
                  </td>
                  {canReassign && (
                    <td>
                      <button
                        className="btn ghost small"
                        onClick={() => handleOpenReassign(task)}
                        title="Reassign Task to another Agent"
                        style={{ border: '1px solid #fed7aa', color: '#ea580c' }}
                      >
                        <UserCheck size={14} />
                        <span>Reassign</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reassign Modal */}
      {reassignModalOpen && selectedTask && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Reassign Task</h3>
              <button className="btn ghost" onClick={() => setReassignModalOpen(false)} style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <p className="muted small" style={{ margin: '0 0 16px 0' }}>
              Reassign <strong>"{selectedTask.title}"</strong> to another developer agent:
            </p>

            {reassignError && <div className="alert error">{reassignError}</div>}

            <label>
              Select New Assignee (Developer Agent)
              <select
                value={selectedNewAssignee}
                onChange={(e) => setSelectedNewAssignee(e.target.value)}
                style={{ marginTop: '8px' }}
              >
                {team.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.id}) — {agent.specialization || 'Agent'}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                className="btn ghost"
                onClick={() => setReassignModalOpen(false)}
                disabled={reassignLoading}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={handleConfirmReassign}
                disabled={reassignLoading}
              >
                {reassignLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Reassigning...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm Reassignment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
