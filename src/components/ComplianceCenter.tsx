import { FormEvent, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import type { ComplianceReminder, UserRole } from '../types';

const ownerRoles: UserRole[] = [
  'Administrator',
  'Program Specialist',
  'School Site Leader',
  'Behavior Analyst',
  'Crisis Responder'
];

export default function ComplianceCenter() {
  const { reminders, completeReminder, addReminder, reports } = useData();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [ownerRole, setOwnerRole] = useState<UserRole>('Program Specialist');
  const [relatedReportId, setRelatedReportId] = useState<string>('');
  const [description, setDescription] = useState('');

  const summary = useMemo(() => {
    const total = reminders.length;
    const overdue = reminders.filter((reminder) => reminder.status === 'overdue').length;
    const pending = reminders.filter((reminder) => reminder.status === 'pending').length;
    const complete = reminders.filter((reminder) => reminder.status === 'complete').length;
    return { total, overdue, pending, complete };
  }, [reminders]);

  const sortedReminders = useMemo(() => {
    return reminders
      .slice()
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [reminders]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !dueDate) {
      return;
    }
    const reminder: Omit<ComplianceReminder, 'id' | 'createdAt'> = {
      title: title.trim(),
      description:
        description.trim() ||
        'Automated reminder created from Compliance Center to ensure timely follow-through.',
      dueDate,
      status: 'pending',
      ownerRole,
      relatedReportId: relatedReportId || undefined
    };
    addReminder(reminder);
    setTitle('');
    setDueDate('');
    setDescription('');
    setRelatedReportId('');
  };

  return (
    <div className="compliance-center">
      <section className="section">
        <h2>Compliance overview</h2>
        <div className="grid-two">
          <div className="compliance-stat">
            <span>Total reminders</span>
            <strong>{summary.total}</strong>
          </div>
          <div className="compliance-stat warning">
            <span>Overdue</span>
            <strong>{summary.overdue}</strong>
          </div>
          <div className="compliance-stat">
            <span>Pending</span>
            <strong>{summary.pending}</strong>
          </div>
          <div className="compliance-stat success">
            <span>Completed</span>
            <strong>{summary.complete}</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Active reminders & audit trail</h2>
        {sortedReminders.length === 0 ? (
          <p className="empty-state">All compliance reminders are satisfied.</p>
        ) : (
          <ul className="reminder-board">
            {sortedReminders.map((reminder) => (
              <li key={reminder.id} className={reminder.status}>
                <div>
                  <h3>{reminder.title}</h3>
                  <p>{reminder.description}</p>
                  <div className="reminder-meta">
                    <span>Due {new Date(reminder.dueDate).toLocaleDateString()}</span>
                    <span>Role: {reminder.ownerRole}</span>
                    {reminder.relatedReportId ? (
                      <span>
                        Linked BER:{' '}
                        {reports.find((report) => report.id === reminder.relatedReportId)?.studentName ??
                          reminder.relatedReportId}
                      </span>
                    ) : null}
                  </div>
                </div>
                {reminder.status !== 'complete' ? (
                  <button type="button" onClick={() => completeReminder(reminder.id)}>
                    Mark complete
                  </button>
                ) : (
                  <span className="chip complete">Closed</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <h2>Create a targeted reminder</h2>
        <form className="reminder-form" onSubmit={handleSubmit}>
          <div className="grid-two">
            <label>
              <span>Reminder title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g., Send FERPA notice to guardian"
                required
              />
            </label>
            <label>
              <span>Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Responsible role</span>
              <select value={ownerRole} onChange={(event) => setOwnerRole(event.target.value as UserRole)}>
                {ownerRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Link to BER (optional)</span>
              <select value={relatedReportId} onChange={(event) => setRelatedReportId(event.target.value)}>
                <option value="">No link</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.studentName} · {new Date(report.incidentDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Provide instructions or compliance references for your team."
            />
          </label>
          <button type="submit">Schedule reminder</button>
        </form>
      </section>
    </div>
  );
}
