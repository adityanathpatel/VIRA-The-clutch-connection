import { useNavigate } from 'react-router-dom';

export default function TaskCard({ task, showActions, onAssign, onComplete }) {
  const navigate = useNavigate();

  return (
    <div className="task-card" onClick={() => navigate(`/tasks/${task.id}`)}>
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        <div className="task-card-badges">
          <span className={`badge badge-${task.urgency}`}>{task.urgency}</span>
          <span className={`badge badge-${task.status}`}>{task.status}</span>
        </div>
      </div>

      <p className="task-card-desc">{task.description}</p>

      <div className="task-card-meta">
        <span>📍 {task.location}</span>
        <span>🏷️ {task.category}</span>
        {task.assignedVolunteer && <span>👤 {task.assignedVolunteer.name}</span>}
      </div>

      {showActions && (
        <div className="task-card-footer" onClick={e => e.stopPropagation()}>
          {task.status === 'pending' && onAssign && (
            <button className="btn btn-primary btn-sm" onClick={() => onAssign(task.id)}>
              🤝 Smart Match
            </button>
          )}
          {task.status === 'assigned' && onComplete && (
            <button className="btn btn-success btn-sm" onClick={() => onComplete(task.id)}>
              ✅ Mark Complete
            </button>
          )}
          {!onAssign && !onComplete && <span />}
          <span className="text-xs text-light">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
