export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  relation: string;
  role: 'patient' | 'family' | 'doctor';
  lastActive: string;
  glucoseStatus?: 'normal' | 'warning' | 'danger';
  latestGlucose?: number;
  latestGlucoseTime?: string;
}

export interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  isEmergency: boolean;
}

export interface DoctorSurvey {
  id: string;
  title: string;
  doctorName: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'expired';
  questionsCount: number;
}

export interface HealthSummary {
  avgGlucose: number;
  glucoseStatus: 'normal' | 'warning' | 'danger';
  highCount: number;
  lowCount: number;
  avgWeight: number;
  exerciseCount: number;
  medicineCompliance: number;
  period: string;
}
