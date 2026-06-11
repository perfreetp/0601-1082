import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import type { HealthReport } from '@/store';

const ReportPage: React.FC = () => {
  const reportId = Taro.getCurrentInstance().router?.params?.reportId;
  const healthReports = useAppStore((s) => s.healthReports);
  const glucoseRecords = useAppStore((s) => s.glucoseRecords);

  const report = healthReports.find((r) => r.id === reportId);

  if (!report) {
    return (
      <View className={styles.page}>
        <View className={styles.reportCard}>
          <Text>报告未找到</Text>
        </View>
      </View>
    );
  }

  const abnormalList = report.abnormalGlucoseList || [];
  const highCarbMeals = report.highCarbMeals || [];
  const doctorAdvice = report.doctorAdvice || [];

  const handleShare = () => {
    const abnormalText = abnormalList.length > 0
      ? abnormalList.slice(0, 5).map(r =>
        `  ${r.date} ${r.time} · ${r.type}：${r.value} mmol/L（${r.status === 'low' ? '偏低' : r.status === 'high' ? '偏高' : '过高'}）`
      ).join('\n')
      : '  无异常血糖记录';

    const highCarbText = highCarbMeals.length > 0
      ? highCarbMeals.map(m =>
        `  ${m.date} ${m.mealLabel}：碳水 ${m.totalCarbs}g，${m.foodCount} 种食物`
      ).join('\n')
      : '  无高碳水餐次（>50g）';

    const adviceText = doctorAdvice.length > 0
      ? doctorAdvice.map((a, i) => `  ${i + 1}. ${a}`).join('\n')
      : '  继续保持当前控糖方案';

    const shareText = `【健康摘要报告】
生成时间：${report.generatedAt}
统计周期：${report.period}

━━━ 🩸 血糖概览 ━━━
平均血糖：${report.avgGlucose} mmol/L
偏高次数：${report.highCount} 次
偏低次数：${report.lowCount} 次
记录总条数：${glucoseRecords.length} 条

━━━ 📋 健康概况 ━━━
平均体重：${report.avgWeight} kg
运动次数：${report.exerciseCount} 次
用药依从率：${report.medicineCompliance}%
综合评级：${report.highCount === 0 ? '优秀' : report.highCount <= 2 ? '良好' : '需改善'}

━━━ ⚠️ 异常血糖记录 ━━━
${abnormalText}

━━━ 🍚 高碳水餐次 ━━━
${highCarbText}

━━━ 👨‍⚕️ 医生建议 ━━━
${adviceText}

━━━ 📝 AI 评估总结 ━━━
${report.summary}

—— 由控糖助手生成，仅供参考，具体请遵医嘱`;

    Taro.setClipboardData({
      data: shareText,
      success: () => {
        Taro.showModal({
          title: '分享内容已复制',
          content: '完整的健康摘要报告内容已复制到剪贴板，包含血糖、饮食和医生建议，可直接粘贴发送给医生或亲友。',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#10B981',
        });
      },
      fail: () => {
        Taro.showModal({
          title: '健康报告分享',
          content: shareText,
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#10B981',
        });
      },
    });
    console.log('[Report] 分享报告', report.id, shareText);
  };

  const handleClose = () => {
    Taro.switchTab({ url: '/pages/family/index' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.reportCard}>
        <View className={styles.reportHeader}>
          <Text className={styles.reportTitle}>📊 健康摘要报告</Text>
          <Text className={styles.reportTime}>生成时间：{report.generatedAt}</Text>
          <Text className={styles.reportPeriod}>{report.period}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>🩸</Text>
            血糖概览
          </Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.primary)}>
                {report.avgGlucose}
              </Text>
              <Text className={styles.statLabel}>平均血糖 (mmol/L)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.warning)}>
                {report.highCount}
              </Text>
              <Text className={styles.statLabel}>偏高次数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.error)}>
                {report.lowCount}
              </Text>
              <Text className={styles.statLabel}>偏低次数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.success)}>
                {glucoseRecords.length}
              </Text>
              <Text className={styles.statLabel}>记录总条数</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>📋</Text>
            健康概况
          </Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.primary)}>
                {report.avgWeight}
              </Text>
              <Text className={styles.statLabel}>平均体重 (kg)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.success)}>
                {report.exerciseCount}
              </Text>
              <Text className={styles.statLabel}>运动次数</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.primary)}>
                {report.medicineCompliance}%
              </Text>
              <Text className={styles.statLabel}>用药依从率</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={classnames(styles.statValue, styles.success)}>
                {report.highCount === 0 ? '优秀' : report.highCount <= 2 ? '良好' : '需改善'}
              </Text>
              <Text className={styles.statLabel}>综合评级</Text>
            </View>
          </View>
        </View>

        {abnormalList.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text>⚠️</Text>
              异常血糖记录
            </Text>
            <View className={styles.abnormalList}>
              {abnormalList.slice(0, 6).map((item, idx) => (
                <View key={idx} className={styles.abnormalItem}>
                  <View className={styles.abnormalLeft}>
                    <Text className={styles.abnormalDate}>{item.date}</Text>
                    <Text className={styles.abnormalTime}>{item.time}</Text>
                  </View>
                  <View className={styles.abnormalCenter}>
                    <Text className={styles.abnormalType}>{item.type}</Text>
                  </View>
                  <View className={styles.abnormalRight}>
                    <Text className={classnames(styles.abnormalValue, styles[item.status])}>
                      {item.value}
                    </Text>
                    <Text className={styles.abnormalUnit}>mmol/L</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {highCarbMeals.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text>🍚</Text>
              高碳水餐次（&gt;50g）
            </Text>
            <View className={styles.highCarbList}>
              {highCarbMeals.map((meal, idx) => (
                <View key={idx} className={styles.highCarbItem}>
                  <View className={styles.highCarbInfo}>
                    <Text className={styles.highCarbTitle}>
                      {meal.date} · {meal.mealLabel}
                    </Text>
                    <Text className={styles.highCarbMeta}>{meal.foodCount} 种食物</Text>
                  </View>
                  <View className={styles.highCarbValue}>
                    <Text className={styles.highCarbNumber}>{meal.totalCarbs}</Text>
                    <Text className={styles.highCarbUnit}>g 碳水</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {doctorAdvice.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text>👨‍⚕️</Text>
              医生建议
            </Text>
            <View className={styles.doctorAdviceList}>
              {doctorAdvice.map((advice, idx) => (
                <View key={idx} className={styles.adviceItem}>
                  <View className={styles.adviceNum}>{idx + 1}</View>
                  <Text className={styles.adviceText}>{advice}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>📝</Text>
            AI 评估总结
          </Text>
          <Text className={styles.summaryText}>{report.summary}</Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.shareBtn} onClick={handleShare}>
          <Text>分享给医生</Text>
        </View>
        <View className={styles.closeBtn} onClick={handleClose}>
          <Text>完成查看</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ReportPage;
