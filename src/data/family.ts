import type { FamilyMember, MessageItem, DoctorSurvey, HealthSummary } from '@/types/family';

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    name: '李奶奶',
    avatar: 'https://picsum.photos/id/64/200/200',
    relation: '母亲',
    role: 'patient',
    lastActive: '10分钟前',
    glucoseStatus: 'normal',
    latestGlucose: 6.5,
    latestGlucoseTime: '今天 08:30',
  },
  {
    id: '2',
    name: '王医生',
    avatar: 'https://picsum.photos/id/177/200/200',
    relation: '主治医生',
    role: 'doctor',
    lastActive: '2小时前',
  },
  {
    id: '3',
    name: '张阿姨',
    avatar: 'https://picsum.photos/id/338/200/200',
    relation: '妹妹',
    role: 'family',
    lastActive: '昨天',
  },
];

export const mockMessages: MessageItem[] = [
  {
    id: '1',
    senderId: '2',
    senderName: '王医生',
    senderAvatar: 'https://picsum.photos/id/177/200/200',
    content: '李奶奶最近血糖控制得不错，继续保持饮食规律哦',
    time: '今天 09:30',
    isEmergency: false,
  },
  {
    id: '2',
    senderId: '3',
    senderName: '张阿姨',
    senderAvatar: 'https://picsum.photos/id/338/200/200',
    content: '妈，晚上我过来吃饭，给你带了点粗粮',
    time: '今天 10:15',
    isEmergency: false,
  },
  {
    id: '3',
    senderId: '2',
    senderName: '王医生',
    senderAvatar: 'https://picsum.photos/id/177/200/200',
    content: '请记得填写本周围的健康问卷，有助于调整治疗方案',
    time: '昨天 14:00',
    isEmergency: false,
  },
];

export const mockSurveys: DoctorSurvey[] = [
  {
    id: '1',
    title: '每周健康问卷',
    doctorName: '王医生',
    dueDate: '2024-01-21',
    status: 'pending',
    questionsCount: 10,
  },
  {
    id: '2',
    title: '月度评估问卷',
    doctorName: '王医生',
    dueDate: '2024-02-01',
    status: 'pending',
    questionsCount: 20,
  },
  {
    id: '3',
    title: '饮食专项问卷',
    doctorName: '王医生',
    dueDate: '2024-01-10',
    status: 'completed',
    questionsCount: 15,
  },
];

export const mockHealthSummary: HealthSummary = {
  avgGlucose: 6.7,
  glucoseStatus: 'normal',
  highCount: 3,
  lowCount: 1,
  avgWeight: 67.5,
  exerciseCount: 5,
  medicineCompliance: 95,
  period: '近7天',
};

export const statusLabels: Record<string, { label: string; color: string }> = {
  normal: { label: '正常', color: '#10B981' },
  warning: { label: '需关注', color: '#F59E0B' },
  danger: { label: '异常', color: '#EF4444' },
  pending: { label: '待完成', color: '#F59E0B' },
  completed: { label: '已完成', color: '#10B981' },
  expired: { label: '已过期', color: '#9CA3AF' },
};
