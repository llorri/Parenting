import { useData } from '../context/DataContext';
import type { BehaviorEmergencyReport } from '../types';

interface ReportDetailsPanelProps {
  report: BehaviorEmergencyReport;
  onClose: () => void;
}

const formatDateTime = (iso?: string) =>
  iso ? `${new Date(iso).toLocaleDateString()} ${new Date(iso).toLocaleTimeString()}` : '—';

export default function ReportDetailsPanel({ report, onClose }: ReportDetailsPanelProps) {
  const { updateFollowUpAction } = useData();

  return (
    <aside className="report-details">
      <div className="report-details-header">
        <div>
          <h3>{report.studentName}</h3>
          <p>
            Incident on {new Date(report.incidentDate).toLocaleDateString()} at {report.location} ·{' '}
            {report.site}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close report details">
          Close
        </button>
      </div>

      <div className="detail-grid">
        <div>
          <h4>Student identifiers</h4>
          <ul>
            <li>Student ID: {report.studentId}</li>
            <li>Grade: {report.gradeLevel || '—'}</li>
            <li>District: {report.district}</li>
          </ul>
        </div>
        <div>
          <h4>Guardian contact</h4>
          <ul>
            <li>Status: {report.guardianContacted ? 'Contacted' : 'Pending'}</li>
            <li>Method: {report.guardianContactMethod ?? '—'}</li>
            <li>Timestamp: {formatDateTime(report.guardianContactedOn)}</li>
          </ul>
        </div>
      </div>

      <section>
        <h4>Incident summary</h4>
        <p>{report.incidentDescription}</p>
        <h5>Precipitating factors</h5>
        <p>{report.precipitatingFactors || 'Not documented'}</p>
        <h5>De-escalation strategies</h5>
        <p>{report.interventionsAttempted || 'Not documented'}</p>
      </section>

      <section>
        <h4>CPI intervention details</h4>
        <ul>
          <li>Technique: {report.physicalInterventionType ?? 'Not used'}</li>
          <li>Duration: {report.restraintDurationMinutes ?? 0} minutes</li>
          <li>Injuries reported: {report.injuriesReported ? 'Yes' : 'No'}</li>
          <li>Medical follow-up required: {report.medicalFollowUpRequired ? 'Yes' : 'No'}</li>
        </ul>
      </section>

      <section>
        <h4>Follow-up checklist</h4>
        {report.followUpActions.length === 0 ? (
          <p>No follow-up tasks assigned.</p>
        ) : (
          <ul className="task-list">
            {report.followUpActions.map((action, index) => (
              <li key={`${action.label}-${index}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={action.completed}
                    onChange={(event) =>
                      updateFollowUpAction(report.id, index, event.target.checked)
                    }
                  />
                  <span>{action.label}</span>
                </label>
                <span>
                  {action.completed
                    ? `Completed ${action.completedOn ? new Date(action.completedOn).toLocaleDateString() : ''}`
                    : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        )}
        {report.followUpDueDate ? (
          <p className="detail-meta">
            Follow-up due {new Date(report.followUpDueDate).toLocaleDateString()} · Specialist:{' '}
            {report.behaviorSpecialistAssigned || 'Not assigned'}
          </p>
        ) : null}
      </section>

      <section>
        <h4>Debrief documentation</h4>
        <ul>
          <li>Status: {report.debriefCompleted ? 'Completed' : 'Pending'}</li>
          <li>Reviewer: {report.reviewedBy ?? 'Not recorded'}</li>
          <li>Notes: {report.debriefNotes || 'No notes recorded'}</li>
        </ul>
      </section>

      <footer>
        <small>
          Created {formatDateTime(report.createdAt)} by {report.createdBy}. Last updated{' '}
          {formatDateTime(report.updatedAt)} by {report.updatedBy}.
        </small>
      </footer>
    </aside>
  );
}
