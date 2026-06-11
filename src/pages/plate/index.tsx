import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import FoodItemComponent from '@/components/FoodItem';
import { mockFoodDatabase, mealTypes, cookingMethods } from '@/data/foods';
import { useAppStore } from '@/store';
import type { FoodItem } from '@/types/food';

const PlatePage: React.FC = () => {
  const [activeMeal, setActiveMeal] = useState('lunch');
  const mealFoods = useAppStore((s) => s.mealFoods);
  const setMealFoods = useAppStore((s) => s.setMealFoods);

  const currentFoods = mealFoods[activeMeal] || [];

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
    const foods = [...(mealFoods[activeMeal] || [])];
    const food = { ...foods[index] };
    food.portion = Math.round(food.portion * 1.1);
    food.carbs = Math.round(food.carbs * 1.1 * 10) / 10;
    food.calories = Math.round(food.calories * 1.1);
    foods[index] = food;
    setMealFoods(activeMeal, foods);
  };

  const handleDecrease = (index: number) => {
    const foods = [...(mealFoods[activeMeal] || [])];
    const food = { ...foods[index] };
    if (food.portion > 10) {
      food.portion = Math.round(food.portion * 0.9);
      food.carbs = Math.round(food.carbs * 0.9 * 10) / 10;
      food.calories = Math.round(food.calories * 0.9);
      foods[index] = food;
      setMealFoods(activeMeal, foods);
    }
  };

  const changeCookingMethod = (foodIndex: number, method: string) => {
    const foods = [...(mealFoods[activeMeal] || [])];
    foods[foodIndex] = { ...foods[foodIndex], cookingMethod: method };
    setMealFoods(activeMeal, foods);
  };

  const handleAddFood = () => {
    const newFood = { ...mockFoodDatabase[Math.floor(Math.random() * 5) + 5], id: `${Date.now()}` };
    const foods = [...(mealFoods[activeMeal] || []), newFood];
    setMealFoods(activeMeal, foods);
    Taro.showToast({ title: '已添加食物', icon: 'success' });
    console.log('[Plate] 添加食物', newFood);
  };

  const handleSave = () => {
    Taro.showToast({ title: '已保存记录', icon: 'success' });
    console.log('[Plate] 保存饮食记录', { activeMeal, foods: currentFoods, nutrition });
  };

  const goToSuggestion = () => {
    Taro.navigateTo({ url: '/pages/suggestion/index' });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollX className={styles.mealTabs}>
        {mealTypes.map((meal) => (
          <View
            key={meal.key}
            className={classnames(styles.mealTab, activeMeal === meal.key && styles.active)}
            onClick={() => setActiveMeal(meal.key)}
          >
            <Text>{meal.icon} {meal.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.nutritionCard}>
        <Text className={styles.cardTitle}>
          <Text>📊</Text>
          营养概览
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
