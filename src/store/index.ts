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

function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  abnormalGlucoseList?: {
    date: string;
    time: string;
    value: number;
    type: string;
    mealType?: string;
    status: string;
  }[];
  highCarbMeals?: {
    date: string;
    mealType: string;
    mealLabel: string;
    totalCarbs: number;
    foodCount: number;
  }[];
  doctorAdvice?: string[];
}

interface AppState {
  mealRecords: Record<string, Record<string, FoodItem[]>>;
  currentDate: string;
  currentMealType: string;
  glucoseRecords: GlucoseRecord[];
  shoppingItems: ShoppingItem[];
  weeklyMenu: WeeklyMenuDay[];
  surveys: DoctorSurvey[];
  surveyAnswers: SurveyAnswer[];
  healthReports: HealthReport[];

  addFoodsToMeal: (mealType: string, foods: FoodItem[], date?: string) => void;
  setMealFoods: (mealType: string, foods: FoodItem[], date?: string) => void;
  setCurrentMealType: (mealType: string) => void;
  setCurrentDate: (date: string) => void;
  getMealCarbs: (mealType: string, date?: string) => number;
  getDateMealSummary: (date: string) => { totalCarbs: number; totalCalories: number; mealCount: number };

  addGlucoseRecord: (record: GlucoseRecord) => void;
  toggleShoppingItem: (id: string) => void;
  replaceWeeklyMenuFood: (dayIndex: number, mealType: string, foodIndex: number, newFood: { name: string; image: string }) => void;
  completeSurvey: (surveyId: string, answers: Record<number, string>) => void;
  addHealthReport: (report: HealthReport) => void;
  hydrate: () => void;
}

function initMealRecords(): Record<string, Record<string, FoodItem[]>> {
  const today = getTodayStr();
  return {
    [today]: buildDefaultMealFoods(),
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  mealRecords: initMealRecords(),
  currentDate: getTodayStr(),
  currentMealType: 'lunch',
  glucoseRecords: [...mockTodayGlucose],
  shoppingItems: [...mockShoppingList],
  weeklyMenu: buildDefaultWeeklyMenu(),
  surveys: [...mockSurveys],
  surveyAnswers: [],
  healthReports: [],

  addFoodsToMeal: (mealType, foods, date) => {
    const targetDate = date || get().currentDate;
    set((state) => {
      const dateRecord = state.mealRecords[targetDate] || {};
      const existing = dateRecord[mealType] || [];
      const updatedDateRecord = { ...dateRecord, [mealType]: [...existing, ...foods] };
      const updatedRecords = { ...state.mealRecords, [targetDate]: updatedDateRecord };
      saveToStorage(STORE_KEY, {
        ...get(),
        mealRecords: updatedRecords,
        currentMealType: mealType,
        currentDate: targetDate,
      });
      return {
        mealRecords: updatedRecords,
        currentMealType: mealType,
        currentDate: targetDate,
      };
    });
  },

  setMealFoods: (mealType, foods, date) => {
    const targetDate = date || get().currentDate;
    set((state) => {
      const dateRecord = state.mealRecords[targetDate] || {};
      const updatedDateRecord = { ...dateRecord, [mealType]: foods };
      const updatedRecords = { ...state.mealRecords, [targetDate]: updatedDateRecord };
      saveToStorage(STORE_KEY, { ...get(), mealRecords: updatedRecords });
      return { mealRecords: updatedRecords };
    });
  },

  setCurrentMealType: (mealType) => {
    set((state) => {
      saveToStorage(STORE_KEY, { ...get(), currentMealType: mealType });
      return { currentMealType: mealType };
    });
  },

  setCurrentDate: (date) => {
    set((state) => {
      saveToStorage(STORE_KEY, { ...get(), currentDate: date });
      return { currentDate: date };
    });
  },

  getMealCarbs: (mealType, date) => {
    const targetDate = date || get().currentDate;
    const dateRecord = get().mealRecords[targetDate] || {};
    const foods = dateRecord[mealType] || [];
    return foods.reduce((sum, f) => sum + f.carbs, 0);
  },

  getDateMealSummary: (date) => {
    const dateRecord = get().mealRecords[date] || {};
    let totalCarbs = 0;
    let totalCalories = 0;
    let mealCount = 0;
    Object.values(dateRecord).forEach((foods) => {
      if (foods && foods.length > 0) {
        mealCount++;
        foods.forEach((f) => {
          totalCarbs += f.carbs;
          totalCalories += f.calories;
        });
      }
    });
    return { totalCarbs: Math.round(totalCarbs * 10) / 10, totalCalories: Math.round(totalCalories), mealCount };
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

  replaceWeeklyMenuFood: (dayIndex, mealType, foodIndex, newFood) => {
    set((state) => {
      const newWeeklyMenu = [...state.weeklyMenu];
      const dayMenu = { ...newWeeklyMenu[dayIndex] };
      const mealFoods = [...(dayMenu[mealType as keyof WeeklyMenuDay] || [])];
      if (foodIndex >= 0 && foodIndex < mealFoods.length) {
        mealFoods[foodIndex] = newFood;
      } else {
        mealFoods.push(newFood);
      }
      dayMenu[mealType as keyof WeeklyMenuDay] = mealFoods;
      newWeeklyMenu[dayIndex] = dayMenu;

      const newMenuFoodNames = new Set<string>();
      newWeeklyMenu.forEach((day) => {
        ['breakfast', 'lunch', 'dinner', 'snack'].forEach((m) => {
          (day[m as keyof WeeklyMenuDay] || []).forEach((f) => newMenuFoodNames.add(f.name));
        });
      });

      const keptItems = state.shoppingItems.filter((item) =>
        newMenuFoodNames.has(item.name)
      );

      const keptNames = new Set(keptItems.map((i) => i.name));
      const newItems: ShoppingItem[] = [];
      newMenuFoodNames.forEach((name) => {
        if (!keptNames.has(name)) {
          const found = mockFoodDatabase.find((f) => f.name === name);
          const category = found
            ? found.carbs > 20
              ? '主食'
              : found.protein > 10
              ? '肉类'
              : found.carbs > 5
              ? '蔬菜'
              : '蛋奶'
            : '其他';
          const quantity = found
            ? `${found.portion}${found.unit}`
            : '适量';
          newItems.push({
            id: `shop_${Date.now()}_${name}`,
            name,
            quantity,
            checked: false,
            category,
          });
        }
      });

      const finalShopping = [...keptItems, ...newItems];

      saveToStorage(STORE_KEY, {
        ...get(),
        weeklyMenu: newWeeklyMenu,
        shoppingItems: finalShopping,
      });
      return { weeklyMenu: newWeeklyMenu, shoppingItems: finalShopping };
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
          mealRecords: saved.mealRecords || initMealRecords(),
          currentDate: saved.currentDate || getTodayStr(),
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
