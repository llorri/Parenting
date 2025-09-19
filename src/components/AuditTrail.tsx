import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import type { AuditSeverity, UserRole } from '../types';

const severities: AuditSeverity[] = ['info', 'warning', 'critical'];

export default function AuditTrail() {
  const { auditTrail } = useData();
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const roles = useMemo(() => Array.from(new Set(auditTrail.map((event) => event.actorRole))), [auditTrail]);

  const entries = useMemo(() => {
    return auditTrail.filter((event) => {
      if (severityFilter !== 'all' && event.severity !== severityFilter) {
        return false;
      }
      if (roleFilter !== 'all' && event.actorRole !== roleFilter) {
        return false;
      }
      return true;
    });
  }, [auditTrail, severityFilter, roleFilter]);

  const severityLabels: Record<AuditSeverity, string> = {
    info: 'Info',
    warning: 'Attention',
    critical: 'Critical'
  };

  return (
    <section className="section audit-section">
      <div className="audit-header">
        <div>
          <h2>Immutable audit history</h2>
          <p>
            Every BER action, login, and compliance update is timestamped for FERPA and CPI fidelity
            reviews.
          </p>
        </div>
        <div className="audit-filters">
          <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as AuditSeverity | 'all')}>
            <option value="all">All severities</option>
            {severities.map((severity) => (
              <option key={severity} value={severity}>
                {severityLabels[severity]}
              </option>
            ))}
          </select>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as UserRole | 'all')}>
            <option value="all">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ul className="timeline">
        {entries.map((event) => (
          <li key={event.id} className={event.severity}>
            <div className="timeline-icon" aria-hidden>
              {event.severity === 'info' ? '•' : event.severity === 'warning' ? '!' : '⚠︎'}
            </div>
            <div className="timeline-content">
              <div className="timeline-meta">
                <span className="timeline-actor">{event.actor}</span>
                <span className="audit-role">{event.actorRole}</span>
                <span className="timeline-date">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              <p>{event.action}</p>
              {event.metadata ? (
                <pre>{JSON.stringify(event.metadata, null, 2)}</pre>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
