export type UserRole =
  | 'Administrator'
  | 'Program Specialist'
  | 'School Site Leader'
  | 'Behavior Analyst'
  | 'Crisis Responder';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  site?: string;
}

export type ReportStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Follow-up Scheduled'
  | 'Closed';

export interface FollowUpAction {
  label: string;
  completed: boolean;
  completedOn?: string;
}

export interface BehaviorEmergencyReport {
  id: string;
  studentName: string;
  studentId: string;
  gradeLevel: string;
  guardianContacted: boolean;
  guardianContactedOn?: string;
  guardianContactMethod?: string;
  site: string;
  district: string;
  location: string;
  incidentDate: string;
  incidentTime: string;
  precipitatingFactors: string;
  incidentDescription: string;
  interventionsAttempted: string;
  physicalInterventionUsed: boolean;
  physicalInterventionType?: string;
  restraintDurationMinutes?: number;
  injuriesReported: boolean;
  medicalFollowUpRequired: boolean;
  followUpDueDate?: string;
  followUpActions: FollowUpAction[];
  behaviorSpecialistAssigned?: string;
  status: ReportStatus;
  debriefCompleted: boolean;
  debriefNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  reviewedBy?: string;
}

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  target: string;
  metadata?: Record<string, string | number | boolean | undefined>;
  severity: AuditSeverity;
}

export type ReminderStatus = 'pending' | 'complete' | 'overdue';

export interface ComplianceReminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: ReminderStatus;
  relatedReportId?: string;
  ownerRole: UserRole;
  createdAt: string;
}

export interface DashboardInsight {
  id: string;
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  context?: string;
}
