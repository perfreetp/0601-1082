import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import FoodItemComponent from '@/components/FoodItem';
import { mockFoodDatabase, mealTypes, cookingMethods } from '@/data/foods';
import { useAppStore } from '@/store';
import type { FoodItem } from '@/types/food';

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const tStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  const toStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  if (dStr === tStr) return '今天';
  if (dStr === yStr) return '昨天';
  if (dStr === toStr) return '明天';
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}/${d.getDate()} ${weekdays[d.getDay()]}`;
}

function getDateList(): string[] {
  const list: string[] = [];
  const base = new Date();
  for (let i = -6; i <= 0; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    list.push(`${y}-${m}-${day}`);
  }
  return list;
}

const PlatePage: React.FC = () => {
  const mealRecords = useAppStore((s) => s.mealRecords);
  const setMealFoods = useAppStore((s) => s.setMealFoods);
  const activeMeal = useAppStore((s) => s.currentMealType);
  const setCurrentMealType = useAppStore((s) => s.setCurrentMealType);
  const currentDate = useAppStore((s) => s.currentDate);
  const setCurrentDate = useAppStore((s) => s.setCurrentDate);
  const getDateMealSummary = useAppStore((s) => s.getDateMealSummary);
  const getMealCarbs = useAppStore((s) => s.getMealCarbs);

  const [showTimeline, setShowTimeline] = useState(false);

  const dateList = useMemo(() => getDateList(), []);
  const daySummary = useMemo(() => getDateMealSummary(currentDate), [currentDate, getDateMealSummary]);
  const dateRecord = mealRecords[currentDate] || {};
  const currentFoods = dateRecord[activeMeal] || [];

  const nutrition = useMemo(() => {
    const carbs = currentFoods.reduce((sum, f) => sum + f.carbs, 0);
    const calories = currentFoods.reduce((sum, f) => sum + f.calories, 0);
    const protein = currentFoods.reduce((sum, f) => sum + f.protein * (f.portion / 100), 0);
    const fat = currentFoods.reduce((sum, f) => sum + f.fat * (f.portion / 100), 0);
    return {
      carbs: Math.round(carbs * 10) / 10,
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      fat: Math.round(fat * 10) / 10,
    };
  }, [currentFoods]);

  const handleIncrease = (index: number) => {
    const foods = [...currentFoods];
    const food = { ...foods[index] };
    food.portion = Math.round(food.portion * 1.1);
    food.carbs = Math.round(food.carbs * 1.1 * 10) / 10;
    food.calories = Math.round(food.calories * 1.1);
    foods[index] = food;
    setMealFoods(activeMeal, foods, currentDate);
  };

  const handleDecrease = (index: number) => {
    const foods = [...currentFoods];
    const food = { ...foods[index] };
    if (food.portion > 10) {
      food.portion = Math.round(food.portion * 0.9);
      food.carbs = Math.round(food.carbs * 0.9 * 10) / 10;
      food.calories = Math.round(food.calories * 0.9);
      foods[index] = food;
      setMealFoods(activeMeal, foods, currentDate);
    }
  };

  const changeCookingMethod = (foodIndex: number, method: string) => {
    const foods = [...currentFoods];
    foods[foodIndex] = { ...foods[foodIndex], cookingMethod: method };
    setMealFoods(activeMeal, foods, currentDate);
  };

  const handleAddFood = () => {
    const newFood = { ...mockFoodDatabase[Math.floor(Math.random() * mockFoodDatabase.length)], id: `${Date.now()}` };
    const foods = [...currentFoods, newFood];
    setMealFoods(activeMeal, foods, currentDate);
    Taro.showToast({ title: '已添加食物', icon: 'success' });
  };

  const handleSave = () => {
    Taro.showToast({ title: '已保存记录', icon: 'success' });
  };

  const goToSuggestion = () => {
    Taro.navigateTo({ url: '/pages/suggestion/index' });
  };

  const handlePrevDay = () => {
    const idx = dateList.indexOf(currentDate);
    if (idx > 0) setCurrentDate(dateList[idx - 1]);
  };

  const handleNextDay = () => {
    const idx = dateList.indexOf(currentDate);
    if (idx < dateList.length - 1) setCurrentDate(dateList[idx + 1]);
  };

  return (
    <View className={styles.page}>
      <View className={styles.dateBar}>
        <View className={styles.dateNav} onClick={handlePrevDay}>
          <Text className={styles.dateNavArrow}>‹</Text>
        </View>
        <ScrollView scrollX className={styles.dateStrip}>
          {dateList.map((d) => (
            <View
              key={d}
              className={classnames(styles.dateItem, currentDate === d && styles.active)}
              onClick={() => setCurrentDate(d)}
            >
              <Text className={styles.dateLabel}>{formatDateLabel(d)}</Text>
              <Text className={styles.dateSub}>{d.slice(5)}</Text>
            </View>
          ))}
        </ScrollView>
        <View className={styles.dateNav} onClick={handleNextDay}>
          <Text className={styles.dateNavArrow}>›</Text>
        </View>
      </View>

      <View className={styles.daySummaryCard}>
        <Text className={styles.daySummaryTitle}>
          <Text>📅</Text>
          {formatDateLabel(currentDate)} · 饮食总览
        </Text>
        <View className={styles.dayStats}>
          <View className={styles.dayStat}>
            <Text className={styles.dayStatValue}>{daySummary.totalCarbs}g</Text>
            <Text className={styles.dayStatLabel}>碳水</Text>
          </View>
          <View className={styles.dayStat}>
            <Text className={styles.dayStatValue}>{daySummary.totalCalories}</Text>
            <Text className={styles.dayStatLabel}>千卡</Text>
          </View>
          <View className={styles.dayStat}>
            <Text className={styles.dayStatValue}>{daySummary.mealCount}/4</Text>
            <Text className={styles.dayStatLabel}>餐次</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollX className={styles.mealTabs}>
        {mealTypes.map((meal) => {
          const carbs = getMealCarbs(meal.key, currentDate);
          return (
            <View
              key={meal.key}
              className={classnames(styles.mealTab, activeMeal === meal.key && styles.active)}
              onClick={() => setCurrentMealType(meal.key)}
            >
              <Text className={styles.mealTabIcon}>{meal.icon}</Text>
              <Text className={styles.mealTabLabel}>{meal.label}</Text>
              <Text className={styles.mealTabCarbs}>{Math.round(carbs)}g 碳水</Text>
            </View>
          );
        })}
      </ScrollView>

      <View className={styles.nutritionCard}>
        <Text className={styles.cardTitle}>
          <Text>📊</Text>
          本餐营养
        </Text>
        <View className={styles.nutritionGrid}>
          <View className={styles.nutritionItem}>
            <Text className={styles.nutritionValue}>{nutrition.carbs}g</Text>
            <Text className={styles.nutritionLabel}>碳水化合物</Text>
          </View>
          <View className={styles.nutritionItem}>
            <Text className={styles.nutritionValue}>{nutrition.calories}</Text>
            <Text className={styles.nutritionLabel}>千卡热量</Text>
          </View>
          <View className={styles.nutritionItem}>
            <Text className={styles.nutritionValue}>{nutrition.protein}g</Text>
            <Text className={styles.nutritionLabel}>蛋白质</Text>
          </View>
          <View className={styles.nutritionItem}>
            <Text className={styles.nutritionValue}>{nutrition.fat}g</Text>
            <Text className={styles.nutritionLabel}>脂肪</Text>
          </View>
        </View>
      </View>

      <View className={styles.foodSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>🍽️</Text>
            食物列表
            <Text className={styles.foodCount}>({currentFoods.length}种)</Text>
          </Text>
          <View className={styles.addFoodBtn} onClick={handleAddFood}>
            <Text>+ 添加</Text>
          </View>
        </View>

        {currentFoods.length > 0 ? (
          currentFoods.map((food, index) => (
            <View key={food.id + index}>
              <FoodItemComponent
                food={food}
                showAdjust
                onIncrease={() => handleIncrease(index)}
                onDecrease={() => handleDecrease(index)}
              />
              <View className={styles.cookingMethod}>
                <Text className={styles.methodLabel}>烹饪方式:</Text>
                <View className={styles.methodTags}>
                  {cookingMethods.slice(0, 5).map((method) => (
                    <View
                      key={method}
                      className={classnames(
                        styles.methodTag,
                        food.cookingMethod === method && styles.active
                      )}
                      onClick={() => changeCookingMethod(index, method)}
                    >
                      <Text>{method}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🥗</Text>
            <Text className={styles.emptyText}>还没有添加食物</Text>
            <Text className={styles.emptyHint}>点击上方「+ 添加」或从拍照页识别保存</Text>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.secondaryAction} onClick={goToSuggestion}>
          <Text>💡</Text>
        </View>
        <View className={styles.saveBtn} onClick={handleSave}>
          <Text>保存记录</Text>
        </View>
      </View>
    </View>
  );
};

export default PlatePage;
