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

  const handleShare = () => {
    const shareText = `【健康摘要报告】\n生成时间：${report.generatedAt}\n统计周期：${report.period}\n\n🩸 血糖概览\n平均血糖：${report.avgGlucose} mmol/L\n偏高次数：${report.highCount} 次\n偏低次数：${report.lowCount} 次\n记录总条数：${glucoseRecords.length} 条\n\n📋 健康概况\n平均体重：${report.avgWeight} kg\n运动次数：${report.exerciseCount} 次\n用药依从率：${report.medicineCompliance}%\n\n🤖 AI 评估总结\n${report.summary}\n\n——由控糖助手生成`;
    Taro.setClipboardData({
      data: shareText,
      success: () => {
        Taro.showModal({
          title: '分享内容已复制',
          content: '健康摘要报告内容已复制到剪贴板，可直接粘贴发送给医生或亲友。',
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

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>📝</Text>
            AI 评估总结
          </Text>
          <Text className={styles.summaryText}>{report.summary}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text>💡</Text>
            改善建议
          </Text>
          <View className={styles.adviceList}>
            <View className={styles.adviceItem}>
              <Text className={styles.adviceIcon}>1️⃣</Text>
              <Text className={styles.adviceText}>
                继续保持规律饮食，注意碳水化合物的摄入量，优先选择低 GI 食物
              </Text>
            </View>
            <View className={styles.adviceItem}>
              <Text className={styles.adviceIcon}>2️⃣</Text>
              <Text className={styles.adviceText}>
                建议餐后 30-60 分钟进行轻度运动，如散步 15-20 分钟
              </Text>
            </View>
            <View className={styles.adviceItem}>
              <Text className={styles.adviceIcon}>3️⃣</Text>
              <Text className={styles.adviceText}>
                按时服药/注射胰岛素，避免漏服，如有不适及时就医
              </Text>
            </View>
            <View className={styles.adviceItem}>
              <Text className={styles.adviceIcon}>4️⃣</Text>
              <Text className={styles.adviceText}>
                保持良好睡眠习惯，建议每天 22:00 前入睡，睡眠 7-8 小时
              </Text>
            </View>
          </View>
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
