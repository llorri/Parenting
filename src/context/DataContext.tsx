import {
  createContext,
  useCallback,
  useContext,
  useMemo
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type {
  AuditEvent,
  BehaviorEmergencyReport,
  ComplianceReminder,
  ReminderStatus,
  ReportStatus,
  UserProfile,
  UserRole
} from '../types';

interface DataContextValue {
  currentUser: UserProfile | null;
  login: (profile: UserProfile) => void;
  logout: () => void;
  reports: BehaviorEmergencyReport[];
  createReport: (
    payload: Omit<
      BehaviorEmergencyReport,
      'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'status'
    > & {
      status?: ReportStatus;
    }
  ) => BehaviorEmergencyReport;
  updateReportStatus: (
    reportId: string,
    status: ReportStatus,
    options?: { reviewer?: string; note?: string }
  ) => void;
  updateFollowUpAction: (
    reportId: string,
    actionIndex: number,
    completed: boolean,
    completedOn?: string
  ) => void;
  reminders: ComplianceReminder[];
  completeReminder: (reminderId: string) => void;
  addReminder: (reminder: Omit<ComplianceReminder, 'id' | 'createdAt'>) => ComplianceReminder;
  auditTrail: AuditEvent[];
  recordAudit: (event: Omit<AuditEvent, 'id' | 'timestamp'>) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const seedReports: BehaviorEmergencyReport[] = [
  {
    id: randomId(),
    studentName: 'Alex Martinez',
    studentId: 'S-48392',
    gradeLevel: '8',
    guardianContacted: true,
    guardianContactedOn: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    guardianContactMethod: 'Phone Call',
    site: 'Sunset Middle School',
    district: 'Bay Unified',
    location: 'Classroom 204',
    incidentDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    incidentTime: '11:15',
    precipitatingFactors: 'Escalated after peer conflict during science lab.',
    incidentDescription:
      'Student became physically aggressive toward peer; staff implemented CPI-approved blocking techniques.',
    interventionsAttempted:
      'Verbal de-escalation, offer of break space, contact of on-site crisis responder.',
    physicalInterventionUsed: true,
    physicalInterventionType: 'Standing hold (CPI Level 2)',
    restraintDurationMinutes: 4,
    injuriesReported: false,
    medicalFollowUpRequired: false,
    followUpDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    followUpActions: [
      { label: 'Schedule parent/guardian debrief', completed: false },
      { label: 'Update positive behavior intervention plan', completed: false }
    ],
    behaviorSpecialistAssigned: 'Jordan Chen',
    status: 'Under Review',
    debriefCompleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdBy: 'N. Rivera',
    updatedBy: 'N. Rivera',
    reviewedBy: 'Dr. Lee'
  },
  {
    id: randomId(),
    studentName: 'Skylar Johnson',
    studentId: 'S-58302',
    gradeLevel: '10',
    guardianContacted: true,
    guardianContactedOn: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    guardianContactMethod: 'Email summary + phone follow-up',
    site: 'Pacific High School',
    district: 'Bay Unified',
    location: 'Cafeteria',
    incidentDate: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString().split('T')[0],
    incidentTime: '12:35',
    precipitatingFactors:
      'Overstimulation due to loud environment; denied request for quiet space.',
    incidentDescription:
      'Student attempted to exit campus; two-person CPI Team supported and escorted student to sensory room.',
    interventionsAttempted:
      'Sensory supports, CPI supportive stance, option to call parent, offer of counselor.',
    physicalInterventionUsed: true,
    physicalInterventionType: 'Team control position (CPI Level 3)',
    restraintDurationMinutes: 6,
    injuriesReported: false,
    medicalFollowUpRequired: false,
    followUpDueDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    followUpActions: [
      { label: 'Hold staff CPI refresher huddle', completed: true, completedOn: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
      { label: 'Complete student debrief form', completed: false }
    ],
    behaviorSpecialistAssigned: 'Amelia Patel',
    status: 'Follow-up Scheduled',
    debriefCompleted: true,
    debriefNotes: 'Student processed incident and identified sensory strategies.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    createdBy: 'A. Patel',
    updatedBy: 'A. Patel',
    reviewedBy: 'Principal Gomez'
  },
  {
    id: randomId(),
    studentName: 'Jordan Diaz',
    studentId: 'S-29401',
    gradeLevel: '5',
    guardianContacted: true,
    guardianContactedOn: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    guardianContactMethod: 'Video conference',
    site: 'Harbor Elementary',
    district: 'Bay Unified',
    location: 'Playground',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: '13:05',
    precipitatingFactors: 'Transition from preferred to non-preferred activity.',
    incidentDescription:
      'Student attempted to run toward parking lot; CPI team implemented transport position for safety.',
    interventionsAttempted:
      'Visual schedule reminder, first/then prompt, offered calming toolkit.',
    physicalInterventionUsed: true,
    physicalInterventionType: 'Transport position (CPI Level 4)',
    restraintDurationMinutes: 2,
    injuriesReported: false,
    medicalFollowUpRequired: false,
    followUpDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    followUpActions: [
      { label: 'Submit CALPADS BER summary', completed: false },
      { label: 'Schedule IEP team debrief', completed: false }
    ],
    behaviorSpecialistAssigned: 'Luis Mendoza',
    status: 'Submitted',
    debriefCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'S. Carter',
    updatedBy: 'S. Carter'
  }
];

const seedAuditTrail: AuditEvent[] = [
  {
    id: randomId(),
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    actor: 'Dr. Lee',
    actorRole: 'Administrator',
    action: 'Reviewed incident narrative for accuracy',
    target: 'Report',
    metadata: { reportId: seedReports[0].id, status: 'Under Review' },
    severity: 'info'
  },
  {
    id: randomId(),
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    actor: 'Principal Gomez',
    actorRole: 'School Site Leader',
    action: 'Scheduled follow-up debrief with student support team',
    target: 'Report',
    metadata: { reportId: seedReports[1].id, dueDate: seedReports[1].followUpDueDate ?? '' },
    severity: 'info'
  }
];

const seedReminders: ComplianceReminder[] = [
  {
    id: randomId(),
    title: 'Submit BER to District Office',
    description: 'California Ed Code requires BER submission within 2 school days.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    status: 'pending',
    relatedReportId: seedReports[2].id,
    ownerRole: 'Program Specialist',
    createdAt: new Date().toISOString()
  },
  {
    id: randomId(),
    title: 'Parent/Guardian debrief pending',
    description: 'Ensure CPI debrief conversation is documented and signed.',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'pending',
    relatedReportId: seedReports[1].id,
    ownerRole: 'School Site Leader',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useLocalStorage<BehaviorEmergencyReport[]>(
    'ber-guardian::reports',
    seedReports
  );
  const [auditTrail, setAuditTrail] = useLocalStorage<AuditEvent[]>(
    'ber-guardian::audit',
    seedAuditTrail
  );
  const [reminders, setReminders] = useLocalStorage<ComplianceReminder[]>(
    'ber-guardian::reminders',
    seedReminders
  );
  const [currentUser, setCurrentUser] = useLocalStorage<UserProfile | null>(
    'ber-guardian::user',
    null
  );

  const recordAudit = useCallback(
    (event: Omit<AuditEvent, 'id' | 'timestamp'>) => {
      setAuditTrail((previous) => [
        {
          ...event,
          id: randomId(),
          timestamp: new Date().toISOString()
        },
        ...previous
      ]);
    },
    [setAuditTrail]
  );

  const login = useCallback(
    (profile: UserProfile) => {
      setCurrentUser(profile);
      recordAudit({
        actor: profile.name,
        actorRole: profile.role,
        action: 'Authenticated to BER Guardian portal',
        target: 'Session',
        severity: 'info'
      });
    },
    [recordAudit, setCurrentUser]
  );

  const logout = useCallback(() => {
    if (currentUser) {
      recordAudit({
        actor: currentUser.name,
        actorRole: currentUser.role,
        action: 'Ended BER Guardian session',
        target: 'Session',
        severity: 'info'
      });
    }
    setCurrentUser(null);
  }, [currentUser, recordAudit, setCurrentUser]);

  const createReport: DataContextValue['createReport'] = useCallback(
    (payload) => {
      const now = new Date().toISOString();
      const actor = currentUser?.name ?? 'System';
      const actorRole = currentUser?.role ?? 'Administrator';
      const newReport: BehaviorEmergencyReport = {
        ...payload,
        followUpActions: payload.followUpActions ?? [],
        id: randomId(),
        status: payload.status ?? 'Submitted',
        createdAt: now,
        updatedAt: now,
        createdBy: actor,
        updatedBy: actor,
        reviewedBy: payload.reviewedBy
      };

      setReports((previous) => [newReport, ...previous]);

      recordAudit({
        actor,
        actorRole,
        action: `Created BER for ${payload.studentName}`,
        target: 'Report',
        severity: 'info',
        metadata: { reportId: newReport.id, status: newReport.status }
      });

      if (payload.followUpDueDate) {
        const reminder = {
          id: randomId(),
          title: `Follow-up due for ${payload.studentName}`,
          description: 'Document follow-up actions and close the report within mandated window.',
          dueDate: payload.followUpDueDate,
          status: 'pending' as ReminderStatus,
          relatedReportId: newReport.id,
          ownerRole: 'Program Specialist' as UserRole,
          createdAt: now
        };

        setReminders((previous) => [reminder, ...previous]);
      }

      return newReport;
    },
    [currentUser, recordAudit, setReminders, setReports]
  );

  const updateReportStatus = useCallback<DataContextValue['updateReportStatus']>(
    (reportId, status, options) => {
      setReports((previous) =>
        previous.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status,
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser?.name ?? report.updatedBy,
                reviewedBy: options?.reviewer ?? report.reviewedBy,
                debriefNotes:
                  options?.note !== undefined && options?.note !== ''
                    ? options.note
                    : report.debriefNotes
              }
            : report
        )
      );

      if (currentUser) {
        recordAudit({
          actor: currentUser.name,
          actorRole: currentUser.role,
          action: `Updated report status to ${status}`,
          target: 'Report',
          severity: status === 'Closed' ? 'info' : 'warning',
          metadata: { reportId, status }
        });
      }
    },
    [currentUser, recordAudit, setReports]
  );

  const updateFollowUpAction = useCallback<DataContextValue['updateFollowUpAction']>(
    (reportId, actionIndex, completed, completedOn) => {
      setReports((previous) =>
        previous.map((report) => {
          if (report.id !== reportId) {
            return report;
          }

          const actions = report.followUpActions.map((action, index) =>
            index === actionIndex
              ? {
                  ...action,
                  completed,
                  completedOn: completed ? completedOn ?? new Date().toISOString() : undefined
                }
              : action
          );

          return {
            ...report,
            followUpActions: actions,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser?.name ?? report.updatedBy
          };
        })
      );

      if (currentUser) {
        recordAudit({
          actor: currentUser.name,
          actorRole: currentUser.role,
          action: `${completed ? 'Completed' : 'Reopened'} follow-up task`,
          target: 'Follow-up',
          severity: completed ? 'info' : 'warning',
          metadata: { reportId, index: actionIndex }
        });
      }
    },
    [currentUser, recordAudit, setReports]
  );

  const addReminder = useCallback<DataContextValue['addReminder']>(
    (reminder) => {
      const reminderToStore: ComplianceReminder = {
        ...reminder,
        id: randomId(),
        createdAt: new Date().toISOString()
      };
      setReminders((previous) => [reminderToStore, ...previous]);

      if (currentUser) {
        recordAudit({
          actor: currentUser.name,
          actorRole: currentUser.role,
          action: `Created compliance reminder: ${reminder.title}`,
          target: 'Reminder',
          severity: 'info',
          metadata: { dueDate: reminder.dueDate }
        });
      }

      return reminderToStore;
    },
    [currentUser, recordAudit, setReminders]
  );

  const completeReminder = useCallback<DataContextValue['completeReminder']>(
    (reminderId) => {
      setReminders((previous) =>
        previous.map((reminder) =>
          reminder.id === reminderId ? { ...reminder, status: 'complete' } : reminder
        )
      );

      if (currentUser) {
        recordAudit({
          actor: currentUser.name,
          actorRole: currentUser.role,
          action: 'Closed a compliance reminder',
          target: 'Reminder',
          severity: 'info',
          metadata: { reminderId }
        });
      }
    },
    [currentUser, recordAudit, setReminders]
  );

  const normalizedReminders = useMemo(() => {
    const now = Date.now();
    return reminders.map((reminder) => {
      if (reminder.status === 'complete') {
        return reminder;
      }

      const dueDate = new Date(reminder.dueDate).getTime();
      const status: ReminderStatus = dueDate < now ? 'overdue' : 'pending';
      return status === reminder.status ? reminder : { ...reminder, status };
    });
  }, [reminders]);

  const value = useMemo<DataContextValue>(
    () => ({
      currentUser,
      login,
      logout,
      reports,
      createReport,
      updateReportStatus,
      updateFollowUpAction,
      reminders: normalizedReminders,
      completeReminder,
      addReminder,
      auditTrail,
      recordAudit
    }),
    [
      currentUser,
      login,
      logout,
      reports,
      createReport,
      updateReportStatus,
      updateFollowUpAction,
      normalizedReminders,
      completeReminder,
      addReminder,
      auditTrail,
      recordAudit
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
