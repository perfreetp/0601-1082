import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import {
  mockGlucoseTrend,
  mockWeightHistory,
  mockSleepHistory,
} from '@/data/glucoseRecords';

const TrendsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const trendData = mockGlucoseTrend;
  const weightData = mockWeightHistory;
  const sleepData = mockSleepHistory;

  const avgValue = (trendData.reduce((sum, d) => sum + d.avgValue, 0) / trendData.length).toFixed(1);
  const maxValue = Math.max(...trendData.map(d => d.maxValue)).toFixed(1);
  const minValue = Math.min(...trendData.map(d => d.minValue)).toFixed(1);
  const normalCount = trendData.filter(d => d.avgValue < 7.8 && d.avgValue > 3.9).length;
  const normalRate = Math.round((normalCount / trendData.length) * 100);

  const latestWeight = weightData[weightData.length - 1]?.weight || 0;
  const weightDiff = (latestWeight - weightData[0]?.weight || 0).toFixed(1);

  const avgSleep = (sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length).toFixed(1);
  const goodSleepDays = sleepData.filter(d => d.quality === 'good' || d.quality === 'excellent').length;

  const getMaxHeight = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    return { max, min, range: max - min };
  };

  const glucoseRange = getMaxHeight(trendData.map(d => d.avgValue));

  const abnormalRecords = [
    { id: '1', type: 'high', text: '周四午餐后血糖偏高', value: '10.1 mmol/L' },
    { id: '2', type: 'low', text: '周二清晨血糖偏低', value: '3.5 mmol/L' },
    { id: '3', type: 'high', text: '周六晚餐后血糖偏高', value: '9.8 mmol/L' },
  ];

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
                    height: `${height}%`,
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
            <Text>本周血糖平均 {avgValue} mmol/L，达标率 {normalRate}%，整体控制良好。</Text>
          </View>
          <View className={styles.insightItem}>
            <Text className={styles.insightIcon}>⚠️</Text>
            <Text>周四和周六餐后血糖偏高，建议减少当餐主食量或增加餐后运动。</Text>
          </View>
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
          <Text className={classnames(styles.weightChange, parseFloat(weightDiff) > 0 && styles.up)}>
            {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff} kg 较上周
          </Text>
          <View className={styles.miniChart}>
            {weightData.map((item, index) => {
              const weights = weightData.map(w => w.weight);
              const maxW = Math.max(...weights);
              const minW = Math.min(...weights);
              const range = maxW - minW || 1;
              const height = ((item.weight - minW) / range * 50 + 30);
              return (
                <View
                  key={item.id}
                  className={styles.miniBar}
                  style={{ height: `${height}%` }}
                />
              );
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
            {sleepData.map((item, index) => {
              const durations = sleepData.map(s => s.duration);
              const maxD = Math.max(...durations);
              const minD = Math.min(...durations);
              const range = maxD - minD || 1;
              const height = ((item.duration - minD) / range * 50 + 30);
              return (
                <View
                  key={item.id}
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
          <Text style={{ fontSize: 24, color: '#9CA3AF' }}>共 {abnormalRecords.length} 次</Text>
        </View>
        <View className={styles.abnormalList}>
          {abnormalRecords.map((item) => (
            <View key={item.id} className={styles.abnormalItem}>
              <View className={styles.abnormalInfo}>
                <Text className={styles.abnormalIcon}>
                  {item.type === 'high' ? '📈' : '📉'}
                </Text>
                <Text className={styles.abnormalText}>{item.text}</Text>
              </View>
              <Text className={classnames(styles.abnormalValue, styles[item.type])}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default TrendsPage;
