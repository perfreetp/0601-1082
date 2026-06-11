import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import FoodItemComponent from '@/components/FoodItem';
import { mockRecognitionResult, mockFoodDatabase } from '@/data/foods';
import { useAppStore } from '@/store';
import type { FoodItem } from '@/types/food';

const CameraPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [previewImage, setPreviewImage] = useState('');
  const addFoodsToMeal = useAppStore((s) => s.addFoodsToMeal);

  const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0);
  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);

  const handleTakePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFile = res.tempFilePaths[0];
        setPreviewImage(tempFile);
        startRecognition();
      },
      fail: (err) => {
        console.error('[Camera] 拍照失败', err);
        simulateRecognition();
      },
    });
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        const tempFile = res.tempFilePaths[0];
        setPreviewImage(tempFile);
        startRecognition();
      },
      fail: (err) => {
        console.error('[Camera] 选择图片失败', err);
        simulateRecognition();
      },
    });
  };

  const startRecognition = () => {
    setIsScanning(true);
    setHasResult(false);
    setTimeout(() => {
      setIsScanning(false);
      setFoods([...mockRecognitionResult.foods]);
      setHasResult(true);
      console.log('[Camera] 识别完成', mockRecognitionResult);
    }, 2000);
  };

  const simulateRecognition = () => {
    setPreviewImage(mockFoodDatabase[0].imageUrl);
    startRecognition();
  };

  const handleIncrease = (index: number) => {
    setFoods((prev) => {
      const newFoods = [...prev];
      const food = { ...newFoods[index] };
      food.portion = Math.round(food.portion * 1.1);
      food.carbs = Math.round(food.carbs * 1.1 * 10) / 10;
      food.calories = Math.round(food.calories * 1.1);
      newFoods[index] = food;
      return newFoods;
    });
  };

  const handleDecrease = (index: number) => {
    setFoods((prev) => {
      const newFoods = [...prev];
      const food = { ...newFoods[index] };
      if (food.portion > 10) {
        food.portion = Math.round(food.portion * 0.9);
        food.carbs = Math.round(food.carbs * 0.9 * 10) / 10;
        food.calories = Math.round(food.calories * 0.9);
        newFoods[index] = food;
      }
      return newFoods;
    });
  };

  const handleSave = () => {
    const now = new Date();
    const hour = now.getHours();
    let mealType = 'lunch';
    if (hour < 10) mealType = 'breakfast';
    else if (hour < 14) mealType = 'lunch';
    else if (hour < 20) mealType = 'dinner';
    else mealType = 'snack';

    const foodsWithNewIds = foods.map((f, i) => ({
      ...f,
      id: `${Date.now()}_${i}`,
    }));

    addFoodsToMeal(mealType, foodsWithNewIds);
    Taro.showToast({ title: `已保存到${mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : mealType === 'dinner' ? '晚餐' : '加餐'}`, icon: 'success' });
    console.log('[Camera] 保存到餐盘', { mealType, foods: foodsWithNewIds, totalCarbs, totalCalories });
  };

  const goToSuggestion = () => {
    Taro.navigateTo({ url: '/pages/suggestion/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>AI 拍照识食</Text>
        <Text className={styles.subtitle}>智能识别，精准控糖</Text>
      </View>

      <View className={styles.previewArea}>
        {previewImage ? (
          <Image className={styles.previewImage} src={previewImage} mode="aspectFill" />
        ) : (
          <View className={styles.placeholder}>
            <Text className={styles.placeholderIcon}>🍽️</Text>
            <Text className={styles.placeholderText}>点击拍照识别食物</Text>
          </View>
        )}
        {isScanning && (
          <>
            <View className={styles.scanLine} />
            <Text className={styles.scanningText}>AI 识别中...</Text>
          </>
        )}
      </View>

      <View className={styles.actionArea}>
        <View className={styles.secondaryBtn} onClick={handleChooseImage}>
          <Text className={styles.secondaryIcon}>🖼️</Text>
        </View>
        <View className={styles.cameraBtn} onClick={handleTakePhoto}>
          <Text className={styles.cameraIcon}>📷</Text>
        </View>
        <View className={styles.secondaryBtn} onClick={simulateRecognition}>
          <Text className={styles.secondaryIcon}>✨</Text>
        </View>
      </View>

      {hasResult && (
        <View className={styles.resultCard}>
          <View className={styles.resultHeader}>
            <Text className={styles.resultTitle}>
              <Text>🥗</Text>
              识别结果
            </Text>
            <Text className={styles.confidence}>
              置信度 {Math.round(mockRecognitionResult.confidence * 100)}%
            </Text>
          </View>

          <View className={styles.nutritionSummary}>
            <View className={styles.nutritionItem}>
              <Text className={styles.nutritionValue}>{totalCarbs}g</Text>
              <Text className={styles.nutritionLabel}>碳水化合物</Text>
            </View>
            <View className={styles.nutritionItem}>
              <Text className={styles.nutritionValue}>{totalCalories}</Text>
              <Text className={styles.nutritionLabel}>千卡热量</Text>
            </View>
          </View>

          <Text className={styles.foodListTitle}>识别到 {foods.length} 种食物</Text>
          <View className={styles.foodList}>
            {foods.map((food, index) => (
              <FoodItemComponent
                key={food.id + index}
                food={food}
                showAdjust
                onIncrease={() => handleIncrease(index)}
                onDecrease={() => handleDecrease(index)}
              />
            ))}
          </View>

          <View className={styles.actionBtns}>
            <View className={styles.saveBtn} onClick={handleSave}>
              <Text>保存到餐盘</Text>
            </View>
            <View className={styles.suggestBtn} onClick={goToSuggestion}>
              <Text>饮食建议</Text>
            </View>
          </View>
        </View>
      )}

      {!hasResult && (
        <View className={styles.quickTips}>
          <Text className={styles.tipTitle}>💡 拍摄技巧</Text>
          <Text className={styles.tipText}>
            请将食物放置在光线充足的地方，保持镜头与餐盘平行，拍摄完整的餐食画面，识别效果更佳。
          </Text>
        </View>
      )}
    </View>
  );
};

export default CameraPage;
