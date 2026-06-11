import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';

const PlanPage: React.FC = () => {
  const [activeDay, setActiveDay] = useState(0);
  const shoppingItems = useAppStore((s) => s.shoppingItems);
  const toggleShoppingItem = useAppStore((s) => s.toggleShoppingItem);
  const weeklyMenu = useAppStore((s) => s.weeklyMenu);

  const weekDays = [
    { name: '周一', date: '15' },
    { name: '周二', date: '16' },
    { name: '周三', date: '17' },
    { name: '周四', date: '18' },
    { name: '周五', date: '19' },
    { name: '周六', date: '20' },
    { name: '周日', date: '21' },
  ];

  const dayMenu = weeklyMenu[activeDay] || weeklyMenu[0];

  const mealBlocks = useMemo(() => [
    { icon: '🌅', name: '早餐', items: dayMenu?.breakfast || [], calories: '约 350 千卡' },
    { icon: '☀️', name: '午餐', items: dayMenu?.lunch || [], calories: '约 520 千卡' },
    { icon: '🌙', name: '晚餐', items: dayMenu?.dinner || [], calories: '约 450 千卡' },
    { icon: '🍎', name: '加餐', items: dayMenu?.snack || [], calories: '约 100 千卡' },
  ], [dayMenu]);

  const reminders = [
    { date: '18', month: '1月', title: '血糖复查', desc: '空腹血糖 + 糖化血红蛋白', type: 'upcoming', tag: '本周' },
    { date: '25', month: '1月', title: '医生复诊', desc: '内分泌科 王医生', type: 'later', tag: '下周' },
    { date: '01', month: '2月', title: '眼底检查', desc: '眼科常规检查', type: 'later', tag: '下月' },
  ];

  const goals = [
    { name: '碳水化合物', current: 180, target: 200, unit: 'g', percent: 90 },
    { name: '热量', current: 1650, target: 1800, unit: '千卡', percent: 92 },
    { name: '蛋白质', current: 75, target: 80, unit: 'g', percent: 94 },
    { name: '脂肪', current: 55, target: 60, unit: 'g', percent: 92 },
  ];

  const checkedCount = shoppingItems.filter(item => item.checked).length;
  const totalCount = shoppingItems.length;
  const categories = [...new Set(shoppingItems.map(item => item.category))];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.weekSelector}>
        <Text className={styles.weekTitle}>本周菜单</Text>
      </View>

      <ScrollView scrollX className={styles.dayTabs}>
        {weekDays.map((day, index) => (
          <View
            key={index}
            className={classnames(styles.dayTab, activeDay === index && styles.active)}
            onClick={() => setActiveDay(index)}
          >
            <Text className={styles.dayName}>{day.name}</Text>
            <Text className={styles.dayDate}>{day.date}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.menuSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>📅</Text>
            {weekDays[activeDay]?.name}菜单
          </Text>
        </View>

        {mealBlocks.map((meal, mIndex) => (
          <View key={mIndex} className={styles.mealBlock}>
            <View className={styles.mealHeader}>
              <Text className={styles.mealIcon}>{meal.icon}</Text>
              <Text className={styles.mealName}>{meal.name}</Text>
              <Text className={styles.mealCalories}>{meal.calories}</Text>
            </View>
            <View className={styles.mealItems}>
              {meal.items.map((item, iIndex) => (
                <View key={iIndex} className={styles.mealItem}>
                  <Image className={styles.mealItemImg} src={item.image} mode="aspectFill" />
                  <Text className={styles.mealItemName}>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>🛒</Text>
            购物清单
          </Text>
        </View>

        <View className={styles.shoppingSummary}>
          <View className={styles.summaryInfo}>
            <Text className={styles.summaryIcon}>✅</Text>
            <View>
              <Text className={styles.summaryText}>已完成 {checkedCount}/{totalCount}</Text>
              <Text className={styles.summarySub}>本周采购进度</Text>
            </View>
          </View>
          <Text className={styles.summaryProgress}>
            {totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0}%
          </Text>
        </View>

        {categories.map((category) => (
          <View key={category} className={styles.shoppingCategory}>
            <Text className={styles.categoryTitle}>{category}</Text>
            <View className={styles.shoppingItems}>
              {shoppingItems
                .filter(item => item.category === category)
                .map((item) => (
                  <View
                    key={item.id}
                    className={classnames(styles.shoppingItem, item.checked && styles.checked)}
                    onClick={() => toggleShoppingItem(item.id)}
                  >
                    <View className={classnames(styles.checkbox, item.checked && styles.checked)}>
                      {item.checked && <Text className={styles.checkIcon}>✓</Text>}
                    </View>
                    <Text className={styles.itemName}>{item.name}</Text>
                    <Text className={styles.itemQuantity}>{item.quantity}</Text>
                  </View>
                ))}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>📅</Text>
            复查日提醒
          </Text>
          <Text className={styles.editBtn}>添加</Text>
        </View>
        <View className={styles.reminderList}>
          {reminders.map((reminder, index) => (
            <View key={index} className={styles.reminderItem}>
              <View className={styles.reminderDate}>
                <Text className={styles.reminderDay}>{reminder.date}</Text>
                <Text className={styles.reminderMonth}>{reminder.month}</Text>
              </View>
              <View className={styles.reminderInfo}>
                <Text className={styles.reminderTitle}>{reminder.title}</Text>
                <Text className={styles.reminderDesc}>{reminder.desc}</Text>
              </View>
              <View className={classnames(styles.reminderTag, styles[reminder.type])}>
                <Text>{reminder.tag}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.goalSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text>🎯</Text>
            营养目标
          </Text>
        </View>
        <View className={styles.goalItems}>
          {goals.map((goal, index) => (
            <View key={index} className={styles.goalItem}>
              <View className={styles.goalInfo}>
                <Text className={styles.goalName}>{goal.name}</Text>
                <Text className={styles.goalValue}>
                  {goal.current}/{goal.target}{goal.unit}
                </Text>
              </View>
              <View className={styles.goalBar}>
                <View
                  className={classnames(styles.goalProgress, goal.percent < 60 && styles.warning)}
                  style={{ width: `${goal.percent}%` }}
                />
              </View>
              <Text className={styles.goalPercent}>{goal.percent}%</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default PlanPage;
