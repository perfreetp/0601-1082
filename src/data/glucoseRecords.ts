import type { GlucoseRecord, ExerciseRecord, MedicineRecord, WeightRecord, SleepRecord, GlucoseTrendData } from '@/types/glucose';

const generateTime = (hour: number, minute: number) => {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
};

const getGlucoseStatus = (value: number): 'low' | 'normal' | 'high' | 'danger' => {
  if (value < 3.9) return 'low';
  if (value < 7.8) return 'normal';
  if (value < 11.1) return 'high';
  return 'danger';
};

export const mockTodayGlucose: GlucoseRecord[] = [
  {
    id: '1',
    value: 5.6,
    time: generateTime(7, 0),
    date: '2024-01-15',
    type: 'morning',
    typeLabel: '空腹',
    status: 'normal',
  },
  {
    id: '2',
    value: 8.2,
    time: generateTime(9, 30),
    date: '2024-01-15',
    type: 'after_meal',
    typeLabel: '早餐后2h',
    mealType: 'breakfast',
    status: 'high',
  },
  {
    id: '3',
    value: 6.1,
    time: generateTime(12, 0),
    date: '2024-01-15',
    type: 'before_meal',
    typeLabel: '午餐前',
    mealType: 'lunch',
    status: 'normal',
  },
  {
    id: '4',
    value: 7.5,
    time: generateTime(14, 0),
    date: '2024-01-15',
    type: 'after_meal',
    typeLabel: '午餐后2h',
    mealType: 'lunch',
    status: 'normal',
  },
];

export const mockExercises: ExerciseRecord[] = [
  {
    id: '1',
    name: '快走',
    duration: 30,
    intensity: 'low',
    time: '07:30',
    calories: 120,
  },
  {
    id: '2',
    name: '太极拳',
    duration: 45,
    intensity: 'medium',
    time: '18:00',
    calories: 180,
  },
];

export const mockMedicines: MedicineRecord[] = [
  {
    id: '1',
    name: '二甲双胍',
    dosage: '0.5g',
    time: '08:00',
    type: 'oral',
  },
  {
    id: '2',
    name: '甘精胰岛素',
    dosage: '10单位',
    time: '22:00',
    type: 'insulin',
  },
];

export const mockWeightHistory: WeightRecord[] = [
  { id: '1', weight: 68.5, date: '01-08' },
  { id: '2', weight: 68.2, date: '01-09' },
  { id: '3', weight: 68.0, date: '01-10' },
  { id: '4', weight: 67.8, date: '01-11' },
  { id: '5', weight: 67.5, date: '01-12' },
  { id: '6', weight: 67.6, date: '01-13' },
  { id: '7', weight: 67.3, date: '01-14' },
];

export const mockSleepHistory: SleepRecord[] = [
  { id: '1', date: '01-08', duration: 7.5, quality: 'good' },
  { id: '2', date: '01-09', duration: 6.5, quality: 'fair' },
  { id: '3', date: '01-10', duration: 8, quality: 'excellent' },
  { id: '4', date: '01-11', duration: 5.5, quality: 'poor' },
  { id: '5', date: '01-12', duration: 7, quality: 'good' },
  { id: '6', date: '01-13', duration: 7.5, quality: 'good' },
  { id: '7', date: '01-14', duration: 8, quality: 'excellent' },
];

export const mockGlucoseTrend: GlucoseTrendData[] = [
  { date: '周一', avgValue: 6.5, maxValue: 8.5, minValue: 4.8, recordsCount: 4 },
  { date: '周二', avgValue: 6.8, maxValue: 9.2, minValue: 4.5, recordsCount: 5 },
  { date: '周三', avgValue: 6.2, maxValue: 7.8, minValue: 5.0, recordsCount: 4 },
  { date: '周四', avgValue: 7.0, maxValue: 10.1, minValue: 4.2, recordsCount: 6 },
  { date: '周五', avgValue: 6.6, maxValue: 8.9, minValue: 4.6, recordsCount: 5 },
  { date: '周六', avgValue: 6.4, maxValue: 8.2, minValue: 4.9, recordsCount: 4 },
  { date: '周日', avgValue: 6.7, maxValue: 8.8, minValue: 4.7, recordsCount: 5 },
];

export const glucoseTypes = [
  { key: 'morning', label: '空腹', icon: '🌅' },
  { key: 'before_meal', label: '餐前', icon: '🍽️' },
  { key: 'after_meal', label: '餐后2h', icon: '⏰' },
  { key: 'before_sleep', label: '睡前', icon: '🌙' },
  { key: 'random', label: '随机', icon: '📊' },
];

export const intensityLabels: Record<string, { label: string; color: string }> = {
  low: { label: '低强度', color: '#10B981' },
  medium: { label: '中强度', color: '#F59E0B' },
  high: { label: '高强度', color: '#EF4444' },
};

export { getGlucoseStatus };
