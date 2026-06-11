import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { FoodItem, ShoppingItem } from '@/types/food';
import type { GlucoseRecord } from '@/types/glucose';
import type { DoctorSurvey } from '@/types/family';
import {
  mockFoodDatabase,
  mockShoppingList,
  mealTypes,
  cookingMethods,
} from '@/data/foods';
import {
  mockTodayGlucose,
  getGlucoseStatus,
} from '@/data/glucoseRecords';
import { mockSurveys } from '@/data/family';

const STORE_KEY = 'sugarai_store';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = Taro.getStorageSync(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (e) {
    console.error('[Store] 读取存储失败', e);
  }
  return fallback;
}

function saveToStorage(key: string, data: unknown) {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.error('[Store] 写入存储失败', e);
  }
}

export interface WeeklyMenuDay {
  breakfast: { name: string; image: string }[];
  lunch: { name: string; image: string }[];
  dinner: { name: string; image: string }[];
  snack: { name: string; image: string }[];
}

function buildDefaultWeeklyMenu(): WeeklyMenuDay[] {
  const base: WeeklyMenuDay = {
    breakfast: [
      { name: '全麦面包', image: mockFoodDatabase[6].imageUrl },
      { name: '牛奶', image: mockFoodDatabase[8].imageUrl },
      { name: '鸡蛋', image: mockFoodDatabase[3].imageUrl },
    ],
    lunch: [
      { name: '糙米饭', image: mockFoodDatabase[0].imageUrl },
      { name: '清蒸鱼', image: mockFoodDatabase[5].imageUrl },
      { name: '西兰花', image: mockFoodDatabase[2].imageUrl },
    ],
    dinner: [
      { name: '燕麦粥', image: mockFoodDatabase[4].imageUrl },
      { name: '鸡胸肉', image: mockFoodDatabase[1].imageUrl },
      { name: '炒青菜', image: mockFoodDatabase[9].imageUrl },
    ],
    snack: [
      { name: '苹果', image: mockFoodDatabase[7].imageUrl },
    ],
  };

  const variations: WeeklyMenuDay[] = [
    {
      ...base,
      breakfast: [
        { name: '燕麦粥', image: mockFoodDatabase[4].imageUrl },
        { name: '牛奶', image: mockFoodDatabase[8].imageUrl },
        { name: '全麦面包', image: mockFoodDatabase[6].imageUrl },
      ],
    },
    {
      ...base,
      lunch: [
        { name: '白米饭', image: mockFoodDatabase[0].imageUrl },
        { name: '鸡胸肉', image: mockFoodDatabase[1].imageUrl },
        { name: '炒青菜', image: mockFoodDatabase[9].imageUrl },
      ],
    },
    {
      ...base,
      dinner: [
        { name: '糙米饭', image: mockFoodDatabase[0].imageUrl },
        { name: '西红柿炒蛋', image: mockFoodDatabase[3].imageUrl },
        { name: '西兰花', image: mockFoodDatabase[2].imageUrl },
      ],
    },
    {
      ...base,
      breakfast: [
        { name: '牛奶', image: mockFoodDatabase[8].imageUrl },
        { name: '鸡蛋', image: mockFoodDatabase[3].imageUrl },
        { name: '全麦面包', image: mockFoodDatabase[6].imageUrl },
      ],
      snack: [{ name: '坚果', image: mockFoodDatabase[6].imageUrl }],
    },
    {
      ...base,
      lunch: [
        { name: '糙米饭', image: mockFoodDatabase[0].imageUrl },
        { name: '清蒸鱼', image: mockFoodDatabase[5].imageUrl },
        { name: '西红柿炒蛋', image: mockFoodDatabase[3].imageUrl },
      ],
    },
    {
      ...base,
      dinner: [
        { name: '燕麦粥', image: mockFoodDatabase[4].imageUrl },
        { name: '清蒸鱼', image: mockFoodDatabase[5].imageUrl },
        { name: '炒青菜', image: mockFoodDatabase[9].imageUrl },
      ],
      snack: [
        { name: '苹果', image: mockFoodDatabase[7].imageUrl },
        { name: '牛奶', image: mockFoodDatabase[8].imageUrl },
      ],
    },
    {
      ...base,
      breakfast: [
        { name: '燕麦粥', image: mockFoodDatabase[4].imageUrl },
        { name: '鸡蛋', image: mockFoodDatabase[3].imageUrl },
        { name: '全麦面包', image: mockFoodDatabase[6].imageUrl },
      ],
      dinner: [
        { name: '白米饭', image: mockFoodDatabase[0].imageUrl },
        { name: '鸡胸肉', image: mockFoodDatabase[1].imageUrl },
        { name: '西兰花', image: mockFoodDatabase[2].imageUrl },
      ],
    },
  ];
  return variations;
}

function buildDefaultMealFoods(): Record<string, FoodItem[]> {
  return {
    breakfast: [
      { ...mockFoodDatabase[6], portion: 2, carbs: 41, calories: 247 },
      { ...mockFoodDatabase[8], portion: 250, carbs: 12, calories: 103 },
    ],
    lunch: [
      { ...mockFoodDatabase[0], portion: 150, carbs: 42, calories: 195 },
      { ...mockFoodDatabase[1], portion: 120, carbs: 0, calories: 198 },
      { ...mockFoodDatabase[2], portion: 100, carbs: 7, calories: 34 },
      { ...mockFoodDatabase[3], portion: 150, carbs: 7.5, calories: 180 },
    ],
    dinner: [
      { ...mockFoodDatabase[4], portion: 200, carbs: 27, calories: 150 },
      { ...mockFoodDatabase[5], portion: 120, carbs: 0, calories: 132 },
      { ...mockFoodDatabase[9], portion: 150, carbs: 6, calories: 75 },
    ],
    snack: [
      { ...mockFoodDatabase[7], portion: 1, carbs: 14, calories: 52 },
    ],
  };
}

export interface SurveyAnswer {
  surveyId: string;
  answers: Record<number, string>;
  completedAt: string;
}

export interface HealthReport {
  id: string;
  generatedAt: string;
  period: string;
  avgGlucose: number;
  highCount: number;
  lowCount: number;
  avgWeight: number;
  exerciseCount: number;
  medicineCompliance: number;
  summary: string;
}

interface AppState {
  mealFoods: Record<string, FoodItem[]>;
  currentMealType: string;
  glucoseRecords: GlucoseRecord[];
  shoppingItems: ShoppingItem[];
  weeklyMenu: WeeklyMenuDay[];
  surveys: DoctorSurvey[];
  surveyAnswers: SurveyAnswer[];
  healthReports: HealthReport[];

  addFoodsToMeal: (mealType: string, foods: FoodItem[]) => void;
  setCurrentMealType: (mealType: string) => void;
  setMealFoods: (mealType: string, foods: FoodItem[]) => void;
  addGlucoseRecord: (record: GlucoseRecord) => void;
  toggleShoppingItem: (id: string) => void;
  completeSurvey: (surveyId: string, answers: Record<number, string>) => void;
  addHealthReport: (report: HealthReport) => void;
  hydrate: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  mealFoods: buildDefaultMealFoods(),
  currentMealType: 'lunch',
  glucoseRecords: [...mockTodayGlucose],
  shoppingItems: [...mockShoppingList],
  weeklyMenu: buildDefaultWeeklyMenu(),
  surveys: [...mockSurveys],
  surveyAnswers: [],
  healthReports: [],

  addFoodsToMeal: (mealType, foods) => {
    set((state) => {
      const existing = state.mealFoods[mealType] || [];
      const updated = { ...state.mealFoods, [mealType]: [...existing, ...foods] };
      saveToStorage(STORE_KEY, { ...get(), mealFoods: updated, currentMealType: mealType });
      return { mealFoods: updated, currentMealType: mealType };
    });
  },

  setCurrentMealType: (mealType) => {
    set((state) => {
      saveToStorage(STORE_KEY, { ...get(), currentMealType: mealType });
      return { currentMealType: mealType };
    });
  },

  setMealFoods: (mealType, foods) => {
    set((state) => {
      const updated = { ...state.mealFoods, [mealType]: foods };
      saveToStorage(STORE_KEY, { ...get(), mealFoods: updated });
      return { mealFoods: updated };
    });
  },

  addGlucoseRecord: (record) => {
    set((state) => {
      const updated = [...state.glucoseRecords, record];
      saveToStorage(STORE_KEY, { ...get(), glucoseRecords: updated });
      return { glucoseRecords: updated };
    });
  },

  toggleShoppingItem: (id) => {
    set((state) => {
      const updated = state.shoppingItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      saveToStorage(STORE_KEY, { ...get(), shoppingItems: updated });
      return { shoppingItems: updated };
    });
  },

  completeSurvey: (surveyId, answers) => {
    set((state) => {
      const updatedSurveys = state.surveys.map((s) =>
        s.id === surveyId ? { ...s, status: 'completed' as const } : s
      );
      const newAnswer: SurveyAnswer = {
        surveyId,
        answers,
        completedAt: new Date().toLocaleString('zh-CN'),
      };
      const updatedAnswers = [...state.surveyAnswers, newAnswer];
      saveToStorage(STORE_KEY, {
        ...get(),
        surveys: updatedSurveys,
        surveyAnswers: updatedAnswers,
      });
      return { surveys: updatedSurveys, surveyAnswers: updatedAnswers };
    });
  },

  addHealthReport: (report) => {
    set((state) => {
      const updated = [report, ...state.healthReports];
      saveToStorage(STORE_KEY, { ...get(), healthReports: updated });
      return { healthReports: updated };
    });
  },

  hydrate: () => {
    try {
      const saved = loadFromStorage<AppState>(STORE_KEY, null as any);
      if (saved) {
        set({
          mealFoods: saved.mealFoods || buildDefaultMealFoods(),
          currentMealType: saved.currentMealType || 'lunch',
          glucoseRecords: saved.glucoseRecords || [...mockTodayGlucose],
          shoppingItems: saved.shoppingItems || [...mockShoppingList],
          weeklyMenu: saved.weeklyMenu || buildDefaultWeeklyMenu(),
          surveys: saved.surveys || [...mockSurveys],
          surveyAnswers: saved.surveyAnswers || [],
          healthReports: saved.healthReports || [],
        });
        console.log('[Store] 从本地存储恢复数据成功');
      }
    } catch (e) {
      console.error('[Store] 恢复数据失败', e);
    }
  },
}));
