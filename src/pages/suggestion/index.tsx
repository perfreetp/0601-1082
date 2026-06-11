import React from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { mockSuggestions, mockFoodDatabase } from '@/data/foods';

const SuggestionPage: React.FC = () => {
  const suggestions = mockSuggestions;

  const substitutePairs = [
    {
      from: { name: '白米饭', carbs: '28g', image: mockFoodDatabase[0].imageUrl },
      to: { name: '糙米饭', carbs: '23g', image: mockFoodDatabase[0].imageUrl },
      diff: '碳水减少 18%',
    },
    {
      from: { name: '白面包', carbs: '50g', image: mockFoodDatabase[6].imageUrl },
      to: { name: '全麦面包', carbs: '41g', image: mockFoodDatabase[6].imageUrl },
      diff: '膳食纤维增加 3 倍',
    },
  ];

  const orderSteps = [
    { title: '先喝汤', desc: '餐前喝一小碗清淡的汤' },
    { title: '再吃菜', desc: '多吃绿叶蔬菜，增加饱腹感' },
    { title: '吃蛋白', desc: '适量摄入优质蛋白质' },
    { title: '最后主食', desc: '粗细搭配，控制份量' },
  ];

  const snackReminders = [
    { time: '10:00', label: '上午加餐', food: '原味坚果 10g', desc: '约 60 千卡' },
    { time: '15:30', label: '下午加餐', food: '苹果 1 个', desc: '约 52 千卡' },
    { time: '21:00', label: '睡前', food: '温牛奶 200ml', desc: '预防夜间低血糖' },
  ];

  const handleSubstituteClick = () => {
    Taro.showToast({ title: '已添加替换建议', icon: 'success' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.evaluationCard}>
        <View className={styles.evalHeader}>
          <Text className={styles.evalIcon}>🏆</Text>
          <Text className={styles.evalTitle}>今日饮食评分</Text>
        </View>
        <View className={styles.evalScore}>
          <Text className={styles.scoreValue}>85</Text>
          <Text className={styles.scoreLabel}>分</Text>
        </View>
        <Text className={styles.evalDesc}>
          今天的饮食整体搭配合理，碳水化合物控制良好。建议增加蔬菜摄入量，主食可以适当替换为全谷物。
        </Text>
        <View className={styles.evalTags}>
          <View className={styles.evalTag}><Text>✓ 蛋白质充足</Text></View>
          <View className={styles.evalTag}><Text>✓ 热量适中</Text></View>
          <View className={styles.evalTag}><Text>⚠ 蔬菜偏少</Text></View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>🔄</Text>
          <Text className={styles.sectionTitle}>食物替换建议</Text>
        </View>
        {substitutePairs.map((pair, index) => (
          <View key={index} className={styles.substituteCard} onClick={handleSubstituteClick}>
            <View className={styles.foodInfo}>
              <Image className={styles.foodImg} src={pair.from.image} mode="aspectFill" />
              <View className={styles.foodDetails}>
                <Text className={styles.foodName}>{pair.from.name}</Text>
                <Text className={styles.foodStats}>{pair.from.carbs} 碳水</Text>
              </View>
            </View>
            <Text className={styles.arrowIcon}>→</Text>
            <View className={styles.foodInfo}>
              <Image className={styles.foodImg} src={pair.to.image} mode="aspectFill" />
              <View className={styles.foodDetails}>
                <Text className={styles.foodName} style={{ color: '#10B981' }}>{pair.to.name}</Text>
                <Text className={styles.foodStats}>{pair.diff}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>🥗</Text>
          <Text className={styles.sectionTitle}>正确进食顺序</Text>
        </View>
        <View className={styles.orderSteps}>
          {orderSteps.map((step, index) => (
            <View key={index} className={styles.orderStep}>
              <View className={styles.stepNumber}>
                <Text>{index + 1}</Text>
              </View>
              <View className={styles.stepContent}>
                <Text className={styles.stepTitle}>{step.title}</Text>
                <Text className={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className={styles.tipBox} style={{ marginTop: 24 }}>
          <Text className={styles.tipTitle}>💡 为什么进食顺序很重要？</Text>
          <Text className={styles.tipContent}>
            按照"汤→菜→蛋白→主食"的顺序进食，可以延缓碳水化合物的吸收，降低餐后血糖峰值约 15-20%，同时增加饱腹感，减少总摄入量。
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>🍎</Text>
          <Text className={styles.sectionTitle}>加餐提醒</Text>
        </View>
        {snackReminders.map((snack, index) => (
          <View key={index} className={styles.snackReminder}>
            <View className={styles.snackTime}>
              <Text className={styles.timeValue}>{snack.time}</Text>
              <Text className={styles.timeLabel}>{snack.label}</Text>
            </View>
            <View className={styles.snackInfo}>
              <Text className={styles.snackName}>{snack.food}</Text>
              <Text className={styles.snackDesc}>{snack.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionIcon}>📚</Text>
          <Text className={styles.sectionTitle}>控糖小贴士</Text>
        </View>
        <View className={styles.tipBox}>
          <Text className={styles.tipTitle}>🍚 主食粗细搭配</Text>
          <Text className={styles.tipContent}>
            建议粗粮占主食的 1/3 以上，如糙米、燕麦、玉米、红薯等，富含膳食纤维，有助于平稳血糖。
          </Text>
        </View>
        <View className={styles.tipBox}>
          <Text className={styles.tipTitle}>🥤 少喝含糖饮料</Text>
          <Text className={styles.tipContent}>
            含糖饮料升糖速度快，建议选择白开水、淡茶水或无糖饮品。
          </Text>
        </View>
        <View className={styles.tipBox}>
          <Text className={styles.tipTitle}>🏃 餐后适量运动</Text>
          <Text className={styles.tipContent}>
            餐后 30-60 分钟进行轻度运动，如散步 15-20 分钟，可有效降低餐后血糖。
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SuggestionPage;
