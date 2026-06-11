import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import type { GlucoseRecord } from '@/types/glucose';

const mealLabelMap: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

const TrendsPage: React.FC = () => {
  const glucoseRecords = useAppStore((s) => s.glucoseRecords);
  const mealRecords = useAppStore((s) => s.mealRecords);
  const getMealCarbs = useAppStore((s) => s.getMealCarbs);

  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const rangeDays = timeRange === '7d' ? 7 : 30;

  const dateList = useMemo(() => {
    const list: string[] = [];
    const today = new Date();
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      list.push(`${y}-${m}-${day}`);
    }
    return list;
  }, [rangeDays]);

  const trendData = useMemo(() => {
    return dateList.map((date) => {
      const dayRecords = glucoseRecords.filter((r) => r.date === date);
      const values = dayRecords.map((r) => r.value);
      const avgValue = values.length > 0
        ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
        : 0;
      const maxValue = values.length > 0 ? Math.max(...values) : 0;
      const minValue = values.length > 0 ? Math.min(...values) : 0;
      return {
        date: date.slice(5),
        avgValue,
        maxValue,
        minValue,
        recordsCount: values.length,
      };
    });
  }, [dateList, glucoseRecords]);

  const avgValues = trendData.filter((d) => d.recordsCount > 0).map((d) => d.avgValue);
  const avgValue = avgValues.length > 0
    ? (avgValues.reduce((s, v) => s + v, 0) / avgValues.length).toFixed(1)
    : '0.0';
  const maxValue = avgValues.length > 0 ? Math.max(...avgValues).toFixed(1) : '0.0';
  const minValue = avgValues.length > 0 ? Math.min(...avgValues).toFixed(1) : '0.0';
  const normalCount = avgValues.filter((v) => v > 0 && v < 7.8 && v > 3.9).length;
  const normalRate = avgValues.length > 0 ? Math.round((normalCount / avgValues.length) * 100) : 0;

  const abnormalList = useMemo(() => {
    return glucoseRecords
      .filter((r) => r.status === 'high' || r.status === 'danger' || r.status === 'low')
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
      .slice(0, 10);
  }, [glucoseRecords]);

  const handleAbnormalClick = (record: GlucoseRecord) => {
    let extra = '';
    if (record.mealType) {
      const carbs = getMealCarbs(record.mealType, record.date);
      extra = `\n\n对应餐次：${mealLabelMap[record.mealType] || record.mealType}\n餐食碳水：${Math.round(carbs)}g`;
      const mealFoods = mealRecords[record.date]?.[record.mealType] || [];
      if (mealFoods.length > 0) {
        const foodNames = mealFoods.map((f) => f.name).join('、');
        extra += `\n食物组成：${foodNames}`;
      }
    }
    Taro.showModal({
      title: `异常血糖详情 · ${record.date} ${record.time}`,
      content: `${record.typeLabel}：${record.value} mmol/L${extra}\n\n${record.status === 'low' ? '💡 建议：及时补充15g碳水（如半杯果汁、3块方糖），15分钟后复测。' : '💡 建议：回顾当餐饮食结构，增加餐后轻度运动，持续偏高请就医。'}`,
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#10B981',
    });
  };

  const mealGlucoseAnalysis = useMemo(() => {
    const afterMealRecords = glucoseRecords.filter((r) =>
      r.type === 'after_meal' && r.mealType
    );
    const analysisMap: Record<string, { count: number; highCount: number; avgCarbs: number; avgGlucose: number }> = {};
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((mt) => {
      analysisMap[mt] = { count: 0, highCount: 0, avgCarbs: 0, avgGlucose: 0 };
    });
    afterMealRecords.forEach((r) => {
      const mt = r.mealType!;
      const a = analysisMap[mt];
      const carbs = getMealCarbs(mt, r.date);
      a.count += 1;
      a.highCount += (r.status === 'high' || r.status === 'danger') ? 1 : 0;
      a.avgCarbs += carbs;
      a.avgGlucose += r.value;
    });
    Object.keys(analysisMap).forEach((mt) => {
      const a = analysisMap[mt];
      if (a.count > 0) {
        a.avgCarbs = Math.round(a.avgCarbs / a.count);
        a.avgGlucose = Math.round((a.avgGlucose / a.count) * 10) / 10;
      }
    });
    return analysisMap;
  }, [glucoseRecords, getMealCarbs]);

  const latestWeight = 67.5;
  const weightDiff = -0.8;
  const avgSleep = 7.2;
  const goodSleepDays = 5;

  const glucoseRange = (() => {
    const vals = trendData.map((d) => d.avgValue).filter((v) => v > 0);
    if (vals.length === 0) return { max: 10, min: 3, range: 7 };
    const max = Math.max(...vals, 8);
    const min = Math.min(...vals, 4);
    return { max, min, range: max - min || 1 };
  })();

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.timeTabs}>
        <View
          className={classnames(styles.timeTab, timeRange === '7d' && styles.active)}
          onClick={() => setTimeRange('7d')}
        >
          <Text>近7天</Text>
        </View>
        <View
          className={classnames(styles.timeTab, timeRange === '30d' && styles.active)}
          onClick={() => setTimeRange('30d')}
        >
          <Text>近30天</Text>
        </View>
      </View>

      <View className={styles.chartCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>
            <Text>📈</Text>
            血糖趋势
          </Text>
        </View>

        <View className={styles.chartContainer}>
          <View className={styles.normalRange} style={{ top: '30%', bottom: '30%' }} />
          <View className={styles.miniChart} style={{ height: '100%', alignItems: 'flex-end' }}>
            {trendData.map((item, index) => {
              if (item.recordsCount === 0) {
                return <View key={index} className={styles.miniBar} style={{ height: '8%', opacity: 0.3 }} />;
              }
              const height = glucoseRange.range > 0
                ? ((item.avgValue - glucoseRange.min) / glucoseRange.range * 60 + 20)
                : 50;
              const isHigh = item.avgValue > 7.8;
              const isLow = item.avgValue < 3.9;
              return (
                <View
                  key={index}
                  className={styles.miniBar}
                  style={{
                    height: `${Math.min(100, Math.max(10, height))}%`,
                    background: isHigh
                      ? 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)'
                      : isLow
                      ? 'linear-gradient(180deg, #F87171 0%, #EF4444 100%)'
                      : 'linear-gradient(180deg, #34D399 0%, #10B981 100%)',
                  }}
                />
              );
            })}
          </View>
        </View>

        <View className={styles.chartLabels}>
          {trendData.map((item, index) => (
            <Text key={index} className={styles.chartLabel}>{item.date}</Text>
          ))}
        </View>

        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, styles.primary)}>{avgValue}</Text>
            <Text className={styles.statLabel}>平均值</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, styles.warning)}>{maxValue}</Text>
            <Text className={styles.statLabel}>最高值</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, styles.error)}>{minValue}</Text>
            <Text className={styles.statLabel}>最低值</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={classnames(styles.statValue, styles.success)}>{normalRate}%</Text>
            <Text className={styles.statLabel}>达标率</Text>
          </View>
        </View>
      </View>

      <View className={styles.insightCard}>
        <Text className={styles.insightTitle}>
          <Text>🤖</Text>
          AI 健康洞察
        </Text>
        <View className={styles.insightContent}>
          <View className={styles.insightItem}>
            <Text className={styles.insightIcon}>💡</Text>
            <Text>
              {avgValues.length === 0
                ? '暂无足够血糖记录，建议每日至少监测4次血糖。'
                : `近${rangeDays}天平均血糖 ${avgValue} mmol/L，达标率 ${normalRate}%，${normalRate >= 70 ? '整体控制良好。' : '需要加强监测和管理。'}`}
            </Text>
          </View>
          {Object.entries(mealGlucoseAnalysis).find(([, a]) => a.count > 0 && a.highCount > 0) ? (
            <View className={styles.insightItem}>
              <Text className={styles.insightIcon}>🍚</Text>
              <Text>
                {Object.entries(mealGlucoseAnalysis)
                  .filter(([, a]) => a.count > 0 && a.highCount > 0)
                  .map(([mt, a]) =>
                    `${mealLabelMap[mt]}餐后偏高 ${a.highCount}/${a.count} 次，平均碳水 ${a.avgCarbs}g，血糖 ${a.avgGlucose} mmol/L`
                  )
                  .join('；')}。
              </Text>
            </View>
          ) : (
            <View className={styles.insightItem}>
              <Text className={styles.insightIcon}>✅</Text>
              <Text>餐后血糖控制平稳，各餐次餐后偏高情况较少。</Text>
            </View>
          )}
          <View className={styles.insightItem}>
            <Text className={styles.insightIcon}>😴</Text>
            <Text>睡眠质量差的日子血糖波动较大，建议保持规律作息。</Text>
          </View>
        </View>
      </View>

      <View className={styles.twoColumn}>
        <View className={styles.smallCard}>
          <Text className={styles.smallCardTitle}>
            <Text>⚖️</Text>
            体重变化
          </Text>
          <Text className={styles.weightValue}>
            {latestWeight}
            <Text className={styles.weightUnit}> kg</Text>
          </Text>
          <Text className={classnames(styles.weightChange, weightDiff > 0 && styles.up)}>
            {weightDiff > 0 ? '+' : ''}{weightDiff} kg 较上周
          </Text>
          <View className={styles.miniChart}>
            {[65, 66, 66.5, 67, 67.2, 67.5, 67.5].map((w, i) => {
              const height = ((w - 64) / 4 * 50 + 30);
              return <View key={i} className={styles.miniBar} style={{ height: `${height}%` }} />;
            })}
          </View>
        </View>

        <View className={styles.smallCard}>
          <Text className={styles.smallCardTitle}>
            <Text>😴</Text>
            睡眠质量
          </Text>
          <Text className={styles.sleepValue}>
            {avgSleep}
            <Text className={styles.sleepUnit}> h</Text>
          </Text>
          <Text className={styles.sleepQuality}>
            {goodSleepDays} 天睡眠良好
          </Text>
          <View className={styles.miniChart}>
            {[6.5, 7, 7.5, 7, 8, 7.2, 7.2].map((d, i) => {
              const height = ((d - 5) / 4 * 50 + 30);
              return (
                <View
                  key={i}
                  className={classnames(styles.miniBar, styles.sleep)}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </View>
        </View>
      </View>

      <View className={styles.abnormalSection}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>
            <Text>⚠️</Text>
            异常记录
          </Text>
          <Text style={{ fontSize: 24, color: '#9CA3AF' }}>共 {abnormalList.length} 次</Text>
        </View>
        {abnormalList.length > 0 ? (
          <View className={styles.abnormalList}>
            {abnormalList.map((item) => {
              const carbs = item.mealType ? getMealCarbs(item.mealType, item.date) : 0;
              return (
                <View
                  key={item.id}
                  className={styles.abnormalItem}
                  onClick={() => handleAbnormalClick(item)}
                >
                  <View className={styles.abnormalInfo}>
                    <Text className={styles.abnormalIcon}>
                      {item.status === 'low' ? '�' : '�'}
                    </Text>
                    <View>
                      <Text className={styles.abnormalText}>
                        {item.date.slice(5)} {item.time} · {item.typeLabel}
                        {item.mealType && `（${mealLabelMap[item.mealType]}）`}
                      </Text>
                      {item.mealType && carbs > 0 && (
                        <Text className={styles.abnormalCarbs}>餐食碳水 {Math.round(carbs)}g</Text>
                      )}
                    </View>
                  </View>
                  <Text className={classnames(styles.abnormalValue, styles[item.status])}>
                    {item.value} <Text style={{ fontSize: 20 }}>mmol/L</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View className={styles.emptyAbnormal}>
            <Text>🎉 暂无异常记录，继续保持！</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TrendsPage;
