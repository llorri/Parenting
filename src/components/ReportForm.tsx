import { FormEvent, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import type { BehaviorEmergencyReport, FollowUpAction, ReportStatus } from '../types';

const interventionOptions = [
  'Standing hold (CPI Level 2)',
  'Team control position (CPI Level 3)',
  'Transport position (CPI Level 4)',
  'Seated cradle hold',
  'Other CPI-approved intervention'
];

const statusOptions: ReportStatus[] = [
  'Submitted',
  'Under Review',
  'Follow-up Scheduled',
  'Closed'
];

const initialForm: Omit<
  BehaviorEmergencyReport,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'status'
  | 'followUpActions'
> & { status?: ReportStatus; followUpActions: FollowUpAction[] } = {
  studentName: '',
  studentId: '',
  gradeLevel: '',
  guardianContacted: true,
  guardianContactedOn: new Date().toISOString(),
  guardianContactMethod: 'Phone Call',
  site: '',
  district: 'Bay Unified',
  location: '',
  incidentDate: new Date().toISOString().split('T')[0],
  incidentTime: '09:00',
  precipitatingFactors: '',
  incidentDescription: '',
  interventionsAttempted: '',
  physicalInterventionUsed: true,
  physicalInterventionType: interventionOptions[0],
  restraintDurationMinutes: 2,
  injuriesReported: false,
  medicalFollowUpRequired: false,
  followUpDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
  followUpActions: [],
  behaviorSpecialistAssigned: '',
  status: 'Submitted',
  debriefCompleted: false,
  debriefNotes: '',
  reviewedBy: undefined
};

interface ReportFormProps {
  onCreated?: (report: BehaviorEmergencyReport) => void;
}

export default function ReportForm({ onCreated }: ReportFormProps) {
  const { createReport, currentUser } = useData();
  const [formState, setFormState] = useState(initialForm);
  const [newTask, setNewTask] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return (
      formState.studentName.trim().length > 0 &&
      formState.studentId.trim().length > 0 &&
      formState.site.trim().length > 0 &&
      formState.location.trim().length > 0 &&
      formState.incidentDescription.trim().length > 0
    );
  }, [formState]);

  const handleChange = <T extends keyof typeof formState>(field: T, value: (typeof formState)[T]) => {
    setFormState((previous) => ({ ...previous, [field]: value }));
  };

  const handleAddTask = () => {
    if (!newTask.trim()) {
      return;
    }
    setFormState((previous) => ({
      ...previous,
      followUpActions: [...previous.followUpActions, { label: newTask.trim(), completed: false }]
    }));
    setNewTask('');
  };

  const handleRemoveTask = (index: number) => {
    setFormState((previous) => ({
      ...previous,
      followUpActions: previous.followUpActions.filter((_, taskIndex) => taskIndex !== index)
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setMessage('Please complete the highlighted fields before saving.');
      return;
    }

    const created = createReport({
      ...formState,
      incidentDate: new Date(formState.incidentDate).toISOString(),
      followUpDueDate: formState.followUpDueDate
        ? new Date(formState.followUpDueDate).toISOString()
        : undefined,
      followUpActions: formState.followUpActions,
      status: formState.status
    });
    setMessage(`BER for ${created.studentName} saved successfully.`);
    setFormState(initialForm);
    onCreated?.(created);
  };

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <header>
        <div>
          <h2>Document a Behavior Emergency</h2>
          <p>
            Capture legally required details for California BERs. {currentUser?.role} submissions are
            tracked in the encrypted audit log.
          </p>
        </div>
        <button type="submit" disabled={!isValid}>
          Save BER
        </button>
      </header>

      {message ? <div className="form-message">{message}</div> : null}

      <section className="form-section">
        <h3>Student & guardian information</h3>
        <div className="grid-two">
          <label>
            <span>Student name*</span>
            <input
              value={formState.studentName}
              onChange={(event) => handleChange('studentName', event.target.value)}
              required
            />
          </label>
          <label>
            <span>Student ID*</span>
            <input
              value={formState.studentId}
              onChange={(event) => handleChange('studentId', event.target.value)}
              required
            />
          </label>
          <label>
            <span>Grade level</span>
            <input
              value={formState.gradeLevel}
              onChange={(event) => handleChange('gradeLevel', event.target.value)}
              placeholder="e.g., 8"
            />
          </label>
          <label>
            <span>Site / program*</span>
            <input
              value={formState.site}
              onChange={(event) => handleChange('site', event.target.value)}
              required
            />
          </label>
          <label>
            <span>Guardian contacted?</span>
            <select
              value={formState.guardianContacted ? 'yes' : 'no'}
              onChange={(event) => handleChange('guardianContacted', event.target.value === 'yes')}
            >
              <option value="yes">Yes</option>
              <option value="no">Not yet</option>
            </select>
          </label>
          <label>
            <span>Contact method</span>
            <input
              value={formState.guardianContactMethod ?? ''}
              onChange={(event) => handleChange('guardianContactMethod', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="form-section">
        <h3>Incident timeline</h3>
        <div className="grid-three">
          <label>
            <span>Date of incident*</span>
            <input
              type="date"
              value={formState.incidentDate}
              onChange={(event) => handleChange('incidentDate', event.target.value)}
              required
            />
          </label>
          <label>
            <span>Time</span>
            <input
              type="time"
              value={formState.incidentTime}
              onChange={(event) => handleChange('incidentTime', event.target.value)}
            />
          </label>
          <label>
            <span>Primary location*</span>
            <input
              value={formState.location}
              onChange={(event) => handleChange('location', event.target.value)}
              required
            />
          </label>
        </div>
        <label>
          <span>Precipitating factors</span>
          <textarea
            value={formState.precipitatingFactors}
            onChange={(event) => handleChange('precipitatingFactors', event.target.value)}
            rows={3}
            placeholder="What happened right before the crisis?"
          />
        </label>
        <label>
          <span>Incident narrative*</span>
          <textarea
            value={formState.incidentDescription}
            onChange={(event) => handleChange('incidentDescription', event.target.value)}
            rows={4}
            required
          />
        </label>
        <label>
          <span>De-escalation strategies attempted</span>
          <textarea
            value={formState.interventionsAttempted}
            onChange={(event) => handleChange('interventionsAttempted', event.target.value)}
            rows={3}
          />
        </label>
      </section>

      <section className="form-section">
        <h3>CPI response details</h3>
        <div className="grid-three">
          <label>
            <span>Physical intervention used?</span>
            <select
              value={formState.physicalInterventionUsed ? 'yes' : 'no'}
              onChange={(event) => handleChange('physicalInterventionUsed', event.target.value === 'yes')}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            <span>Technique</span>
            <select
              value={formState.physicalInterventionType ?? ''}
              onChange={(event) => handleChange('physicalInterventionType', event.target.value)}
              disabled={!formState.physicalInterventionUsed}
            >
              {interventionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Duration (minutes)</span>
            <input
              type="number"
              min={0}
              value={formState.restraintDurationMinutes ?? 0}
              onChange={(event) => handleChange('restraintDurationMinutes', Number(event.target.value))}
            />
          </label>
        </div>
        <div className="grid-two">
          <label>
            <span>Any injuries noted?</span>
            <select
              value={formState.injuriesReported ? 'yes' : 'no'}
              onChange={(event) => handleChange('injuriesReported', event.target.value === 'yes')}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label>
            <span>Medical follow-up required?</span>
            <select
              value={formState.medicalFollowUpRequired ? 'yes' : 'no'}
              onChange={(event) => handleChange('medicalFollowUpRequired', event.target.value === 'yes')}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
        </div>
      </section>

      <section className="form-section">
        <h3>Follow-up planning & compliance</h3>
        <div className="grid-three">
          <label>
            <span>Follow-up due date</span>
            <input
              type="date"
              value={formState.followUpDueDate ?? ''}
              onChange={(event) => handleChange('followUpDueDate', event.target.value)}
            />
          </label>
          <label>
            <span>Assigned specialist</span>
            <input
              value={formState.behaviorSpecialistAssigned ?? ''}
              onChange={(event) => handleChange('behaviorSpecialistAssigned', event.target.value)}
            />
          </label>
          <label>
            <span>Status</span>
            <select
              value={formState.status}
              onChange={(event) => handleChange('status', event.target.value as ReportStatus)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="task-editor">
          <label>
            <span>Compliance tasks / debrief checklist</span>
            <div className="task-input">
              <input
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="e.g., Upload signed debrief form"
              />
              <button type="button" onClick={handleAddTask}>
                Add task
              </button>
            </div>
          </label>
          {formState.followUpActions.length ? (
            <ul>
              {formState.followUpActions.map((action, index) => (
                <li key={action.label}>
                  <span>{action.label}</span>
                  <button type="button" onClick={() => handleRemoveTask(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="form-section">
        <h3>Debrief notes</h3>
        <div className="grid-two">
          <label>
            <span>Debrief held?</span>
            <select
              value={formState.debriefCompleted ? 'yes' : 'no'}
              onChange={(event) => handleChange('debriefCompleted', event.target.value === 'yes')}
            >
              <option value="no">Not yet</option>
              <option value="yes">Completed</option>
            </select>
          </label>
          <label>
            <span>Reviewer</span>
            <input
              value={formState.reviewedBy ?? currentUser?.name ?? ''}
              onChange={(event) => handleChange('reviewedBy', event.target.value)}
              placeholder="e.g., Site administrator"
            />
          </label>
        </div>
        <label>
          <span>Debrief summary</span>
          <textarea
            value={formState.debriefNotes ?? ''}
            onChange={(event) => handleChange('debriefNotes', event.target.value)}
            rows={3}
            placeholder="Capture key outcomes, parent feedback, and next steps."
          />
        </label>
      </section>
    </form>
  );
}
