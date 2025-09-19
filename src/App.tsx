import { useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import ReportsTable from './components/ReportsTable';
import ReportForm from './components/ReportForm';
import ComplianceCenter from './components/ComplianceCenter';
import AuditTrail from './components/AuditTrail';
import ReportDetailsPanel from './components/ReportDetailsPanel';
import LoginPortal from './components/LoginPortal';
import { DataProvider, useData } from './context/DataContext';
import type { BehaviorEmergencyReport } from './types';
import './App.css';

type ViewKey = 'dashboard' | 'reports' | 'create' | 'compliance' | 'audit';

const viewCopy: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Executive summary',
    subtitle: 'Track FERPA-compliant BER activity and response fidelity at a glance.'
  },
  reports: {
    title: 'Behavior Emergency Reports',
    subtitle: 'Review, filter, and update CPI-aligned BER documentation.'
  },
  create: {
    title: 'Create new BER',
    subtitle: 'Capture a legally compliant behavior emergency report in minutes.'
  },
  compliance: {
    title: 'Compliance center',
    subtitle: 'Automate follow-up reminders and document mandated next steps.'
  },
  audit: {
    title: 'Audit history',
    subtitle: 'Full visibility into secure BER access and edits.'
  }
};

const navItems: { key: ViewKey; label: string; emoji: string }[] = [
  { key: 'dashboard', label: 'Dashboard', emoji: '📊' },
  { key: 'reports', label: 'Reports', emoji: '📁' },
  { key: 'create', label: 'New BER', emoji: '📝' },
  { key: 'compliance', label: 'Compliance', emoji: '⏰' },
  { key: 'audit', label: 'Audit Log', emoji: '🛡️' }
];

function AppContent() {
  const { currentUser, logout, reports, reminders, auditTrail } = useData();
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [selectedReport, setSelectedReport] = useState<BehaviorEmergencyReport | null>(null);

  useEffect(() => {
    if (activeView !== 'reports') {
      setSelectedReport(null);
    }
  }, [activeView]);

  const initials = useMemo(() => {
    if (!currentUser) {
      return '';
    }
    return currentUser.name
      .split(' ')
      .map((segment) => segment.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [currentUser]);

  if (!currentUser) {
    return <LoginPortal />;
  }

  const { title, subtitle } = viewCopy[activeView];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>BER Guardian</h1>
          <span>California-aligned Behavior Emergency Reporting</span>
        </div>
        <div className="nav-section">
          <h2>Workspace</h2>
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activeView === item.key ? 'active' : ''}`}
              onClick={() => setActiveView(item.key)}
            >
              <span aria-hidden>{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="nav-section">
          <h2>Resource</h2>
          <p>
            CPI® training resources and Ed Code timelines are built into workflows so staff stay
            aligned and compliant.
          </p>
        </div>
      </aside>
      <main className="main-content">
        <div className="top-bar">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="user-card">
            <div className="user-avatar" aria-hidden>
              {initials || 'BG'}
            </div>
            <div>
              <strong>{currentUser.name}</strong>
              <p>{currentUser.role}</p>
            </div>
            <button type="button" className="logout-button" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>

        <div className="view-area">
          {activeView === 'dashboard' ? (
            <section className="section">
              <Dashboard reports={reports} reminders={reminders} auditTrail={auditTrail} />
            </section>
          ) : null}

          {activeView === 'reports' ? (
            <div className="grid-two">
              <section className="section">
                <ReportsTable
                  selectedReportId={selectedReport?.id}
                  onSelectReport={(report) => setSelectedReport(report)}
                />
              </section>
              {selectedReport ? (
                <ReportDetailsPanel report={selectedReport} onClose={() => setSelectedReport(null)} />
              ) : null}
            </div>
          ) : null}

          {activeView === 'create' ? (
            <section className="section">
              <ReportForm
                onCreated={(report) => {
                  setSelectedReport(report);
                  setActiveView('reports');
                }}
              />
            </section>
          ) : null}

          {activeView === 'compliance' ? (
            <section className="section">
              <ComplianceCenter />
            </section>
          ) : null}

          {activeView === 'audit' ? (
            <AuditTrail />
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
