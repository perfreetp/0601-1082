import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import type { FoodItem as FoodItemType } from '@/types/food';

interface FoodItemProps {
  food: FoodItemType;
  showAdjust?: boolean;
  onIncrease?: () => void;
  onDecrease?: () => void;
}

const FoodItemComponent: React.FC<FoodItemProps> = ({
  food,
  showAdjust = false,
  onIncrease,
  onDecrease,
}) => {
  return (
    <View className={styles.foodItem}>
      <Image className={styles.image} src={food.imageUrl} mode="aspectFill" />
      <View className={styles.content}>
        <Text className={styles.name}>{food.name}</Text>
        <View className={styles.info}>
          <Text className={styles.infoItem}>
            <Text className={styles.highlight}>{food.carbs}g</Text> 碳水
          </Text>
          <Text className={styles.infoItem}>{food.calories} 千卡</Text>
          <Text className={styles.infoItem}>{food.cookingMethod}</Text>
        </View>
      </View>
      {showAdjust ? (
        <View className={styles.actions}>
          <View className={styles.adjustBtn} onClick={onDecrease}>-</View>
          <Text className={styles.portion}>
            {food.portion}{food.unit}
          </Text>
          <View className={styles.adjustBtn} onClick={onIncrease}>+</View>
        </View>
      ) : (
        <Text className={styles.portion}>
          {food.portion}{food.unit}
        </Text>
      )}
    </View>
  );
};

export default FoodItemComponent;
