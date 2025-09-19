import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type {
  AuditEvent,
  BehaviorEmergencyReport,
  ComplianceReminder
} from '../types';

interface DashboardProps {
  reports: BehaviorEmergencyReport[];
  reminders: ComplianceReminder[];
  auditTrail: AuditEvent[];
}

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const StatsCard = ({
  label,
  value,
  context,
  accent
}: {
  label: string;
  value: string;
  context?: string;
  accent?: 'indigo' | 'cyan' | 'amber' | 'emerald';
}) => {
  const accents: Record<string, string> = {
    indigo: 'linear-gradient(135deg, #6366f1, #4338ca)',
    cyan: 'linear-gradient(135deg, #06b6d4, #2563eb)',
    amber: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    emerald: 'linear-gradient(135deg, #10b981, #14b8a6)'
  };

  return (
    <article className="stat-card">
      <div className="stat-accent" style={{ backgroundImage: accents[accent ?? 'indigo'] }} />
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {context ? <p className="stat-context">{context}</p> : null}
      </div>
    </article>
  );
};

export default function Dashboard({ reports, reminders, auditTrail }: DashboardProps) {
  const totalReports = reports.length;
  const closedReports = reports.filter((report) => report.status === 'Closed').length;
  const physicalInterventions = reports.filter((report) => report.physicalInterventionUsed).length;
  const openReminders = reminders.filter((reminder) => reminder.status !== 'complete').length;

  const followUpCompletion = useMemo(() => {
    const { completed, total } = reports.reduce(
      (accumulator, report) => {
        accumulator.total += report.followUpActions.length;
        accumulator.completed += report.followUpActions.filter((action) => action.completed).length;
        return accumulator;
      },
      { completed: 0, total: 0 }
    );

    if (!total) {
      return { percent: 0, context: 'No follow-up tasks assigned' };
    }
    const percent = Math.round((completed / total) * 100);
    const context = `${completed} of ${total} tasks documented`;
    return { percent, context };
  }, [reports]);

  const incidentsBySite = useMemo(() => {
    const map = new Map<string, number>();
    reports.forEach((report) => {
      const key = report.site ?? report.location;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [reports]);

  const incidentsByDay = useMemo(() => {
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      const iso = date.toISOString().split('T')[0];
      return { iso, label: formatDate(iso), total: 0 };
    });
    const totals = new Map(days.map((day) => [day.iso, day]));

    reports.forEach((report) => {
      const iso = report.incidentDate?.split('T')[0] ?? report.createdAt.split('T')[0];
      const entry = totals.get(iso);
      if (entry) {
        entry.total += 1;
      }
    });

    return days.map((day) => ({ name: day.label, total: day.total }));
  }, [reports]);

  const upcomingReminders = useMemo(() => {
    return reminders
      .filter((reminder) => reminder.status !== 'complete')
      .slice()
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4);
  }, [reminders]);

  const latestAudit = useMemo(() => auditTrail.slice(0, 5), [auditTrail]);

  const averageRestraintDuration = useMemo(() => {
    const durations = reports
      .map((report) => report.restraintDurationMinutes)
      .filter((value): value is number => typeof value === 'number');
    if (!durations.length) {
      return 'N/A';
    }
    const average = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    return `${average.toFixed(1)} min average hold time`;
  }, [reports]);

  return (
    <div className="dashboard-grid">
      <div className="grid-two">
        <StatsCard
          label="Total BERs this month"
          value={`${totalReports}`}
          context={`${closedReports} closed, ${(totalReports - closedReports).toString()} in progress`}
          accent="indigo"
        />
        <StatsCard
          label="CPI interventions documented"
          value={`${physicalInterventions}`}
          context={averageRestraintDuration}
          accent="cyan"
        />
        <StatsCard
          label="Compliance tasks in queue"
          value={`${openReminders}`}
          context={`Follow-up documentation ${followUpCompletion.percent}% complete`}
          accent="amber"
        />
        <StatsCard
          label="Debriefs and parent contacts"
          value={`${reports.filter((report) => report.debriefCompleted).length}`}
          context={followUpCompletion.context}
          accent="emerald"
        />
      </div>

      <div className="chart-panels">
        <section className="section chart">
          <header>
            <h2>Daily incident volume</h2>
            <p className="section-subtitle">
              Monitoring 7-day activity helps ensure reporting is completed within the two-day mandate.
            </p>
          </header>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incidentsByDay}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip cursor={{ stroke: '#6366f1', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="total" stroke="#4338ca" fill="url(#colorIncidents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="section chart">
          <header>
            <h2>Top sites this week</h2>
            <p className="section-subtitle">
              Quickly identify campuses with elevated crisis activity and coordinate coaching support.
            </p>
          </header>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsBySite}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid-two">
        <section className="section">
          <h2>Upcoming compliance checkpoints</h2>
          {upcomingReminders.length === 0 ? (
            <p className="empty-state">All compliance reminders are complete. Excellent work!</p>
          ) : (
            <ul className="reminder-list">
              {upcomingReminders.map((reminder) => (
                <li key={reminder.id}>
                  <div>
                    <strong>{reminder.title}</strong>
                    <p>{reminder.description}</p>
                  </div>
                  <span className={`chip ${reminder.status}`}>
                    Due {formatDate(reminder.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section">
          <h2>Latest secure activity log</h2>
          <ul className="audit-list">
            {latestAudit.map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>{entry.actor}</strong>
                  <span className="audit-role">{entry.actorRole}</span>
                  <p>{entry.action}</p>
                </div>
                <time>{formatDate(entry.timestamp)}</time>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
