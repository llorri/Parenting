import { ChangeEvent, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import type { BehaviorEmergencyReport, ReportStatus } from '../types';

interface ReportsTableProps {
  onSelectReport?: (report: BehaviorEmergencyReport) => void;
  selectedReportId?: string | null;
}

const statusOptions: ReportStatus[] = [
  'Draft',
  'Submitted',
  'Under Review',
  'Follow-up Scheduled',
  'Closed'
];

const statusColors: Record<ReportStatus, string> = {
  Draft: 'badge-neutral',
  Submitted: 'badge-info',
  'Under Review': 'badge-warning',
  'Follow-up Scheduled': 'badge-accent',
  Closed: 'badge-success'
};

export default function ReportsTable({ onSelectReport, selectedReportId }: ReportsTableProps) {
  const { reports, updateReportStatus } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'All'>('All');
  const [siteFilter, setSiteFilter] = useState<string>('All');
  const [physicalOnly, setPhysicalOnly] = useState(false);

  const sites = useMemo(() => Array.from(new Set(reports.map((report) => report.site))), [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (statusFilter !== 'All' && report.status !== statusFilter) {
        return false;
      }
      if (siteFilter !== 'All' && report.site !== siteFilter) {
        return false;
      }
      if (physicalOnly && !report.physicalInterventionUsed) {
        return false;
      }
      const haystack = `${report.studentName} ${report.site} ${report.incidentDescription}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [reports, search, siteFilter, statusFilter, physicalOnly]);

  const handleStatusChange = (
    event: ChangeEvent<HTMLSelectElement>,
    report: BehaviorEmergencyReport
  ) => {
    updateReportStatus(report.id, event.target.value as ReportStatus);
  };

  return (
    <div className="reports-table">
      <div className="table-toolbar">
        <div className="filters">
          <input
            placeholder="Search students, sites, or keywords"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ReportStatus | 'All')}>
            <option value="All">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)}>
            <option value="All">All sites</option>
            {sites.map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          </select>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={physicalOnly}
              onChange={(event) => setPhysicalOnly(event.target.checked)}
            />
            CPI physical intervention used
          </label>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Date</th>
              <th>Site / Location</th>
              <th>Status</th>
              <th>Follow-up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => {
              const followUpsComplete = report.followUpActions.filter((action) => action.completed).length;
              const followUpTotal = report.followUpActions.length;
              const isSelected = selectedReportId === report.id;
              return (
                <tr
                  key={report.id}
                  className={isSelected ? 'selected' : undefined}
                  onClick={() => onSelectReport?.(report)}
                >
                  <td>
                    <div className="cell-primary">
                      <strong>{report.studentName}</strong>
                      <span className="cell-sub">Created {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>{new Date(report.incidentDate).toLocaleDateString()}</td>
                  <td>
                    <div className="cell-primary">
                      <span>{report.site}</span>
                      <span className="cell-sub">{report.location}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${statusColors[report.status]}`}>{report.status}</span>
                  </td>
                  <td>
                    {followUpTotal > 0 ? (
                      <span className="pill-neutral">
                        {followUpsComplete}/{followUpTotal} tasks complete
                      </span>
                    ) : (
                      <span className="pill-neutral">No tasks</span>
                    )}
                  </td>
                  <td>
                    <select
                      value={report.status}
                      onChange={(event) => handleStatusChange(event, report)}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredReports.length === 0 ? (
          <div className="empty-state">No reports match this view. Try adjusting filters.</div>
        ) : null}
      </div>
    </div>
  );
}
