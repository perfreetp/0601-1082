export interface GlucoseRecord {
  id: string;
  value: number;
  time: string;
  date: string;
  type: 'before_meal' | 'after_meal' | 'before_sleep' | 'morning' | 'random';
  typeLabel: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  status: 'low' | 'normal' | 'high' | 'danger';
  note?: string;
}

export interface ExerciseRecord {
  id: string;
  name: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  time: string;
  calories: number;
}

export interface MedicineRecord {
  id: string;
  name: string;
  dosage: string;
  time: string;
  type: 'insulin' | 'oral' | 'other';
}

export interface WeightRecord {
  id: string;
  weight: number;
  date: string;
}

export interface SleepRecord {
  id: string;
  date: string;
  duration: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface GlucoseTrendData {
  date: string;
  avgValue: number;
  maxValue: number;
  minValue: number;
  recordsCount: number;
}
